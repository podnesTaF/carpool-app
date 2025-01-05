import numpy as np
import googlemaps
from os import getenv

from app.models import Ride


gmaps = googlemaps.Client(key=getenv("GMAPS_API_KEY"))

def get_route_points(driver: Ride, finish_point: dict):
    """
    Fetch route points from Google Directions API.

    Args:
        driver (Ride): Driver's start location.
        finish_point (dict): Event location with 'latitude' and 'longitude'.

    Returns:
        list: A list of route points as (latitude, longitude).
    """
    driver_start = f"{driver["pickupLat"]},{driver["pickupLong"]}"
    event_location = f"{finish_point['latitude']},{finish_point['longitude']}"

    directions = gmaps.directions(
        driver_start,
        event_location,
        mode="driving"
    )

    route_points = [
        (step["start_location"]["lat"], step["start_location"]["lng"])
        for leg in directions[0]["legs"]
        for step in leg["steps"]
    ]
    # Include the final destination
    route_points.append((finish_point["latitude"], finish_point["longitude"]))

    return route_points


def calculate_haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float):
    """
    Calculate the Haversine distance between two points on the Earth.

    Args:
        lat1, lon1: Latitude and longitude of the first point.
        lat2, lon2: Latitude and longitude of the second point.

    Returns:
        float: Distance in kilometers.
    """
    R = 6371  # Earth radius in kilometers
    lat1, lon1, lat2, lon2 = map(np.radians, [lat1, lon1, lat2, lon2])
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    a = np.sin(dlat / 2)**2 + np.cos(lat1) * np.cos(lat2) * np.sin(dlon / 2)**2
    c = 2 * np.arctan2(np.sqrt(a), np.sqrt(1 - a))
    return R * c


def filter_passengers_by_pickup_radius(passengers, route_points, pickup_radius):
    """
    Filter passengers based on whether they fall within the pickup radius of any route point.
    
    Args:
        passengers (list): List of passengers with latitude and longitude.
        route_points (list): List of tuples representing route coordinates (latitude, longitude).
        pickup_radius (float): Pickup radius in kilometers.
    
    Returns:
        list, list: Two lists of passengers - assigned and outliers.
    """
    assigned = []
    outliers = []
    
    for passenger in passengers:
        assigned_flag = False
        for route_lat, route_lng in route_points:
            distance = calculate_haversine_distance(
                passenger["latitude"], passenger["longitude"],
                route_lat, route_lng
            )
            if distance <= pickup_radius:
                assigned.append(passenger)
                assigned_flag = True
                break
        if not assigned_flag:
            outliers.append(passenger)
    
    return assigned, outliers
