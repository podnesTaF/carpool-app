from datetime import datetime, timedelta
from typing import List
from app.models import AssignedRide
import googlemaps
from os import getenv

gmaps = googlemaps.Client(key=getenv("GMAPS_API_KEY"))

def calculate_time_between_points(point1, point2):
    """
    Calculate travel time between two points using Google Distance Matrix API.
    """
    response = gmaps.distance_matrix(
        origins=[(point1["latitude"], point1["longitude"])],
        destinations=[(point2["latitude"], point2["longitude"])],
        mode="driving"
    )
    if response["rows"][0]["elements"][0]["status"] == "OK":
        return response["rows"][0]["elements"][0]["duration"]["value"]  # Time in seconds
    return float('inf')  # Return a large value if no route found

def is_same_location(lat1: float, lng1: float, lat2: float, lng2: float, tol: float = 0.001) -> bool:
    return abs(lat1 - lat2) <= tol and abs(lng1 - lng2) <= tol

def assign_start_times_to_drivers_and_passengers(drivers_data: List[AssignedRide], event_start_time: datetime):
    """
    Assign start times for drivers and passengers based on their routes and the provided structure.
    If two passengers have nearly identical pickup locations (within 0.001 in lat or lng),
    the extra 5-minute stop time is only applied once.
    
    Args:
        drivers_data (list): List of drivers with assigned passengers.
        event_start_time (datetime): Event start time.
    
    Returns:
        list: List with updated start times for drivers and their passengers.
    """
    for driver_data in drivers_data:
        driver_position = {
            "latitude": driver_data["pickupLat"],
            "longitude": driver_data["pickupLong"]
        }
        # Ensure passengerRides is a list
        passengers = driver_data.get("passengerRides") or []

        # Calculate travel times from each passenger to the event location
        for passenger in passengers:
            passenger["distanceToEvent"] = calculate_time_between_points(
                {"latitude": passenger["pickupLat"], "longitude": passenger["pickupLong"]},
                {"latitude": driver_data["event"]["latitude"], "longitude": driver_data["event"]["longitude"]}
            )
        # Sort passengers by distance to the event (farthest first)
        passengers.sort(key=lambda p: p["distanceToEvent"], reverse=True)

        # Initialize current_time to the event start time and last_position to the event location
        current_time = event_start_time
        last_position = {
            "latitude": driver_data["event"]["latitude"],
            "longitude": driver_data["event"]["longitude"]
        }

        # Process passengers in reverse order (i.e. from farthest to closest to the event)
        for idx, passenger in reversed(list(enumerate(passengers))):
            # Calculate travel time from the passenger's pickup point to the last_position
            travel_time = calculate_time_between_points(
                {"latitude": passenger["pickupLat"], "longitude": passenger["pickupLong"]},
                last_position,
            )

            # Only subtract the 5-minute stop if the current pickup location differs from the last one
            if not is_same_location(
                passenger["pickupLat"], passenger["pickupLong"],
                last_position["latitude"], last_position["longitude"]
            ):
                current_time -= timedelta(seconds=300)  # Subtract 5-minute stop time

            # Always subtract the travel time
            current_time -= timedelta(seconds=travel_time)
            passenger["startDateTime"] = current_time
            passenger["pickupSequence"] = idx + 1

            # Update the last_position to the current passenger's pickup location
            last_position = {
                "latitude": passenger["pickupLat"],
                "longitude": passenger["pickupLong"]
            }

        # Calculate the driver's start time based on the first passenger pickup if available
        if passengers:
            travel_time_to_first_passenger = calculate_time_between_points(
                driver_position,
                {"latitude": passengers[0]["pickupLat"], "longitude": passengers[0]["pickupLong"]},
            )
            driver_start_time = current_time - timedelta(seconds=travel_time_to_first_passenger)
            driver_data["startDateTime"] = driver_start_time
        else:
            # If no passengers, compute driver's start time directly from event start time
            travel_time_to_event = calculate_time_between_points(
                driver_position,
                {"latitude": driver_data["event"]["latitude"], "longitude": driver_data["event"]["longitude"]},
            )
            driver_start_time = event_start_time - timedelta(seconds=travel_time_to_event)
            driver_data["startDateTime"] = driver_start_time

    return drivers_data
