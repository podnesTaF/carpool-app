package com.itinside.carpoolingAPI.services;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import com.itinside.carpoolingAPI.exceptions.AlreadyRegisteredException;
import com.itinside.carpoolingAPI.exceptions.ResourceNotFoundException;
import org.hibernate.ObjectNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import com.itinside.carpoolingAPI.dto.EventDTO;
import com.itinside.carpoolingAPI.models.Event;
import com.itinside.carpoolingAPI.models.Ride;
import com.itinside.carpoolingAPI.models.User;
import com.itinside.carpoolingAPI.models.Vehicle;
import com.itinside.carpoolingAPI.repositories.EventRepository;
import com.itinside.carpoolingAPI.repositories.RideRepository;
import com.itinside.carpoolingAPI.repositories.UserRepository;
import com.itinside.carpoolingAPI.repositories.VehicleRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class EventService {
    private final EventRepository eventRepository;
    private final RideRepository rideRepository;
    private final UserRepository userRepository;
    private final VehicleRepository vehicleRepository;
    private final RideService rideService;
    private final NotificationService notificationService;

    public List<EventDTO> getEvents() {
        List<Event> events = (List<Event>) eventRepository.findAll();

        return events.stream()
            .map((event) -> EventDTO.fromEntity(event, true))
            .toList();
    }

    /**
     * Creates a new event with the provided details.
     *
     * @param title            The title of the event.
     * @param description      The description of the event.
     * @param startDateTime    The start date of the event.
     * @param endDateTime      The end date of the event.
     * @param address          The address of the event.
     * @param registerDeadline The deadline for registration.
     * @param longitude        The longitude of the event location.
     * @param latitude         The latitude of the event location.
     * @param bannerUrl        The banner URL for the event.
     * @return The created Event object.
     */
    public Event createEvent(String title, String description, LocalDateTime startDateTime, LocalDateTime endDateTime,
                             String address,
                             LocalDateTime registerDeadline, float longitude, float latitude, String bannerUrl) {
        Event event = Event.builder()
            .title(title)
            .description(description)
            .startDateTime(startDateTime)
            .startDateTime(endDateTime)
            .address(address)
            .registerDeadline(registerDeadline)
            .longitude(longitude)
            .latitude(latitude)
            .bannerUrl(bannerUrl)
            .build();

        return eventRepository.save(event);
    }

    public EventDTO getEvent(Long eventId) {
        Optional<Event> eventOptional = eventRepository.findById(eventId);

        if (eventOptional.isPresent()) {
            Event event = eventOptional.get();

            return EventDTO.fromEntity(event, true);
        } else {
            throw new ObjectNotFoundException(eventOptional, "Event not found");
        }

    }

    public String registerForEvent(Long eventId, Optional<Long> rideId, Long userId, boolean isDriver,
                                   boolean canBeDriver,
                                   Float pickupLat, Float pickupLong, Float pickupRadius, Long vehicleId) {
        Event event = eventRepository.findById(eventId)
            .orElseThrow(() -> new ResourceNotFoundException("Event not found: " + eventId));
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

        if (event.getStartDateTime().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Cannot register for an event that already ended.");
        }

        boolean isAlreadyRegistered = rideRepository.existsByEventAndUser(event, user);
        if (isAlreadyRegistered) {
            throw new AlreadyRegisteredException("User " + userId + " already registered for event " + eventId);
        }

        boolean isLateRegistration = LocalDateTime.now().isAfter(event.getRegisterDeadline()) || rideId.isPresent();

        Ride ride = new Ride();
        ride.setEvent(event);
        ride.setUser(user);
        ride.setPickupLat(pickupLat);
        ride.setPickupLong(pickupLong);
        ride.setCanBeDriver(canBeDriver);
        ride.setDriver(isDriver);

        if ((isDriver || canBeDriver) && vehicleId != null) {
            Optional<Vehicle> vehicleOptional = vehicleRepository.findById(vehicleId);

            if (vehicleOptional.isEmpty()) {
                return "Vehicle not found";
            }

            Vehicle vehicle = vehicleOptional.get();
            ride.setVehicle(vehicle);
            ride.setPickupRadius(pickupRadius);
        }

        Ride savedRide = rideRepository.save(ride);

        if (isLateRegistration) {
            if (rideId.isPresent()) {
                Long driverId = rideId.get();
                // Late registration with a specified driver ride ID
                Ride driverRide = rideRepository.findById(driverId)
                    .orElseThrow(() -> new ObjectNotFoundException(driverId, "Specified driver ride not found"));

                // Ensure the driver ride has available space
                if (driverRide.getVehicle() != null &&
                    driverRide.getPassengerRides().size() < driverRide.getVehicle().getMaxPassengers()) {
                    List<Ride> driverRides = new ArrayList<>();
                    driverRides.add(driverRide);
                    rideService.assignLateRideToDriver(ride, driverRides);

                    return "User registered successfully for the event";
                } else {
                    return "The specified driver ride has no available space.";
                }
            } else {
                List<Ride> availableDrivers = rideRepository.findByEventId(eventId).stream()
                    .filter(Ride::isDriver)
                    .filter(driverRide -> {
                        assert driverRide.getVehicle() != null;
                        return driverRide.getPassengerRides().size() < driverRide.getVehicle().getMaxPassengers();
                    })
                    .toList();

                if (availableDrivers.isEmpty()) {
                    return "No available drivers for late registration.";
                }

                // Assign the passenger to the most suitable driver using AI
                rideService.assignLateRideToDriver(ride, availableDrivers);
            }
        }

//         NOTIFY
            if (isDriver) {
                notificationService.notifyDriverAssigned(savedRide.getId());
            } else {
                if (savedRide.getDriverRide() != null) {
                    notificationService.notifyPassengersAssigned(savedRide.getDriverRide().getId());
                }
            }
        return "User registered successfully for the event";
    }
}
