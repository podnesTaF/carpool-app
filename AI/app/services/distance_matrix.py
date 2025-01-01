from typing import List
import numpy as np

from app.models import Ride
from app.services.route_utils import calculate_haversine_distance, get_route_points
import googlemaps
from os import getenv

gmaps = googlemaps.Client(key=getenv("GMAPS_API_KEY"))


def fetch_distance_matrix_with_route(users: List[Ride], drivers: List[Ride], batch_size=10):
    """
    Compute the distance matrix for users and drivers considering the driver's route.

    Args:
        users (list): List of users.
        drivers (list): List of drivers.
        batch_size (int): Batch size for distance computation.

    Returns:
        np.array: Distance matrix considering driver routes.
    """
    distance_matrix = np.full((len(users), len(drivers)), float('inf'))

    for driver_idx, driver in enumerate(drivers):
        # Fetch route points for the driver

        print("driver", driver)
        route_points = get_route_points(driver, {"latitude": driver["event"]["latitude"], "longitude": driver["event"]["longitude"]})


        for batch_start in range(0, len(users), batch_size):
            batch_users = users[batch_start:batch_start + batch_size]

            for user_idx, user in enumerate(batch_users):

                # Calculate the minimum distance from the user to any point on the driver's route
                min_distance = float('inf')
                print("user", user)
                for route_lat, route_lng in route_points:
                    distance = calculate_haversine_distance(
                        user["pickupLat"],
                        user["pickupLong"],
                        route_lat, route_lng
                    )
                    min_distance = min(min_distance, distance)

                # Convert to meters and update the distance matrix
                distance_matrix[batch_start + user_idx][driver_idx] = min_distance * 1000

    return distance_matrix