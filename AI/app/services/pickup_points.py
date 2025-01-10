from typing import List
import googlemaps
from os import getenv
from geopy.distance import geodesic
from sklearn.cluster import KMeans

from app.models import AssignedRide
from app.services.mappers import build_assigned_rides_structure
from app.services.pickup_utils import assign_clustered_pickups
from app.services.route_utils import get_route_points

gmaps = googlemaps.Client(key=getenv("GMAPS_API_KEY"))




def assignPickupPoints(assigned_rides: List[AssignedRide]) -> List[AssignedRide]:
    """
    Takes a list of AssignedRide objects where each driver has passengerRides,
    then finds a 'clustered pickup point' for each group of passengers along the driver's route.
    Updates the passenger's pickupLat/pickupLong accordingly.
    Returns an updated list of AssignedRide with passengerRides updated.
    """

    grouped_rides = build_assigned_rides_structure(assigned_rides)

    updated_rides: List[dict] = []

    # Step 1) Group passengers by driver
    for ride in grouped_rides:
        if ride.driver:
            # This is a driver ride
            driver_dict = ride.dict()
            passenger_rides = ride.passengerRides or []
            
            # Step 2) Build the 'route' from your route_utils or something similar
            # e.g. get_route_points() returns a list of (lat, lng)
           
            final_point = {
                "latitude": driver_dict["event"]["latitude"],
                "longitude": driver_dict["event"]["longitude"]
            }
            route = get_route_points(driver_dict, final_point)
            
            if not route or not passenger_rides:
                # No passengers or no route => nothing to cluster
                updated_rides.append(driver_dict)
                continue
            
            # Step 3) Convert passenger rides into lat/lng list for DBSCAN
            passenger_coords = []
            passenger_map = {}  # index -> passenger

            for i, p_ride in enumerate(passenger_rides):
                lat_lng = (p_ride.pickupLat, p_ride.pickupLong)
                passenger_coords.append(lat_lng)
                passenger_map[i] = p_ride

            # Step 4) run the cluster assignment
          
            assignments, pickup_points = assign_clustered_pickups(
                route,
                passenger_coords,
                clustering_eps=0.5
            )
            # 'assignments' is a dict: {(lat, lng) -> (pickupLat, pickupLong)}

            # Step 5) Update each passenger in passenger_rides
            # If a passenger is found in `assignments`, that means we computed a new pickup.
            for i, p_ride in enumerate(passenger_rides):
                original_coord = (p_ride.pickupLat, p_ride.pickupLong)
                if original_coord in assignments:
                    new_coord = assignments[original_coord]
                    p_ride.pickupLat = new_coord[0]
                    p_ride.pickupLong = new_coord[1]

            # Reattach passenger rides to driver
            driver_dict["passengerRides"] = [p.dict() for p in passenger_rides]
            updated_rides.append(driver_dict)
        else:
            # This is a passenger with no driver
            updated_rides.append(ride.dict())

    # Step 6) Return final structure
    return updated_rides