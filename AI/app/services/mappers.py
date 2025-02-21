from typing import List
from app.models import Ride, AssignedRide

def build_assigned_rides_structure(flat_rides: List[AssignedRide]) -> List[AssignedRide]:
    """
    Convert a flat list of rides into a list of AssignedRide objects.
    Each 'AssignedRide' for a driver will contain a 'passengerRides' list
    of the rides that reference driverId == driver's id.
    """
    # 1) Separate drivers and passengers
    drivers = [r for r in flat_rides if r.driver]
    passengers = [r for r in flat_rides if not r.driver]

    # 2) For each driver, build an AssignedRide
    assigned_rides: List[AssignedRide] = []

    for driver in drivers:
        # Convert the 'driver' from Ride to AssignedRide
        driver_assigned = AssignedRide(**driver.dict())

        initial_passenger_rides = []
        if driver.passengerRides:
            initial_passenger_rides = [AssignedRide(**p.dict()) for p in driver.passengerRides]

        # Find all passengers who reference this driver
        assigned_passengers = [
            AssignedRide(**p.dict())  # or just p if you want to keep them as Ride
            for p in passengers
            if p.driverId == driver.id
        ]

        driver_assigned.passengerRides = initial_passenger_rides + assigned_passengers
        assigned_rides.append(driver_assigned)

    # 3) handle passengers with no driverId (completely unassigned)
    #    If you'd like them as "standalone" AssignedRide objects, you can do:
    unassigned_passengers = [p for p in passengers if p.driverId is None]
    # You can decide to either skip them or store them in assigned_rides
    # as "AssignedRide" with driver=False and passengerRides=None
    for p in unassigned_passengers:
        ride_unassigned = AssignedRide(**p.dict())
        # No passengerRides
        assigned_rides.append(ride_unassigned)

    return assigned_rides