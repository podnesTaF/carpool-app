package com.itinside.carpoolingAPI.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RegistrationRequest {
    private boolean driver;
    private boolean canBeDriver;
    private Float pickupLat;
    private Float pickupLong;
    private Float pickupRadius;
    private Long vehicleId;
}