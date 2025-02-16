package com.itinside.carpoolingAPI.exceptions;

public class RideNotFoundException extends RuntimeException {
    public RideNotFoundException(Long rideId) {
        super("Ride with ID " + rideId + " not found");
    }
}
