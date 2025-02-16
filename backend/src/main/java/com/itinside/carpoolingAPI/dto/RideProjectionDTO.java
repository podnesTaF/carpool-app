package com.itinside.carpoolingAPI.dto;

import java.util.List;
import java.util.Optional;

import lombok.Data;

@Data
public class RideProjectionDTO {
    private Long id;
    private boolean isDriver;
    private boolean canBeDriver;
    private Float pickupLat;
    private Float pickupLong;
    private Float pickupRadius;
    private Integer pickupSequence;
    private Integer maxPassengers;
    private String startDateTime;
    private Long eventId;
    private Long userId;
    private Long vehicleId;
    private Long driverId;

    // Add UserInfo, Event, and Vehicle fields if needed
    private UserInfo user;
    private Event event;
    private Vehicle vehicle;

    // Getters and Setters

    public static class UserInfo {
        private Long id;
        private String address;
        private boolean smoking;
        private boolean talkative;
        private List<Genre> preferredGenres;

        // Getters and Setters
    }

    public static class Event {
        private Long id;
        private String title;
        private String description;
        private String startDateTime;
        private String endDateTime;
        private String address;
        private String registerDeadline;
        private Float longitude;
        private Float latitude;

        // Getters and Setters
    }

    public static class Vehicle {
        private Long id;
        private String brand;
        private String model;
        private String color;
        private String plate;
        private Integer maxPassengers;

        // Getters and Setters
    }

    public static class Genre {
        private Long id;
        private String name;

        // Getters and Setters
    }
}