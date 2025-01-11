from os import getenv
import folium  # Only if you want to produce a map visualization – otherwise omit.
from typing import List, Tuple
from geopy.distance import geodesic

import requests
from sklearn.cluster import DBSCAN
from collections import defaultdict

# This is optional; you can store your key in environment or pass it in.
API_KEY = getenv("GMAPS_API_KEY")


def snap_to_road(lat: float, lng: float, api_key=API_KEY, max_retries=3, timeout=10) -> Tuple[float, float]:
    """
    Snap a point to the nearest road using Google Maps Roads API.
    """
    url = (f"https://roads.googleapis.com/v1/snapToRoads"
           f"?path={lat},{lng}&key={api_key}&interpolate=false")

    for attempt in range(max_retries):
        try:
            response = requests.get(url, timeout=timeout)
            if response.status_code == 200:
                data = response.json()
                if 'snappedPoints' in data and data['snappedPoints']:
                    snapped_point = data['snappedPoints'][0]['location']
                    return (snapped_point['latitude'], snapped_point['longitude'])
                else:
                    # No snapped points
                    return (lat, lng)
        except requests.exceptions.RequestException:
            pass
    return (lat, lng)


def interpolate_on_route(route: List[Tuple[float, float]], point: Tuple[float, float]) -> Tuple[float, float]:
    """
    Finds the closest point on the route (consisting of consecutive lat/lng pairs)
    to the given point by simple linear interpolation on each segment.
    """
    min_distance = float('inf')
    best_point = route[0]

    for i in range(len(route) - 1):
        seg_start = route[i]
        seg_end = route[i + 1]

        # vector for the segment
        dx, dy = (seg_end[0] - seg_start[0]), (seg_end[1] - seg_start[1])
        seg_len_sq = dx*dx + dy*dy
        if seg_len_sq == 0:
            # Degenerate segment
            dist = geodesic(point, seg_start).meters
            if dist < min_distance:
                min_distance = dist
                best_point = seg_start
        else:
            # project the point onto [seg_start, seg_end]
            t = ((point[0] - seg_start[0]) * dx + (point[1] - seg_start[1]) * dy) / seg_len_sq
            t = max(0, min(1, t))
            interp = (seg_start[0] + t*dx, seg_start[1] + t*dy)

            dist = geodesic(point, interp).meters
            if dist < min_distance:
                min_distance = dist
                best_point = interp

    return best_point


def adjust_pickup_point_on_segment(
    pickup_point: Tuple[float, float], passenger_loc: Tuple[float, float], max_distance=2000
) -> Tuple[float, float]:
    """
    If passenger is more than `max_distance` meters from the computed pickup point,
    move the pickup point closer to the passenger by exactly `max_distance`.
    Otherwise return it as is.
    """
    distance = geodesic(pickup_point, passenger_loc).meters
    if distance <= max_distance:
        return pickup_point  # no adjustment needed

    ratio = max_distance / distance
    return (
        pickup_point[0] + ratio * (passenger_loc[0] - pickup_point[0]),
        pickup_point[1] + ratio * (passenger_loc[1] - pickup_point[1]),
    )


def min_distance_from_route(route: List[Tuple[float, float]], point: Tuple[float, float]) -> float:
    """
    Return the minimal geodesic distance (in meters) from the 'point' to any segment in 'route'.
    """
    # We can reuse `interpolate_on_route` to get the nearest route point, then compute distance.
    closest_point = interpolate_on_route(route, point)
    return geodesic(closest_point, point).meters

def validate_snapped_point(point, route):
    """Validate and adjust snapped points to ensure they are on the route."""
    lat, lng = point
    closest_point = interpolate_on_route(route, (lat, lng))
    print(f"Validated snapped point adjusted to: {closest_point}")
    return closest_point

