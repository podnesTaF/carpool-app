from typing import List
import googlemaps
from os import getenv
from geopy.distance import geodesic
from sklearn.cluster import KMeans

from app.models import AssignedRide

gmaps = googlemaps.Client(key=getenv("GMAPS_API_KEY"))


def calculate_route_with_pickup_points(driver_ride, assigned_rides):
    driver_location = (driver_ride.pickupLat, driver_ride.pickupLong)
    event_location = (driver_ride.event.latitude, driver_ride.event.longitude)

    # Collect passenger locations assigned to this driver
    passenger_locations = [
        (ride.pickupLat, ride.pickupLong) for ride in assigned_rides if ride.driverId == driver_ride.id
    ]

    # Identify pickup points using clustering if there are more than 3 stops (driver + passengers + event)
    pickup_points = []
    if len(passenger_locations) > 2:  # More than 3 stops means at least 2 passengers
        kmeans = KMeans(n_clusters=min(len(passenger_locations), 3), random_state=0).fit(passenger_locations)
        pickup_points = kmeans.cluster_centers_.tolist()
    else:
        pickup_points = passenger_locations

    # Create the route starting from the driver location
    all_locations = [driver_location] + pickup_points + [event_location]

    # Optimize the route (simple nearest neighbor)
    route = [all_locations[0]]
    remaining_points = all_locations[1:]

    while remaining_points:
        current = route[-1]
        next_point = min(remaining_points, key=lambda p: geodesic(current, p).meters)
        route.append(next_point)
        remaining_points.remove(next_point)

    return route, pickup_points


def assignPickupPoints(rides: List[AssignedRide]):
    # Initialize the output list
    updated_rides: List[dict] = []

    # Create a dictionary to group passengers by their assigned driverId
    passengers_by_driver = {}
    for ride in rides:
        if not ride.driver and ride.driverId is not None:
            if ride.driverId not in passengers_by_driver:
                passengers_by_driver[ride.driverId] = []
            passengers_by_driver[ride.driverId].append(ride)

    # Process each ride and structure the output
    for ride in rides:
        if ride.driver:  # If it's a driver, include assigned passengers
            driver_dict = ride.dict()  # Convert driver object to a dictionary
            driver_dict["passengerRides"] = [
                passenger.dict() for passenger in passengers_by_driver.get(ride.id, [])
            ]
            updated_rides.append(driver_dict)
        else:  # If it's a passenger without a driver, include as-is
            if ride.driverId is None: 
                updated_rides.append(ride.dict())

    return updated_rides