from typing import List
import numpy as np
from app.services.distance_matrix import assign_along_route, fetch_distance_matrix_with_route, point_to_polyline_distance
from app.services.music_similarity import calculate_music_similarity
from app.services.outliers import assign_all_outliers_with_dbscan
from app.services.route_utils import calculate_haversine_distance, get_route_points
from app.models import Event, Ride


def filter_rides(rides):
    drivers = [ride for ride in rides if ride["driver"] is True]
    passengers = [ride for ride in rides if ride["driver"] is False]
    return drivers, passengers

def assign_users_with_route(passengers: List[dict], drivers: List[dict], final_point: dict, location_weight: float, music_weight: float, initial_location_weight: float) -> List[dict]:
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
                new_driver["registeredCount"] = 0

                drivers.append(new_driver)
                passengers.remove(candidate)
                return True

        return False
  
    while not drivers:
        if not promote_eligible_drivers():
            break
                                  
    while True:
        distance_matrix = fetch_distance_matrix_with_route(passengers, drivers)

        print("Number of passengers:", len(passengers))
        print("Number of drivers:", len(drivers))
        music_similarity_matrix = calculate_music_similarity(passengers, drivers)
        print("music matrix", music_similarity_matrix)

        assign_based_on_combined_score(passengers, drivers, distance_matrix, music_similarity_matrix, location_weight, music_weight, final_point, initial_location_weight)

        outliers = [passenger for passenger in passengers if passenger["driverId"] is None]
        if not outliers:
            break

        if not promote_eligible_drivers():
            break
        
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
        


def assign_based_on_combined_score(passengers, drivers, distance_matrix, music_similarity_matrix, location_weight, music_weight, final_point, initial_priority_weight=0.1):
    """
    Globally assign passengers to drivers using a combination of location proximity and music similarity,
    taking into account the driver's entire route to the event as well as giving bonus priority if the 
    driver is initially close to the passenger.

    For each candidate (passenger, driver) pair:
      - If the initial distance (from the distance matrix) is np.inf or exceeds the driver's pickup radius,
        compute a route-based distance using get_route_points and point_to_polyline_distance.
      - If the computed candidate distance is within the driver's pickup radius, compute:
            normalized_route = (pickup_radius - candidate_distance) / pickup_radius
            normalized_initial = (pickup_radius - initial_distance) / pickup_radius  (if available)
      - Combine these (with a bonus factor) and the music similarity score to form the final combined score.
      
    Debug logs are printed along the way.
    """
    candidate_assignments = []
    route_points_cache = {}  # Cache route points per driver to avoid recomputation

    for passenger_idx, passenger in enumerate(passengers):
        # Skip already assigned passengers.
        if passenger.get("driverId") is not None:
            continue

        for driver_idx, driver in enumerate(drivers):
            # Skip drivers that are already at capacity.
            if driver["registeredCount"] >= driver["vehicle"].get("maxPassengers", 0):
                continue

            # Convert driver's pickup radius from km to meters.
            pickup_radius_m = driver["pickupRadius"] * 1000

            # Retrieve the initial distance from the distance matrix.
            initial_distance = distance_matrix[passenger_idx][driver_idx]  # in meters
            candidate_distance = initial_distance  # default to initial distance

            if initial_distance == np.inf or initial_distance > pickup_radius_m:
                if driver_idx not in route_points_cache:
                    route_points = get_route_points(driver, {
                        "latitude": final_point["latitude"],
                        "longitude": final_point["longitude"]
                    })
                    route_points_cache[driver_idx] = route_points
                else:
                    route_points = route_points_cache[driver_idx]

                if route_points:
                    route_distance_km = point_to_polyline_distance(
                        passenger["pickupLat"],
                        passenger["pickupLong"],
                        route_points
                    )
                    candidate_distance = route_distance_km * 1000  # convert to meters
                else:
                    candidate_distance = np.inf

            # If the candidate distance exceeds the driver's pickup radius, skip this candidate.
            if candidate_distance > pickup_radius_m:
                continue

            # Compute normalized route-based proximity.
            normalized_route = (pickup_radius_m - candidate_distance) / pickup_radius_m

            # Compute bonus for initial proximity, if available.
            if initial_distance != np.inf and initial_distance <= pickup_radius_m:
                normalized_initial = (pickup_radius_m - initial_distance) / pickup_radius_m
            else:
                normalized_initial = 0

            # Combine them to form the overall location score.
            overall_location_score = normalized_route + (initial_priority_weight * normalized_initial)

            # Retrieve music similarity.
            music_sim = music_similarity_matrix[passenger_idx][driver_idx]

            # Compute the combined score.
            combined_score = (location_weight * overall_location_score) + (music_weight * music_sim)

            candidate_assignments.append((
                passenger_idx,
                driver_idx,
                combined_score,
                candidate_distance,
                normalized_route,
                normalized_initial,
                music_sim
            ))

    # Sort candidate assignments by combined score in descending order.
    candidate_assignments.sort(key=lambda x: x[2], reverse=True)

    # Debug: Print out candidate assignments.
    print("\nSorted candidate assignments (passenger_idx, driver_idx, combined_score, candidate_distance, normalized_route, normalized_initial, music_sim):")
    for cand in candidate_assignments:
        print(f"  Passenger {cand[0]}, Driver {cand[1]} -> Combined score: {cand[2]:.2f}, "
              f"Distance: {cand[3]:.2f} m, Normalized route: {cand[4]:.2f}, Bonus (initial): {cand[5]:.2f}, Music sim: {cand[6]:.2f}")

    # Greedily assign passengers based on the sorted candidate list.
    for candidate in candidate_assignments:
        passenger_idx, driver_idx, combined_score, candidate_distance, normalized_route, normalized_initial, music_sim = candidate

        # Skip if the passenger has already been assigned.
        if passengers[passenger_idx].get("driverId") is not None:
            continue

        driver = drivers[driver_idx]
        # Skip if the driver is already at capacity.
        if driver["registeredCount"] >= driver["vehicle"].get("maxPassengers", 0):
            continue

        # Perform the assignment.
        passengers[passenger_idx]["driverId"] = driver["id"]
        driver["registeredCount"] += 1

        print(f"Assigning passenger {passenger_idx} (ID: {passengers[passenger_idx].get('id', 'unknown')}) "
              f"to driver {driver_idx} (ID: {driver.get('id', 'unknown')}) with combined score {combined_score:.2f}")

    # Debug: List any unassigned passengers.
    for i, passenger in enumerate(passengers):
        if passenger.get("driverId") is None:
            print(f"Passenger {i} (ID: {passenger.get('id', 'unknown')}) remains unassigned.")
