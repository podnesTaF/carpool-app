package com.itinside.carpoolingAPI.dto;

import com.itinside.carpoolingAPI.models.Event;
import com.itinside.carpoolingAPI.models.Ride;
import com.itinside.carpoolingAPI.models.Vehicle;
import lombok.*;

import java.util.List;
import java.util.stream.Collectors;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RideDTO {
    private Long id;
    private Long vehicleId;
    private Long driverId;
    private boolean isDriver;
    private boolean canBeDriver;
    private Float pickupLat;
    private Float pickupLong;
    private Float pickupRadius;
    private Integer pickupSequence;
    private Integer maxPassengers;
    private Integer registeredCount;
    private String startDateTime;
    private boolean outlier;
    private UserDTO user;
    private Object driverRide; // Can hold either ID (Long) or full RideDTO
    private List<Object> passengerRides; // Can hold either IDs (List<Long>) or full RideDTOs
    private EventDTO event;
    private VehicleDTO vehicle;


    public static RideDTO fromEntity(
        Ride ride,
        boolean includeDriver,
        boolean includePassengers,
        boolean loadFullDriver,
        boolean loadFullPassengers
    ) {
        RideDTOBuilder builder = RideDTO.builder()
            .id(ride.getId())
            .isDriver(ride.isDriver())
            .canBeDriver(ride.isCanBeDriver())
            .vehicleId(ride.getVehicle() != null ?  ride.getVehicle().getId() : null)
            .driverId(ride.getDriverRide() != null ? ride.getDriverRide().getId() : null)
            .pickupLat(ride.getPickupLat())
            .pickupLong(ride.getPickupLong())
            .pickupRadius(ride.getPickupRadius())
            .outlier(ride.isOutlier())
            .registeredCount(ride.getPassengerRides().size())
            .pickupSequence(ride.getPickupSequence())
            .maxPassengers(ride.getMaxPassengers())
            .startDateTime(ride.getStartDateTime() != null ? ride.getStartDateTime().toString() : null)
            .user(UserDTO.fromEntity(ride.getUser()))
            .event(EventDTO.fromEntity(ride.getEvent(), false))
            .vehicle(VehicleDTO.fromEntity(ride.getVehicle()));

        // Include driverRide
        if (includeDriver && ride.getDriverRide() != null) {
            builder.driverRide(
                loadFullDriver
                    ? fromEntity(ride.getDriverRide(), false, false, false, false)
                    : ride.getDriverRide().getId()
            );
        }

        // Include passengerRides
        if (includePassengers && ride.getPassengerRides() != null) {
            builder.passengerRides(
                loadFullPassengers
                    ? ride.getPassengerRides()
                    .stream()
                    .map(passengerRide -> fromEntity(passengerRide, false, false, false, false))
                    .collect(Collectors.toList())
                    : ride.getPassengerRides()
                    .stream()
                    .map(Ride::getId)
                    .collect(Collectors.toList())
            );
        }

        return builder.build();
    }
}
