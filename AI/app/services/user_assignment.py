from typing import List
import numpy as np
from app.services.distance_matrix import fetch_distance_matrix_with_route
from app.services.music_similarity import calculate_music_similarity
from app.services.outliers import assign_all_outliers_with_dbscan
from app.services.route_utils import calculate_haversine_distance, get_route_points
from app.models import Event, Ride


def filter_rides(rides):
    drivers = [ride for ride in rides if ride["driver"] is True]
    passengers = [ride for ride in rides if ride["driver"] is False]
    return drivers, passengers

def assign_users_with_route(passengers: List[dict], drivers: List[dict], final_point: dict, location_weight: float, music_weight: float) -> List[dict]:
    """
    Assign users to drivers based on proximity and music preferences, considering drivers' routes.

    Args:
        passengers (list): List of passenger rides as dictionaries.
        drivers (list): List of driver rides as dictionaries.
        final_point (dict): Destination event with latitude and longitude.
        location_weight (float): Weight for location similarity.
        music_weight (float): Weight for music similarity.

    Returns:
        List[dict]: List of passengers with their assigned rides.
    """

    def promote_eligible_drivers():
        nonlocal passengers, drivers
        outliers = [passenger for passenger in passengers if passenger["driverId"] is None]
        eligible_users = [
            passenger for passenger in passengers if passenger["canBeDriver"] and passenger["driverId"] is None
        ]

        for candidate in eligible_users:
            candidate_distances = fetch_distance_matrix_with_route([candidate], outliers)[0]
            coverage_count = sum(
                1 for distance in candidate_distances if distance <= 2000
            )

            if coverage_count > 0:
                new_driver = candidate.copy()
                new_driver["driver"] = True
                new_driver["vehicleId"] = new_driver.get("vehicle", {}).get("id", None)
                new_driver["pickupRadius"] = new_driver.get("pickupRadius", 10.0)  # Default pickup radius
                new_driver["passengerRides"] = []  

                drivers.append(new_driver)
                passengers.remove(candidate)
                return True

        return False
    
    def assign_from_start_point():
        nonlocal passengers, drivers, distance_matrix, music_similarity_matrix

        if not drivers:
            return [], {}

        combined_scores = np.zeros_like(distance_matrix)
        driver_capacities = [driver["vehicle"]["maxPassengers"] for driver in drivers]

        for user_idx, user in enumerate(passengers):
            for driver_idx, driver in enumerate(drivers):
                if distance_matrix[user_idx][driver_idx] <= driver["pickupRadius"] * 1000:
                    location_score = 1 - (distance_matrix[user_idx][driver_idx] / np.max(distance_matrix))
                    music_score = music_similarity_matrix[user_idx][driver_idx]
                    combined_scores[user_idx][driver_idx] = (
                        location_weight * location_score + music_weight * music_score
                    )

        user_distances = [
            (user_idx, min(distance_matrix[user_idx])) for user_idx in range(len(passengers))
        ]
        user_distances.sort(key=lambda x: x[1])

        for user_idx, _ in user_distances:
            valid_drivers = [
                driver_idx for driver_idx, driver in enumerate(drivers)
                if distance_matrix[user_idx][driver_idx] <= driver["pickupRadius"] * 1000
            ]

            if valid_drivers:
                best_driver_idx = max(valid_drivers, key=lambda idx: combined_scores[user_idx][idx])
                if driver_capacities[best_driver_idx] > 0:
                    passengers[user_idx]["driverId"] = drivers[best_driver_idx]["id"]
                    driver_capacities[best_driver_idx] -= 1
                else:
                    passengers[user_idx]["driverId"] = None
            else:
                passengers[user_idx]["driverId"] = None

        return driver_capacities


    driver_capacities = {}
    for d in drivers:
        if d.get("vehicle") and isinstance(d["vehicle"], dict):
            driver_capacities[d["id"]] = d["vehicle"].get("maxPassengers", 0)
        else:
            driver_capacities[d["id"]] = 0

    def assign_along_route():
        """
        For each driver, check route points and assign any passenger with no driver
        who is within pickupRadius. Also decrement capacity if assigned.
        """
        nonlocal passengers, drivers, driver_capacities

        if not drivers:
            return

        for driver in drivers:
            driver_id = driver["id"]
            # If this driver has no remaining seats, skip entirely
            if driver_capacities.get(driver_id, 0) <= 0:
                continue

            route_points = get_route_points(driver, {
                "latitude": final_point["latitude"],
                "longitude": final_point["longitude"]
            })
            if not route_points:
                continue  # no route found for this driver

            # Loop over passengers to see who can be assigned
            for passenger in passengers:
                # If no seats left, break out for this driver
                if driver_capacities[driver_id] <= 0:
                    break

                if passenger["driverId"] is None:
                    for route_lat, route_lng in route_points:
                        distance_km = calculate_haversine_distance(
                            passenger["pickupLat"], passenger["pickupLong"],
                            route_lat, route_lng
                        )
                        # Compare distance (in km) to pickupRadius
                        if distance_km <= driver["pickupRadius"]:
                            # Assign passenger to this driver
                            passenger["driverId"] = driver_id
                            # Decrement capacity
                            driver_capacities[driver_id] -= 1
                            break  # assigned, go to next passenger

    
    while not drivers:
        if not promote_eligible_drivers():
            break
                                  
    while True:
        distance_matrix = fetch_distance_matrix_with_route(passengers, drivers)
        music_similarity_matrix = calculate_music_similarity(passengers, drivers)


        assign_along_route()

        outliers = [passenger for passenger in passengers if passenger["driverId"] is None]
        if not outliers:
            break

        if not promote_eligible_drivers():
            break
        
    print(outliers)
    for passenger in passengers:
      if passenger["driverId"] is None:
          passenger["outlier"] = True

    # 3) If we have outliers, do partial assignment
    if outliers:
        assign_all_outliers_with_dbscan(
            outliers,
            drivers,
            final_point,
            dbscan_eps_km=0.5,
            max_distance_meters=2000
        )

    return passengers + drivers
        
