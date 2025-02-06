from typing import List
import googlemaps
from os import getenv
from geopy.distance import geodesic
from sklearn.cluster import KMeans

from app.models import AssignedRide
from app.services.advanced_pickup import assign_clustered_and_centralized_pickups
from app.services.mappers import build_assigned_rides_structure
from app.services.pickup_utils import assign_clustered_pickups
from app.services.route_utils import get_route_points

gmaps = googlemaps.Client(key=getenv("GMAPS_API_KEY"))


def assignPickupPoints(assigned_rides: List[AssignedRide]) -> List[AssignedRide]:
    grouped_rides = build_assigned_rides_structure(assigned_rides)
    updated_rides: List[dict] = []

    for ride in grouped_rides:
        if ride.driver:
            driver_dict = ride.dict()
            passenger_rides = ride.passengerRides or []
            # You might use the event's location if needed:
            final_point = {
                "latitude": driver_dict["event"]["latitude"],
                "longitude": driver_dict["event"]["longitude"]
            }
            # Optionally, you could get the driver's route if needed:
            # route = get_route_points(driver_dict, final_point)
            # Here, we are clustering based solely on passengers' preferred pickup coordinates.
            passenger_coords = [(p.pickupLat, p.pickupLong) for p in passenger_rides]

            assignments, pickup_points = assign_clustered_and_centralized_pickups(
                passenger_coords,
                clustering_max_distance=1000,
                driver_zone=2000
            )

            # Update each passenger ride with the new pickup point if available.
            for p in passenger_rides:
                original_coord = (p.pickupLat, p.pickupLong)
                if original_coord in assignments:
                    new_coord = assignments[original_coord]
                    p.pickupLat, p.pickupLong = new_coord

            driver_dict["passengerRides"] = [p.dict() for p in passenger_rides]
            updated_rides.append(driver_dict)
        else:
            updated_rides.append(ride.dict())

    return updated_rides