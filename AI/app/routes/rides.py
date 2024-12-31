from dataclasses import asdict
from datetime import datetime
from fastapi import APIRouter
from app.models import Ride, AssignedRide
from typing import List
from app.services.time_assignment import assign_start_times_to_drivers_and_passengers
from app.services.user_assignment import assign_users_with_route, filter_rides
from app.services.pickup_points import assignPickupPoints
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse
from pathlib import Path
import json

router = APIRouter()
JSON_FILE_PATH = Path("example.json")

def object_to_dict(obj):
    """
    Recursively convert an object and its attributes into a dictionary.
    """
    if isinstance(obj, list):  # Handle lists
        return [object_to_dict(item) for item in obj]
    elif hasattr(obj, "__dict__"):  # Handle objects with __dict__ attribute
        return {key: object_to_dict(value) for key, value in obj.__dict__.items()}
    elif isinstance(obj, dict):  # Handle dictionaries
        return {key: object_to_dict(value) for key, value in obj.items()}
    else:  # Return basic types as-is
        return obj
    
@router.get("/", response_model=List[Ride])
async def get_rides():
    try:
        with open(JSON_FILE_PATH, "r") as file:
            data = json.load(file)
            rides = [Ride(**ride) for ride in data.get("rides", [])]  # Parse JSON into Ride objects
        return rides
    except FileNotFoundError:
        return []  # Return an empty list if the file is not found
    except json.JSONDecodeError:
        return []  # Return an empty list if there is a JSON decoding error

@router.post("/test")
async def test_connection(rides: List[dict]):
    print(rides)
    return {"message": "connected with success"}

@router.post("/assign-users", response_model=List[AssignedRide])
async def assign_users(rides: List[Ride]):
    """
    Assign users to drivers based on location and preferences.
    """
    # Prepare input for assignment
    rides_dict = [ride.dict() if hasattr(ride, "dict") else ride for ride in rides]

    drivers, passengers = filter_rides(rides_dict)
    location_weight = 0.9
    music_weight = 0.1
    finish_point = {"latitude": drivers[0]['event']["latitude"], "longitude": drivers[0]['event']["longitude"]} 

    assigned_rides  = assign_users_with_route(passengers, drivers, finish_point ,location_weight, music_weight)    
    tranfromed = [Ride(**ride) for ride in assigned_rides]
    pickup_points_rides = assignPickupPoints(tranfromed);
    transformed_rides = [object_to_dict(ride) for ride in pickup_points_rides]

    event_start_date = datetime(2025, 3, 10, 9, 30)

    updated_rides = assign_start_times_to_drivers_and_passengers(transformed_rides, event_start_date)

    formatted_rides = []
    for ride in updated_rides:
        event_data = ride.get("event", {})
        def format_event(event):
          return {
              "id": event.get("id"),
              "title": event.get("title"),
              "description": event.get("description"),
              "startDateTime": event.get("startDateTime"),
              "endDateTime": event.get("endDateTime"),
              "address": event.get("address"),
              "registerDeadline": event.get("registerDeadline"),
              "longitude": event.get("longitude"),
              "latitude": event.get("latitude"),
          }
        formatted_rides.append({
            "id": ride.get("id"),
            "driver": ride.get("driver", False),
            "canBeDriver": ride.get("canBeDriver", False),
            "pickupLat": ride.get("pickupLat"),
            "pickupLong": ride.get("pickupLong"),
            "pickupRadius": ride.get("pickupRadius"),
            "eventId": ride.get("event", {}).get("id"),
            "userId": ride.get("user", {}).get("id"),
            "pickupSequence": ride.get("pickupSequence"),
            "maxPassengers": ride.get("vehicle", {}).get("maxPassengers") if ride.get("vehicle") else None,
            "startDateTime": ride.get("startDateTime"),
            "vehicleId": ride.get("vehicle", {}).get("id") if ride.get("vehicle") else None,
            "driverId": ride.get("driverId"),
            "user": ride.get("user"),
            "event": ride.get("event"),
            "vehicle": ride.get("vehicle"),
            "driverRide": ride.get("driverRide"),
            "passengerRides": ride.get("passengerRides", []),
        })

        for passenger in ride.get("passengerRides", []):
          formatted_rides.append({
              "id": passenger.get("id"),
              "driver": passenger.get("driver", False),
              "canBeDriver": passenger.get("canBeDriver", False),
              "pickupLat": passenger.get("pickupLat"),
              "pickupLong": passenger.get("pickupLong"),
              "pickupRadius": passenger.get("pickupRadius"),
              "pickupSequence": passenger.get("pickupSequence"),
              "maxPassengers": None,  # Passengers do not have maxPassengers
              "startDateTime": passenger.get("startDateTime"),
              "eventId": passenger.get("event", {}).get("id"),
              "userId": passenger.get("user", {}).get("id"),
              "vehicleId": None,  # Passengers do not have a vehicleId
              "driverId": passenger.get("driverId"),
              "user": passenger.get("user"),
              "event": ride.get("event"),
              "vehicle": None,  # Passengers do not have a vehicle
              "driverRide": None,  # Passengers are not drivers
          })

    # Convert to JSON with proper datetime serialization
    encoded_rides = jsonable_encoder(formatted_rides)
    return JSONResponse(content=encoded_rides)


@router.post("/assign-times", response_model=List[AssignedRide])
async def assign_users(rides: List[AssignedRide]):
    event_start_time = datetime(2025, 1, 13, 18, 0)
    rides_dict = [driver.dict() for driver in rides]
    updated_rides = assign_start_times_to_drivers_and_passengers(rides_dict, event_start_time)

    return updated_rides  


@router.post("/assign-pickups", response_class=List[AssignedRide])
async def assign_pickups(rides:List[AssignedRide]):

    return []