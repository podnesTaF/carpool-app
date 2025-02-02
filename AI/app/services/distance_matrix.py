import math
from typing import List, Tuple
import numpy as np

from app.models import Ride
from app.services.route_utils import calculate_haversine_distance, get_route_points
import googlemaps
from os import getenv

gmaps = googlemaps.Client(key=getenv("GMAPS_API_KEY"))


DISTANCE_CACHE = {}

def fetch_distance_matrix_with_route(passengers: List[dict], drivers: List[dict]) -> np.ndarray:
    """
    (Your existing implementation for distance matrix fetching.)
    """
    if not passengers or not drivers:
        return np.array([])
    
    n_passengers = len(passengers)
    n_drivers = len(drivers)
    distance_matrix = np.full((n_passengers, n_drivers), np.inf)

    pairs_to_query = []
    pairs_map = {}  # (passenger_idx, driver_idx) -> cache_key

    for i, passenger in enumerate(passengers):
        p_lat = passenger["pickupLat"]
        p_lng = passenger["pickupLong"]
        for j, driver in enumerate(drivers):
            d_lat = driver["pickupLat"]
            d_lng = driver["pickupLong"]
            pickup_radius = driver.get("pickupRadius", 10.0) or 10  

            dist_km = calculate_haversine_distance(p_lat, p_lng, d_lat, d_lng)
            if dist_km <= pickup_radius:
                # Build cache key
                cache_key = (round(p_lat, 5), round(p_lng, 5),
                             round(d_lat, 5), round(d_lng, 5))
                
                if cache_key in DISTANCE_CACHE:
                    distance_matrix[i][j] = DISTANCE_CACHE[cache_key]
                else:
                    pairs_to_query.append((i, j, cache_key))

    if not pairs_to_query:
        return distance_matrix

    origins_dict = {}
    destinations_dict = {}

    for (i, j, ck) in pairs_to_query:
        pairs_map[(i, j)] = ck
        if i not in origins_dict:
            p = passengers[i]
            origins_dict[i] = f"{p['pickupLat']},{p['pickupLong']}"
        if j not in destinations_dict:
            d = drivers[j]
            destinations_dict[j] = f"{d['pickupLat']},{d['pickupLong']}"

    origin_indices = list(origins_dict.keys())
    destination_indices = list(destinations_dict.keys())

    origin_locations = [origins_dict[i] for i in origin_indices]
    destination_locations = [destinations_dict[j] for j in destination_indices]

    matrix_result = gmaps.distance_matrix(
        origins=origin_locations,
        destinations=destination_locations,
        mode='driving'
    )

    for row_i, row in enumerate(matrix_result["rows"]):
        o_idx = origin_indices[row_i]
        for col_j, element in enumerate(row["elements"]):
            d_idx = destination_indices[col_j]
            dist_m = float('inf')
            if element["status"] == "OK":
                dist_m = element["distance"]["value"]
            distance_matrix[o_idx][d_idx] = dist_m

            ck = pairs_map.get((o_idx, d_idx))
            if ck:
                DISTANCE_CACHE[ck] = dist_m

    return distance_matrix


def point_to_segment_distance(lat: float, lng: float,
                              lat1: float, lng1: float,
                              lat2: float, lng2: float) -> float:
    """
    Compute the approximate distance (in km) from a point (lat, lng)
    to a line segment defined by endpoints (lat1, lng1) and (lat2, lng2).

    This uses an equirectangular projection for a local approximation.
    """
    # Convert degrees to radians
    lat, lng = math.radians(lat), math.radians(lng)
    lat1, lng1 = math.radians(lat1), math.radians(lng1)
    lat2, lng2 = math.radians(lat2), math.radians(lng2)
    
    # Use the first endpoint's latitude as the reference for scaling longitude
    def project(lon, ref_lat):
        return lon * math.cos(ref_lat)
    
    # Convert to local Cartesian coordinates
    p_x, p_y = project(lng, lat1), lat
    a_x, a_y = project(lng1, lat1), lat1
    b_x, b_y = project(lng2, lat1), lat2

    # Vector from a to p
    ap_x = p_x - a_x
    ap_y = p_y - a_y
    # Vector from a to b
    ab_x = b_x - a_x
    ab_y = b_y - a_y

    # Compute the projection factor (t) of p onto ab
    ab_len_sq = ab_x**2 + ab_y**2
    if ab_len_sq == 0:
        # a and b are the same point
        dist = math.hypot(ap_x, ap_y)
        return dist * 6371  # Convert radian distance to km

    t = max(0, min(1, (ap_x * ab_x + ap_y * ab_y) / ab_len_sq))
    # Find the projection point
    proj_x = a_x + t * ab_x
    proj_y = a_y + t * ab_y

    # Distance (in radians) from p to the projection
    dist_rad = math.hypot(p_x - proj_x, p_y - proj_y)
    return dist_rad * 6371  # Earth's radius in km


def point_to_polyline_distance(lat: float, lng: float,
                               polyline: List[Tuple[float, float]]) -> float:
    """
    Given a point (lat, lng) and a polyline (a list of (lat, lng) points),
    compute the minimum distance (in km) from the point to the polyline.
    """
    min_distance = float('inf')
    for i in range(len(polyline) - 1):
        seg_start = polyline[i]
        seg_end = polyline[i + 1]
        dist = point_to_segment_distance(lat, lng,
                                         seg_start[0], seg_start[1],
                                         seg_end[0], seg_end[1])
        if dist < min_distance:
            min_distance = dist
    return min_distance


def assign_along_route(passengers: List[dict],
                       drivers: List[dict],
                       final_point: dict) -> None:
    """
    For each driver, fetch the route points from the driver's start to the final destination,
    then assign any unassigned passenger whose pickup location is within the driver's pickupRadius.
    
    This version uses a geometric projection (point-to-polyline distance) to avoid excessive
    calls to Google APIs and the inaccuracy of checking every route point with Haversine.
    """
    if not drivers:
        return

    for driver in drivers:
        driver_id = driver["id"]

        # Skip driver if already at capacity
        if driver["registeredCount"] >= driver["vehicle"].get("maxPassengers", 0):
            continue

        # Fetch the route points for the driver (optionally cache these results)
        route_points = get_route_points(driver, {
            "latitude": final_point["latitude"],
            "longitude": final_point["longitude"]
        })

        if not route_points:
            continue  # No route found for this driver

        # Loop over each unassigned passenger
        for passenger in passengers:
            # If driver is full, break out for this driver
            if driver["registeredCount"] >= driver["vehicle"].get("maxPassengers", 0):
                break

            if passenger.get("driverId") is not None:
                continue  # Passenger already assigned

            # Compute the minimum distance (in km) from the passenger's pickup to the driver's route
            dist_km = point_to_polyline_distance(passenger["pickupLat"],
                                                 passenger["pickupLong"],
                                                 route_points)

            # Use the driver's pickupRadius (assumed to be in km) for comparison
            if dist_km <= driver.get("pickupRadius", 10):
                # Assign passenger to driver
                passenger["driverId"] = driver_id
                driver["registeredCount"] += 1