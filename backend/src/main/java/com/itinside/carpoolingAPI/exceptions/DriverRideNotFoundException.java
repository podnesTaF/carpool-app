package com.itinside.carpoolingAPI.exceptions;

public class DriverRideNotFoundException extends RuntimeException {
    public DriverRideNotFoundException(Long passengerRideId) {
        super("Driver ride not found for passenger ride with ID " + passengerRideId);
    }
}