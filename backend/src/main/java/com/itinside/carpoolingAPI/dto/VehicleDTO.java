package com.itinside.carpoolingAPI.dto;

import com.itinside.carpoolingAPI.models.Vehicle;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class VehicleDTO {
    private long id;
    private int maxPassengers;
    private String plate;
    private String color;
    private String brand;
    private String model;
    private String imgUrl;


    public static VehicleDTO fromEntity(Vehicle vehicle) {
        if (vehicle == null) {
            return null;
        }
        return VehicleDTO.builder()
            .id(vehicle.getId())
            .maxPassengers(vehicle.getMaxPassengers())
            .plate(vehicle.getPlate())
            .color(vehicle.getColor())
            .brand(vehicle.getBrand())
            .model(vehicle.getModel())
            .imgUrl(vehicle.getImgUrl())
            .build();
    }
}
