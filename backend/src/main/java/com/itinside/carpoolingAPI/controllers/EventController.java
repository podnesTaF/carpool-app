package com.itinside.carpoolingAPI.controllers;

import com.itinside.carpoolingAPI.dto.EventDTO;
import com.itinside.carpoolingAPI.dto.RegistrationRequest;
import com.itinside.carpoolingAPI.exceptions.AlreadyRegisteredException;
import com.itinside.carpoolingAPI.exceptions.ResourceNotFoundException;
import com.itinside.carpoolingAPI.services.AuthService;
import com.itinside.carpoolingAPI.services.EventService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequiredArgsConstructor
@RequestMapping("/event")
public class EventController {
    private final EventService eventService;
    private final AuthService authService;



    @GetMapping("/new")
    public ResponseEntity<List<EventDTO>> getEvents (@AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(eventService.getEvents());
    }

    @GetMapping("/{id}")
    public ResponseEntity<EventDTO> getEvent(@PathVariable Long id) {
        return ResponseEntity.ok(eventService.getEvent(id));
    }

    // Update to include "late registration" in this case the created ride will be immediately assigned to a driver.
    // It will call the "/rides/assign-users" ai endpoint passing an array with available drivers and a new passenger.
    // Available drivers is drivers, who have some available spaces in their car
    // The return will be list of updated rides. I'm saving updated rides to the db.


    @PostMapping("/{id}/register")
    public ResponseEntity<?> registerForEvent(
        @PathVariable Long id,
        @RequestParam(required = false) Optional<Long> rideId,
        @RequestBody RegistrationRequest registrationRequest,
        @AuthenticationPrincipal Jwt jwt
    ) {
        Long userId = authService.getAuthenticatedUserId(jwt);
        try {
            String result = eventService.registerForEvent(
                id,
                rideId,
                userId,
                registrationRequest.isDriver(),
                registrationRequest.isCanBeDriver(),
                registrationRequest.getPickupLat(),
                registrationRequest.getPickupLong(),
                registrationRequest.getPickupRadius(),
                registrationRequest.getVehicleId()
            );

            return ResponseEntity.ok(result);
        } catch (
            ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (
            AlreadyRegisteredException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Internal server error.");
        }
    }
}
