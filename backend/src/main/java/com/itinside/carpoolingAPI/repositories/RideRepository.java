package com.itinside.carpoolingAPI.repositories;

import com.itinside.carpoolingAPI.models.Event;
import com.itinside.carpoolingAPI.models.Ride;
import com.itinside.carpoolingAPI.models.User;
import com.itinside.carpoolingAPI.projections.RideProjection;

import jakarta.validation.constraints.NotNull;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;

import java.util.List;
import java.util.Optional;

@RepositoryRestResource(collectionResourceRel = "rides", path = "rides")
public interface RideRepository extends JpaRepository<Ride, Long>, JpaSpecificationExecutor<Ride> {
    boolean existsByEventAndUser(@NotNull Event event, @NotNull User user);

    List<Ride> findByEventId(Long eventId);

    List<Ride> findByUserId(Long userId);


    Optional<Ride> findByDriverRideId(Long driverId);

    @Query("SELECT r FROM Ride r " +
        "LEFT JOIN FETCH r.event e " +
        "LEFT JOIN FETCH r.user u " +
        "LEFT JOIN FETCH u.preferredGenres g " +
        "LEFT JOIN FETCH r.vehicle v " +
        "WHERE r.event.id = :eventId")
    List<RideProjection> findRidesByEventId(@Param("eventId") Long eventId);
}
