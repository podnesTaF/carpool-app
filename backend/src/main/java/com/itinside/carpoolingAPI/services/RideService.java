package com.itinside.carpoolingAPI.services;

import com.itinside.carpoolingAPI.dto.RideDTO;
import com.itinside.carpoolingAPI.dto.RideProjectionDTO;
import com.itinside.carpoolingAPI.exceptions.AiAlgorithmException;
import com.itinside.carpoolingAPI.exceptions.DriverRideNotFoundException;
import com.itinside.carpoolingAPI.exceptions.RideNotAvailableException;
import com.itinside.carpoolingAPI.exceptions.RideNotFoundException;
import com.itinside.carpoolingAPI.models.Event;
import com.itinside.carpoolingAPI.models.Ride;
import com.itinside.carpoolingAPI.models.User;
import com.itinside.carpoolingAPI.repositories.EventRepository;
import com.itinside.carpoolingAPI.repositories.RideRepository;
import com.itinside.carpoolingAPI.repositories.RideSpecifications;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.hibernate.ObjectNotFoundException;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.*;
import org.springframework.messaging.MessagingException;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class RideService {
    private final RideRepository rideRepository;
    private final EventRepository eventRepository;
    private final RestTemplate restTemplate;
    private final NotificationService notificationService;

    private static final String ASSIGN_USERS_API_URL = System.getenv("AI_SERVICE_API_URL") + "/rides/assign-users";

    public List<RideDTO> getRidesForEvent(Long eventId, boolean includeDriver, boolean includePassengers,
                                          boolean loadFullDriver,
                                          boolean loadFullPassengers) {
        List<Ride> rides = rideRepository.findByEventId(eventId);

        return rides.stream()
            .map(ride -> RideDTO.fromEntity(ride, includeDriver, includePassengers, loadFullDriver,
                loadFullPassengers))
            .collect(Collectors.toList());
    }

    public List<RideDTO> getUsersRides(Long userId, String type, boolean includeDriver, boolean includePassengers,
                                       boolean loadFullDriver,
                                       boolean loadFullPassengers) {
        List<Ride> rides = rideRepository.findByUserId(userId);

        if (Objects.equals(type, "driver")) {
            rides = rides.stream()
                .filter(Ride::isDriver)
                .collect(Collectors.toList());
        } else if (Objects.equals(type, "passenger")) {
            rides = rides.stream()
                .filter(ride -> !ride.isDriver())
                .collect(Collectors.toList());
        }

        return rides.stream()
            .map(ride -> RideDTO.fromEntity(ride, includeDriver, includePassengers, loadFullDriver,
                loadFullPassengers))
            .collect(Collectors.toList());
    }

    public Page<RideDTO> getAllRides(
        String eventTitle,
        boolean includeArchive,
        boolean driversOnly,
        boolean isActive,
        int page,
        int size
    ) {
        // Create a Pageable object
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());

        // Build a dynamic specification
        Specification<Ride> spec = Specification.where(null);

        // Exclude archived rides if includeArchive = false
        if (!includeArchive) {
            spec = spec.and(RideSpecifications.excludeArchived());
        }
        // Only drivers if driversOnly = true
        if (driversOnly) {
            spec = spec.and(RideSpecifications.isDriver());
        }
        // "Active" events if isActive = true
        if (isActive) {
            spec = spec.and(RideSpecifications.isActive());
        }

        Page<Ride> resultPage = rideRepository.findAll(spec, pageable);

        // Map each Ride to RideDTO
        return resultPage.map(ride -> RideDTO.fromEntity(ride, true, true, false, false));
    }

    public RideDTO getRideById(Long rideId, boolean includeDriver, boolean includePassengers, boolean loadFullDriver,
                               boolean loadFullPassengers, boolean isAdmin) {
        // Fetch the ride by ID
        Optional<Ride> optionalRide = rideRepository.findById(rideId);

        // If the ride exists, map it to a RideDTO
        if (optionalRide.isPresent()) {
            Ride ride = optionalRide.get();
            if (ride.getEvent() != null && ride.getEvent().getRegisterDeadline().isAfter(LocalDateTime.now()) && !isAdmin) {
                throw new RideNotAvailableException(rideId);
            }
            // If the ride belongs to a passenger, fetch the ride of the driver
            if (!ride.isDriver()) {
                if (ride.getDriverRide() == null) {
                    throw new DriverRideNotFoundException(rideId);
                }

                Ride driverRide = rideRepository.findById(ride.getDriverRide().getId())
                    .orElseThrow(() -> new DriverRideNotFoundException(ride.getDriverRide().getId()));
                return RideDTO.fromEntity(driverRide, includeDriver, includePassengers, loadFullDriver, loadFullPassengers);
            }

            return RideDTO.fromEntity(ride, includeDriver, includePassengers, loadFullDriver, loadFullPassengers);
        }

        throw new RideNotFoundException(rideId);
    }

    public List<RideDTO> assignRidesForEvent(Long eventId) {
        // Query the event and associated rides
        List<Ride> rides = rideRepository.findByEventId(eventId);

        if (rides.isEmpty()) {
            return new ArrayList<>();
        }

        List<RideDTO> rideDTOs = rides.stream()
            .map(ride -> RideDTO.fromEntity(ride, false, false, true, true))
            .toList();

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<List<RideDTO>> requestEntity = new HttpEntity<>(rideDTOs, headers);

        ResponseEntity<List<RideProjectionDTO>> responseEntity = restTemplate.exchange(
            ASSIGN_USERS_API_URL,
            HttpMethod.POST,
            requestEntity,
            new ParameterizedTypeReference<List<RideProjectionDTO>>() {
            });

        List<RideProjectionDTO> response = responseEntity.getBody();

        if(response.isEmpty()) {
            throw new AiAlgorithmException("Algorithm ran unsuccessfully");
        }

        for (RideProjectionDTO rideData : response) {
            Long rideId = rideData.getId();
            Long driverRideId = rideData.getDriverId();
            // Find the ride in the repository
            Optional<Ride> rideOptional = rideRepository.findById(rideId);
            if (rideOptional.isPresent()) {
                Ride ride = rideOptional.get();

                // Assign the driverRide if present
                if (driverRideId != null) {
                    Optional<Ride> driverRideOptional = rideRepository.findById(driverRideId);
                    driverRideOptional.ifPresent(ride::setDriverRide);
                }
                String startDateTimeString = rideData.getStartDateTime();
                if (startDateTimeString != null) {
                    DateTimeFormatter formatter = DateTimeFormatter.ISO_DATE_TIME; // ISO 8601 format
                    LocalDateTime startDateTime = LocalDateTime.parse(startDateTimeString, formatter);
                    ride.setStartDateTime(startDateTime);
                }
                // Update other ride properties if necessary
                ride.setPickupLat(rideData.getPickupLat());
                ride.setPickupLong(rideData.getPickupLong());
                ride.setPickupRadius(rideData.getPickupRadius());
                ride.setPickupSequence(rideData.getPickupSequence());
                ride.setCanBeDriver(rideData.isCanBeDriver());
                ride.setDriver(rideData.isDriver());
                ride.setMaxPassengers(rideData.getMaxPassengers());

                // Save the updated ride back to the repository
                rideRepository.save(ride);
            }
        }

        List<Ride> updatedRides = rideRepository.findByEventId(eventId);

        updatedRides.stream().filter(Ride::isDriver)
            .forEach((ride) -> {
                // notify driver and passengers
                notificationService.notifyDriverAssigned(ride.getId());
                notificationService.notifyPassengersAssigned(ride.getId());
            });

        return updatedRides.stream()
            .map(ride -> RideDTO.fromEntity(ride, true, true, false, false))
            .collect(Collectors.toList());
    }

    public void assignLateRideToDriver(Ride passengerRide, List<Ride> availableDrivers) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        List<RideDTO> allRides = availableDrivers.stream()
            .map(driver -> RideDTO.fromEntity(driver, true, true, true, true))
            .collect(Collectors.toList());
        allRides.add(RideDTO.fromEntity(passengerRide, false, false, false, false)); // Add passenger

        HttpEntity<List<RideDTO>> requestEntity = new HttpEntity<>(allRides, headers);

        try {
            ResponseEntity<List<RideProjectionDTO>> responseEntity = restTemplate.exchange(
                ASSIGN_USERS_API_URL,
                HttpMethod.POST,
                requestEntity,
                new ParameterizedTypeReference<List<RideProjectionDTO>>() {
                });

            List<RideProjectionDTO> response = responseEntity.getBody();
            updateAssignedRides(response);
        } catch (HttpClientErrorException | HttpServerErrorException e) {
            System.err.println("Error during late registration ride assignment: " + e.getMessage());
        } catch (Exception e) {
            System.err.println("Unexpected error: " + e.getMessage());
        }
    }

    public void updateAssignedRides(List<RideProjectionDTO> rideProjections) {
        for (RideProjectionDTO rideData : rideProjections) {
            Optional<Ride> rideOptional = rideRepository.findById(rideData.getId());
            if (rideOptional.isPresent()) {
                Ride ride = rideOptional.get();

                if (rideData.getDriverId() != null) {
                    Optional<Ride> driverRideOptional = rideRepository.findById(rideData.getDriverId());
                    driverRideOptional.ifPresent(ride::setDriverRide);
                }

                ride.setPickupLat(rideData.getPickupLat());
                ride.setPickupLong(rideData.getPickupLong());
                ride.setPickupRadius(rideData.getPickupRadius());
                ride.setPickupSequence(rideData.getPickupSequence());
                ride.setMaxPassengers(rideData.getMaxPassengers());
                if (rideData.getStartDateTime() != null) {
                    ride.setStartDateTime(
                        LocalDateTime.parse(rideData.getStartDateTime(), DateTimeFormatter.ISO_DATE_TIME));
                }

                rideRepository.save(ride);
                if (ride.isDriver()) {
                    try {
                        notificationService.notifyDriverAssigned(ride.getId());
                        notificationService.notifyPassengersAssigned(ride.getId());
                    } catch (MessagingException e) {
                        e.printStackTrace();
                    }
                }
            }
        }
    }

    @Transactional
    public ResponseEntity<?> cancelRide(Long rideId, Long authId, boolean isAdmin) {
        Optional<Ride> rideOptional = rideRepository.findById(rideId);

        if (rideOptional.isEmpty()) {
            return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body("Ride with ID " + rideId + " not found");
        }

        Ride ride = rideOptional.get();
        Event event = ride.getEvent();
        boolean isDriver = ride.isDriver();
        LocalDateTime now = LocalDateTime.now();

        // Get data for notifications
        User rideUser = ride.getUser();
        if(!Objects.equals(rideUser.getId(), authId) && !isAdmin) {
            return ResponseEntity
                .status(HttpStatus.FORBIDDEN)
                .body("You are not authorized to cancel this ride.");
        }

        if (isDriver) {
            // Handle driver cancellation
            List<Ride> passengers = new ArrayList<>(ride.getPassengerRides());

            passengers.forEach(passenger -> {
                passenger.setDriverRide(null);
                rideRepository.save(passenger);
            });

            // Clear the driver's passenger list
            ride.getPassengerRides().clear();

            // Notify
            notificationService.notifyRideCancelledAssigned(ride);

            // Delete the driver ride
            rideRepository.delete(ride);

            rideRepository.flush();


            // Assign passengers to other drivers if needed
            List<Ride> availableDrivers = rideRepository.findByEventId(event.getId()).stream()
                .filter(Ride::isDriver)
                .filter(driverRide -> {
                    assert driverRide.getVehicle() != null;
                    return driverRide.getPassengerRides().size() < driverRide.getVehicle().getMaxPassengers();
                })
                .toList();

            if (!passengers.isEmpty()) {
                reassignPassengersToDrivers(passengers, availableDrivers);
            }

        } else {
            // Handle passenger cancellation
            Ride driverRide = ride.getDriverRide();

            // Remove the passenger ride
            rideRepository.delete(ride);

            // If the event is within 24 hours, reassign the driver and remaining passengers
            if (driverRide != null) {
                List<Ride> unassignedPassengers = rideRepository.findByEventId(event.getId()).stream()
                    .filter(ride1 -> {
                        return ride1.getDriverRide() == null;
                    }).toList();

                driverRide.getPassengerRides().remove(ride);
                reassignPassengersToDriver(driverRide, unassignedPassengers);
            }

        }
        return ResponseEntity.ok("Ride canceled successfully.");
    }

    private void reassignPassengersToDrivers(List<Ride> passengers, List<Ride> drivers) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        // Prepare the combined list of drivers and passengers
        List<RideDTO> allRides = drivers.stream()
            .map(driver -> RideDTO.fromEntity(driver, false, false, false, false))
            .collect(Collectors.toList());
        allRides.addAll(passengers.stream()
            .map(passenger -> RideDTO.fromEntity(passenger, false, false, false, false))
            .toList());

        HttpEntity<List<RideDTO>> requestEntity = new HttpEntity<>(allRides, headers);

        try {
            ResponseEntity<List<RideProjectionDTO>> responseEntity = restTemplate.exchange(
                ASSIGN_USERS_API_URL,
                HttpMethod.POST,
                requestEntity,
                new ParameterizedTypeReference<List<RideProjectionDTO>>() {
                });

            List<RideProjectionDTO> response = responseEntity.getBody();
            updateAssignedRides(response);
        } catch (HttpClientErrorException | HttpServerErrorException e) {
            System.err.println("Error during reassigning passengers: " + e.getMessage());
        } catch (Exception e) {
            System.err.println("Unexpected error: " + e.getMessage());
        }
    }

    public void reassignPassengersToDriver(Ride driverRide, List<Ride> passengers) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        // Combine the driver and passengers into a single list
        List<RideDTO> allRides = passengers.stream()
            .map(passenger -> RideDTO.fromEntity(passenger, false, false, false, false))
            .collect(Collectors.toList());
        allRides.add(RideDTO.fromEntity(driverRide, true, true, true, true));

        HttpEntity<List<RideDTO>> requestEntity = new HttpEntity<>(allRides, headers);

        try {
            ResponseEntity<List<RideProjectionDTO>> responseEntity = restTemplate.exchange(
                ASSIGN_USERS_API_URL,
                HttpMethod.POST,
                requestEntity,
                new ParameterizedTypeReference<List<RideProjectionDTO>>() {
                });

            List<RideProjectionDTO> response = responseEntity.getBody();
            updateAssignedRides(response);
        } catch (HttpClientErrorException | HttpServerErrorException e) {
            System.err.println("Error during reassigning passengers to driver: " + e.getMessage());
        } catch (Exception e) {
            System.err.println("Unexpected error: " + e.getMessage());
        }
    }

    @Transactional
    public void deleteRide(Long rideId) {
        Optional<Ride> rideOptional = rideRepository.findById(rideId);

        if (rideOptional.isEmpty()) {
            throw new ObjectNotFoundException(rideId, "Ride not found");
        }

        Ride ride = rideOptional.get();

        // Delete the Ride
        rideRepository.delete(ride);
    }
}
