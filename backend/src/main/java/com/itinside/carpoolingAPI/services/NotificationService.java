package com.itinside.carpoolingAPI.services;

import com.itinside.carpoolingAPI.dto.NotificationDTO;
import com.itinside.carpoolingAPI.models.*;
import com.itinside.carpoolingAPI.repositories.EventRepository;
import com.itinside.carpoolingAPI.repositories.NotificationRepository;
import com.itinside.carpoolingAPI.repositories.RideRepository;
import com.itinside.carpoolingAPI.repositories.UserRepository;
import jakarta.mail.MessagingException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class NotificationService {
    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final RideRepository rideRepository;
    private final EventRepository eventRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final MailService mailService;

    private Notification createAndSaveNotification(NotificationDTO notificationDTO) {
        // get linked user
        Optional<User> linkedUser = notificationDTO.getUserId() != null ? userRepository.findById(notificationDTO.getUserId()) : Optional.empty();

        // create notification object
        Notification notification = Notification.builder().title(notificationDTO.getTitle()).description(notificationDTO.getDescription()).type(notificationDTO.getType()).isRead(notificationDTO.isRead()).actions(notificationDTO.getActions()).user(linkedUser.orElse(null)).build();

        return notificationRepository.save(notification);
    }

    /**
     * Send a notification to all users subscribed to "/topic/notifications".
     */
    public void sendNotification(NotificationDTO notificationDTO) {
        Notification notification = createAndSaveNotification(notificationDTO);
        messagingTemplate.convertAndSend("/topic/notifications", notification);
    }

    /**
     * Send a notification to a specific user.
     *
     * @param notificationDTO The notification object to send.
     * @param userId          The ID of the specific user to notify.
     */
    public void sendSpecific(NotificationDTO notificationDTO, Long userId) {
        Notification notification = createAndSaveNotification(notificationDTO);

        // Send the notification to the specific user's queue
        messagingTemplate.convertAndSend("/user/queue/specific-user-user/" + userId, // The destination suffix for the specific user
            notification // The notification payload
        );
    }

    public void NotifyNewEvent(Long id) {
        if (id == null) {
            log.error("Received null event ID");
            return;
        }

        try {
            Optional<Event> eventOptional = eventRepository.findById(id);

            if (eventOptional.isEmpty()) {
                log.error("No event found with ID: {}", id);
                return;
            }

            Event event = eventOptional.get();

            if (event.getTitle() == null) {
                log.error("Event title is null for event ID: {}", id);
                return;
            }

            // Send email with error handling
            try {
                mailService.sendNewEventMail(event);
            } catch (MessagingException e) {
                log.error("Failed to send email notification for event ID: {}", id, e);
                // Continue execution - don't let email failure prevent WS notifications
            }

            // Create notification with null checks
            NotificationDTO notificationDTO = NotificationDTO.builder()
                .title("New event: " + event.getTitle())
                .description("A new event has been created.")
                .type(Notification.NotificationType.SYSTEM)
                .isRead(false)
                .actions(List.of(NotificationAction.builder()
                    .type(Notification.NotificationActionEnum.VIEW_EVENT)
                    .object_id(event.getId())
                    .build()))
                .build();

            try {
                sendNotification(notificationDTO);
            } catch (Exception e) {
                log.error("Failed to send broadcast notification for event ID: {}", id, e);
            }

        } catch (Exception e) {
            log.error("Unexpected error while processing new event notification for ID: {}", id, e);
        }
    }

    public void notifyDriverAssigned(Long id) {
        if (id == null) {
            log.error("Received null ride ID");
            return;
        }

        try {
            Optional<Ride> rideOptional = rideRepository.findById(id);

            if (rideOptional.isEmpty()) {
                log.error("No ride found with ID: {}", id);
                return;
            }

            Ride ride = rideOptional.get();

            // Validate required objects
            if (ride.getEvent() == null) {
                log.error("Event is null for ride ID: {}", id);
                return;
            }

            if (ride.getUser() == null) {
                log.error("User is null for ride ID: {}", id);
                return;
            }

            String eventTitle = ride.getEvent().getTitle();
            if (eventTitle == null) {
                log.error("Event title is null for ride ID: {}", id);
                return;
            }

            // Send email with error handling
            try {
                mailService.sendDriverAssignedMail(ride);
            } catch (MessagingException e) {
                log.error("Failed to send email notification for ride ID: {}", id, e);
                // Continue execution - don't let email failure prevent WS notifications
            }

            // Create notification with null checks
            NotificationDTO notificationDTO = NotificationDTO.builder()
                .title("You are assigned as driver")
                .description("You are driving to " + eventTitle)
                .type(Notification.NotificationType.SYSTEM)
                .isRead(false)
                .actions(List.of(NotificationAction.builder()
                    .type(Notification.NotificationActionEnum.VIEW_RIDE)
                    .object_id(ride.getId())
                    .build()))
                .build();

            try {
                sendSpecific(notificationDTO, ride.getUser().getId());
            } catch (Exception e) {
                log.error("Failed to send notification to driver ID: {} for ride ID: {}",
                    ride.getUser().getId(), id, e);
            }

        } catch (Exception e) {
            log.error("Unexpected error while processing driver assignment notification for ride ID: {}", id, e);
        }
    }

    public void notifyPassengersAssigned(Long id) {
        if (id == null) {
            log.error("Received null ride ID");
            return;
        }

        try {
            Optional<Ride> rideOptional = rideRepository.findById(id);

            if (rideOptional.isEmpty()) {
                log.error("No ride found with ID: {}", id);
                return;
            }

            Ride ride = rideOptional.get();

            // Validate ride and related objects
            if (ride.getDriverRide() == null) {
                log.error("Driver ride is null for ride ID: {}", id);
                return;
            }

            if (ride.getEvent() == null) {
                log.error("Event is null for ride ID: {}", id);
                return;
            }

            if (ride.getDriverRide().getUser() == null) {
                log.error("Driver user is null for ride ID: {}", id);
                return;
            }

            // Send email with error handling
            try {
                mailService.sendPassengersAssignedMail(ride);
            } catch (MessagingException e) {
                log.error("Failed to send email notification for ride ID: {}", id, e);
                // Continue execution - don't let email failure prevent WS notifications
            }

            // Build notification with null-safe values
            NotificationDTO notificationDTO = NotificationDTO.builder()
                .title("Joined carpool to the event: " +
                    (ride.getEvent() != null ? ride.getEvent().getTitle() : "Unknown Event") + "!")
                .description("You joined " +
                    (ride.getDriverRide().getUser() != null ?
                        ride.getDriverRide().getUser().getUsername() : "unknown driver") + "'s ride!")
                .type(Notification.NotificationType.SYSTEM)
                .isRead(false)
                .actions(List.of(NotificationAction.builder()
                    .type(Notification.NotificationActionEnum.VIEW_RIDE)
                    .object_id(ride.getId())
                    .build()))
                .build();

            // Send notifications to passengers
            if (ride.getPassengerRides() == null) {
                log.error("Passenger rides list is null for ride ID: {}", id);
                return;
            }

            List<User> passengers = ride.getPassengerRides().stream()
                .filter(Objects::nonNull)
                .map(Ride::getUser)
                .filter(Objects::nonNull)
                .toList();

            if (passengers.isEmpty()) {
                log.warn("No valid passengers found for ride ID: {}", id);
                return;
            }

            for (User passenger : passengers) {
                try {
                    sendSpecific(notificationDTO, passenger.getId());
                } catch (Exception e) {
                    log.error("Failed to send notification to passenger ID: {}", passenger.getId(), e);
                    // Continue with next passenger
                }
            }

        } catch (Exception e) {
            log.error("Unexpected error while processing ride notifications for ID: {}", id, e);
        }
    }

    public void notifyRideCancelledAssigned(Ride ride) {
        Iterable<User> passengers = ride.getPassengerRides().stream().map(Ride::getUser).toList();
        NotificationDTO cancelCarpoolNotification = NotificationDTO.builder()
            .title("Cancelled carpool: " + ride.getEvent().getTitle())
            .description("Successfully cancelled the carpool")
            .type(Notification.NotificationType.SYSTEM)
            .isRead(false)
            .build();

        passengers.forEach((passenger) -> {
            sendSpecific(cancelCarpoolNotification, passenger.getId());
        });

        try {
            mailService.sendCarpoolCancelledMail(ride);
        } catch (MessagingException e) {
            throw new RuntimeException(e);
        }
    }

    public void notifyEventDeadlineApproaching(Long eventId) {

        Optional<Event> eventOptional = eventRepository.findById(eventId);
        if (eventOptional.isEmpty()) {
            throw new RuntimeException("Event not found");
        }
        Event event = eventOptional.get();
        Iterable<User> users = userRepository.findAll();
//        Iterable<User> passengers = ride.getPassengerRides().stream().map(Ride::getUser).toList();
        NotificationDTO cancelCarpoolNotification = NotificationDTO.builder()
            .title("Deadline approaching for: " + event.getTitle())
            .description("Decide if you want to go to this event and join a carpool!")
            .type(Notification.NotificationType.SYSTEM)
            .actions(List.of(NotificationAction.builder().type(Notification.NotificationActionEnum.VIEW_EVENT).object_id(event.getId()).build()))
            .isRead(false)
            .build();

        users.forEach((user) -> {
            sendSpecific(cancelCarpoolNotification, user.getId());
        });

        try {
            mailService.sendEventDeadlineApproachingMail(event);
        } catch (MessagingException e) {
            throw new RuntimeException(e);
        }
    }
}
