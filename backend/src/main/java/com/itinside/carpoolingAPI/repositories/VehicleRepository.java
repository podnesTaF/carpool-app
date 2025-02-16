package com.itinside.carpoolingAPI.repositories;

import com.itinside.carpoolingAPI.models.Event;
import com.itinside.carpoolingAPI.models.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;

@RepositoryRestResource(collectionResourceRel = "vehicles", path = "vehicles")
public interface VehicleRepository extends JpaRepository<Vehicle, Long> {
}
