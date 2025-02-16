package com.itinside.carpoolingAPI.controllers;

import com.itinside.carpoolingAPI.dto.RideDTO;
import com.itinside.carpoolingAPI.services.AuthService;
import com.itinside.carpoolingAPI.services.RideService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/rides")
public class RideController {
    private final RideService rideService;
    private final AuthService authService;

    @PutMapping("/{id}/assign-users")
    public ResponseEntity<?> assignRides(
        @PathVariable Long id,
        @AuthenticationPrincipal Jwt jwt
        ) {

        boolean isAdmin = this.authService.isAdmin(jwt);

        if(!isAdmin) {
            return ResponseEntity
                .status(HttpStatus.FORBIDDEN)
                .body("Authenticated user is not an admin");
        }


        List<RideDTO> result = rideService.assignRidesForEvent(id);

        return ResponseEntity.ok(result);
    }

    @GetMapping("/all")
    public ResponseEntity<?> getAllRides(
        @AuthenticationPrincipal Jwt jwt,
        @RequestParam(required = false) String eventTitle,
        @RequestParam(defaultValue = "false") boolean includeArchive,
        @RequestParam(defaultValue = "false") boolean driversOnly,
        @RequestParam(defaultValue = "false") boolean isActive,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size
    ) {
        boolean isAdmin = authService.isAdmin(jwt);
        if (!isAdmin) {
            return ResponseEntity.badRequest().body("You are not an admin");
        }

        // Service method returns a Page<RideDTO> for pagination
        Page<RideDTO> rides = rideService.getAllRides(
            eventTitle,
            includeArchive,
            driversOnly,
            isActive,
            page,
            size
        );

        return ResponseEntity.ok(rides);
    }

    @GetMapping("/user")
    public ResponseEntity<List<RideDTO>> getUserRides(
        @RequestParam(required = false) String type,
        @AuthenticationPrincipal Jwt jwt
    ) {
        Long userId = authService.getAuthenticatedUserId(jwt);

        try {
            List<RideDTO> rides = rideService.getUsersRides(userId, type, true, true, true, true);

            if (rides.isEmpty()) {
                return ResponseEntity.noContent().build();
            }

            return ResponseEntity.ok(rides);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/event/{id}")
    public ResponseEntity<List<RideDTO>> getRidesByEvent(
        @PathVariable Long id
    ) {
        try {
            // Use the service method to get the rides for the event
            List<RideDTO> rides = rideService.getRidesForEvent(id, true, true, true, true);

            if (rides.isEmpty()) {
                // Return HTTP 204 No Content if no rides found
                return ResponseEntity.noContent().build();
            }

            // Return HTTP 200 OK with the list of rides
            return ResponseEntity.ok(rides);
        } catch (Exception e) {
            // Handle unexpected errors and return HTTP 500 Internal Server Error
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<RideDTO> getRideById(
        @PathVariable Long id,
        @AuthenticationPrincipal Jwt jwt
    ) {
        boolean isAdmin = authService.isAdmin(jwt);
        RideDTO ride = rideService.getRideById(id, true, true, true, true, isAdmin);
        return ResponseEntity.ok(ride);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> cancelRide(@PathVariable Long id, @AuthenticationPrincipal Jwt jwt) {
        Long authId = authService.getAuthenticatedUserId(jwt);
        boolean isAdmin = authService.isAdmin(jwt);
        return rideService.cancelRide(id, authId, isAdmin);
    }
}
