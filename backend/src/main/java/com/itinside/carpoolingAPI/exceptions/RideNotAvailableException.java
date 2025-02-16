package com.itinside.carpoolingAPI.exceptions;


public class RideNotAvailableException extends RuntimeException {
    public RideNotAvailableException(Long rideId) {
        super("Ride with ID " + rideId + " is not yet available.");
    }
}