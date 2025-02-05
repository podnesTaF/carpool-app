from app.models import AssignedRide, Event, Ride, User, Vehicle


def transform_ride(ride: dict) -> AssignedRide:
    # Copy the ride to avoid mutating the original dict
    ride_copy = ride.copy()

    # Transform nested objects if they exist
    if "user" in ride_copy and isinstance(ride_copy["user"], dict):
        ride_copy["user"] = User(**ride_copy["user"])
    if "event" in ride_copy and isinstance(ride_copy["event"], dict):
        ride_copy["event"] = Event(**ride_copy["event"])
    if "vehicle" in ride_copy and ride_copy["vehicle"] is not None and isinstance(ride_copy["vehicle"], dict):
        ride_copy["vehicle"] = Vehicle(**ride_copy["vehicle"])
    
    if "passengerRides" in ride_copy and ride_copy["passengerRides"] is not None:
        ride_copy["passengerRides"] = [transform_ride(pr) for pr in ride_copy["passengerRides"]]

    return AssignedRide(**ride_copy)


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
