from dataclasses import asdict
from datetime import datetime
from fastapi import APIRouter
from app.models import Ride, AssignedRide
from typing import List
from app.services.data_utils import object_to_dict, transform_ride
from app.services.time_assignment import assign_start_times_to_drivers_and_passengers
from app.services.user_assignment import assign_users_with_route, filter_rides
from app.services.pickup_points import assignPickupPoints
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse
from pathlib import Path
import json

router = APIRouter()
JSON_FILE_PATH = Path("example.json")

    
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
    return {"message": "connected with success"}

@router.post("/assign-users", response_model=List[AssignedRide])
async def assign_users(rides: List[AssignedRide]):
    """
    Assign users to drivers based on location and preferences.
    """
    # Prepare input for assignment
    rides_dict = [ride.dict() if hasattr(ride, "dict") else ride for ride in rides]
    drivers, passengers = filter_rides(rides_dict)

    location_weight = 0.8
    music_weight = 0.1
    initial_location_weight = 0.1
    if not drivers:
      if passengers:
          event = passengers[0]['event']
          finish_point = {
              "latitude": passengers[0]['event']["latitude"],
              "longitude": passengers[0]['event']["longitude"]
          }
      else:
          event = None
          # Return an empty array if there are no drivers or passengers
          finish_point = []
    else:
        event = drivers[0]['event']
        finish_point = {
            "latitude": drivers[0]['event']["latitude"],
            "longitude": drivers[0]['event']["longitude"]
        }

    event_start_time =  event["startDateTime"]

    assigned_rides = assign_users_with_route(passengers, drivers, finish_point ,location_weight, music_weight, initial_location_weight)   


    transformed = [transform_ride(ride) for ride in assigned_rides]
    
    pickup_points_rides = assignPickupPoints(transformed);

    transformed_rides = [object_to_dict(ride) for ride in pickup_points_rides]

    

    updated_rides = assign_start_times_to_drivers_and_passengers(transformed_rides, event_start_time)

    print("rides were processed")

    formatted_rides = []
    for ride in updated_rides:
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
        })

        for passenger in ride.get("passengerRides") or []:
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



# calls when: 
# 1. New passenger registers for an event before less then 24 hours (when the main algorithm worked out).
# 2. When a driver canceled a ride, all passengers will be "new passengers".

@router.post("/assign-new-passengers", response_class=List[AssignedRide])
async def assign_pickups(availableDrivers: List[AssignedRide], newPassengers:List[Ride]):
    # The code should check if new passengers somehow matches available drivers. 
    # If no drivers or no drivers that matches passengers, then the system should check weather some of new passengers can be driver
    # if so the passenger becomes a driver and added to the available drivers. The algorithm runs again.
    # it returns updated newPassengers or just same one, if no changes.
    return []


## Calls when:
## When a driver registered for event before less then 24 hour of its beginning 
## Basically could be replaced by the function above: just call it again but with a new driver and passenger who weren't assigned before

# Requirements
# when a driver added we need to receive a list of unassigned passengers and a new driver
# the system will check how the passengers could be assigned to the driver. It returns updated rides (or the same one)

