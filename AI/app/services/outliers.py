import requests
from geopy.distance import geodesic
from sklearn.cluster import DBSCAN
from collections import defaultdict
from typing import List, Tuple
import numpy as np

from app.models import Ride
from app.services.pickup_utils import adjust_pickup_point_on_segment, interpolate_on_route, min_distance_from_route, snap_to_road
from app.services.route_utils import get_route_points

def assign_all_outliers_with_dbscan(
    outliers: List[dict],
    drivers: List[dict],
    final_point: dict,
    dbscan_eps_km=0.5,
    max_distance_meters=2050
):

    if not outliers:
        return

    # Step 1) DBSCAN on outliers
    coords = []
    idx_to_passenger = {}
    for idx, p in enumerate(outliers):
        coords.append([p["pickupLat"], p["pickupLong"]])
        idx_to_passenger[idx] = p

    dbscan = DBSCAN(eps=dbscan_eps_km / 111.0, min_samples=1, metric='euclidean')
    labels = dbscan.fit_predict(coords)

    clusters = defaultdict(list)
    for idx, label in enumerate(labels):
        clusters[label].append(idx)


    # Step 3) For each cluster, attempt partial assignment
    for cluster_label, passenger_indices in clusters.items():
        # Gather all passenger dicts for this cluster
        cluster_passenger_ids = passenger_indices[:]
        cluster_size = len(cluster_passenger_ids)

        # Compute centroid of this cluster
        cluster_coords = [coords[i] for i in cluster_passenger_ids]
        lat_sum = sum(c[0] for c in cluster_coords)
        lon_sum = sum(c[1] for c in cluster_coords)
        centroid = (lat_sum / cluster_size, lon_sum / cluster_size)

        # Sort drivers by distance from route to centroid
        # We'll pick from the closest route onward
        driver_distances = []
        for d in drivers:
            route_points = get_route_points(d, final_point)
            if not route_points:
                continue
            dist = min_distance_from_route(route_points, centroid)
            driver_distances.append((d, dist))

        driver_distances.sort(key=lambda x: x[1])  # ascending

        # Attempt to assign the entire cluster in partial segments
        for (driver, dist) in driver_distances:
            if cluster_size == 0:
                break  # already assigned all

            # how many seats left
            seats_left =  driver["vehicle"].get("maxPassengers", 0) - driver["registeredCount"]
            print(driver)
            print(seats_left)
            if seats_left <= 0:
                continue

            # number of passengers we can assign to this driver
            assign_num = min(seats_left, cluster_size)

            if assign_num <= 0:
                continue

            # We'll take the first `assign_num` passengers from the cluster
            # (or any sub-selection logic you prefer)
            sub_group_ids = cluster_passenger_ids[:assign_num]
            # remove them from the cluster
            cluster_passenger_ids = cluster_passenger_ids[assign_num:]
            cluster_size -= assign_num

            # Now we pick a route-based pickup location for THIS driver
            route_points = get_route_points(driver, final_point)
            if not route_points:
                continue

            # 1) Interpolate centroid onto route
            route_pickup = interpolate_on_route(route_points, centroid)
            # 2) Snap to nearest road
            snapped_pickup = snap_to_road(route_pickup[0], route_pickup[1])
            # 3) Optionally re-interpolate the snapped point if you want strictly on-route
            validated_pickup = interpolate_on_route(route_points, snapped_pickup)

            # For each passenger in this sub-group, set their pickup & driverId
            for pid in sub_group_ids:
                passenger = idx_to_passenger[pid]
                passenger_loc = (passenger["pickupLat"], passenger["pickupLong"])

                final_pickup = adjust_pickup_point_on_segment(
                    validated_pickup,
                    passenger_loc,
                    max_distance_meters
                )

                passenger["pickupLat"] = final_pickup[0]
                passenger["pickupLong"] = final_pickup[1]
                passenger["driverId"] = driver["id"]

            # reduce the driver's capacity
            driver["registeredCount"] += assign_num