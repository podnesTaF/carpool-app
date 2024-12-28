from datetime import datetime
from pydantic import BaseModel, Field
from typing import List, Optional


class User(BaseModel):
    id: int
    firstName: str
    lastName: str
    email: str
    address: str
    city: str
    smoking: Optional[bool]
    talkative: Optional[bool]
    preferredGenres: List[dict]  # {"id": 1, "name": "Rock"}


class Vehicle(BaseModel):
    id: int
    brand: str
    model: str
    color: str
    plate: str
    maxPassengers: int


class Event(BaseModel):
    id: int
    title: str
    description: str
    startDateTime: Optional[datetime]  # Using datetime to parse ISO 8601 format
    endDateTime: Optional[datetime]
    address: str
    registerDeadline: Optional[datetime]
    longitude: float
    latitude: float

class Ride(BaseModel):
    id: int
    driver: Optional[bool]
    vehicleId: Optional[int]
    pickupRadius: Optional[float]
    pickupLong: Optional[float]
    pickupLat: Optional[float]
    startDateTime: Optional[datetime]
    pickupSequence: Optional[int]
    driverId: Optional[int]
    canBeDriver: Optional[bool]
    vehicle: Optional[Vehicle]
    user: User
    event: Event

class AssignedRide(Ride):
    driverRide: Optional[Ride] = None
    passengerRides: Optional[List[Ride]] = None