def adjust_pickup_point(pickup_point, passenger, distance_meters=2000):
    """Move the pickup point closer to the passenger by the specified distance."""
    total_distance = geodesic(pickup_point, passenger).meters
    if total_distance <= distance_meters:
        return pickup_point  # No adjustment needed

    ratio = distance_meters / total_distance
    adjusted_point = (
        pickup_point[0] + ratio * (passenger[0] - pickup_point[0]),
        pickup_point[1] + ratio * (passenger[1] - pickup_point[1])
    )
    return adjusted_point

def assign_clustered_pickups(route, passengers, clustering_eps=0.5, driver_zone=2000):
    """
    Cluster passengers and assign a unique pickup point for each cluster such that
    the pickup point minimizes the maximum distance for all passengers in the cluster.
    Ensure pickup points are valid and on roads.
    """
    excluded_points = {route[0], route[len(route)//2], route[-1]}  # Exclude start, midpoint, and end

    # Cluster passengers based on proximity
    coords = [[p[0], p[1]] for p in passengers]
    clustering = DBSCAN(eps=clustering_eps / 111, min_samples=1, metric='euclidean').fit(coords)
    labels = clustering.labels_

    # Group passengers by cluster
    clusters = defaultdict(list)
    for passenger, label in zip(passengers, labels):
        clusters[label].append(passenger)

    assignments = {}
    pickup_points = []

    for cluster_label, cluster_passengers in clusters.items():
        # Calculate the centroid of the cluster
        centroid = calculate_centroid(cluster_passengers)

        # Interpolate the centroid onto the route
        best_pickup_point = interpolate_on_route(route, centroid)

        # Snap the pickup point to the nearest road
        snapped_point = snap_to_road(best_pickup_point[0], best_pickup_point[1])

        # Validate the snapped point
        validated_point = validate_snapped_point(snapped_point, route)

        # Assign all passengers in the cluster to the optimized pickup point
        for passenger in cluster_passengers:
            distance_to_pickup = geodesic(passenger, validated_point).meters
            if distance_to_pickup > driver_zone:
                # Move the pickup point closer to the passenger
                adjusted_pickup_point = adjust_pickup_point(validated_point, passenger, distance_meters=driver_zone)
                assignments[passenger] = adjusted_pickup_point

                # Add the adjusted pickup point to the list (ensuring uniqueness)
                if adjusted_pickup_point not in pickup_points:
                    pickup_points.append(adjusted_pickup_point)
            else:
                print(f"Passenger {passenger} is within 200m of a pickup point and will not be assigned.")

    # Debugging: Show assignment details
    for cluster_label, cluster_passengers in clusters.items():
        print(f"Cluster {cluster_label} passengers: {cluster_passengers}")
    print(f"Pickup points: {pickup_points}")

    return assignments, pickup_points


def calculate_centroid(passengers):
    """Calculate the centroid of a group of passengers."""
    lat = sum(p[0] for p in passengers) / len(passengers)
    lng = sum(p[1] for p in passengers) / len(passengers)
    return (lat, lng)

def interpolate_on_route(route, point):
    """Interpolate a point on the route such that it lies between two route points."""
    min_distance = float('inf')
    best_segment = None
    for i in range(len(route) - 1):
        segment_start = route[i]
        segment_end = route[i + 1]
        segment_distance = geodesic(segment_start, segment_end).kilometers

        # Project the point onto the segment
        dx, dy = segment_end[0] - segment_start[0], segment_end[1] - segment_start[1]
        projection = ((point[0] - segment_start[0]) * dx + (point[1] - segment_start[1]) * dy) / (dx * dx + dy * dy)
        projection = max(0, min(1, projection))
        interpolated_point = (
            segment_start[0] + projection * dx,
            segment_start[1] + projection * dy
        )

        # Calculate the distance from the point to the interpolated point
        distance_to_point = geodesic(point, interpolated_point).kilometers
        if distance_to_point < min_distance:
            min_distance = distance_to_point
            best_segment = interpolated_point

    return best_segment