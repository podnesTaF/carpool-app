// Create a projection interface
package com.itinside.carpoolingAPI.projections;

import com.itinside.carpoolingAPI.dto.EventDTO;
import com.itinside.carpoolingAPI.dto.UserDTO;
import com.itinside.carpoolingAPI.dto.VehicleDTO;
import com.itinside.carpoolingAPI.models.*;
import org.springframework.data.rest.core.config.Projection;


@Projection(name = "fullRide", types = { Ride.class })
public interface RideProjection {
    Long getId();
    Long getVehicleId();
    Long getDriverId();
    boolean isDriver();
    boolean canBeDriver();
    Float getPickupLat();
    Float getPickupLong();
    Float getPickupRadius();
    Integer getPickupSequence();
    Integer getMaxPassengers();
    UserDTO getUser();
    EventDTO getEvent();
    VehicleDTO getVehicle();
}