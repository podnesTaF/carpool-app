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
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

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
        Optional<Event> eventOptional = eventRepository.findById(id);
        if (eventOptional.isPresent()) {
            Event event = eventOptional.get();
            // first send email
            try {
                mailService.sendNewEventMail(event);
            } catch (MessagingException e) {
                throw new RuntimeException(e);
            }

            // send ws notification to everyone
            NotificationDTO notificationDTO = NotificationDTO.builder()
                .title("New event: " + event.getTitle())
                .description("A new event has created.")
                .type(Notification.NotificationType.SYSTEM)
                .isRead(false)
                .actions(List.of(NotificationAction.builder().type(Notification.NotificationActionEnum.VIEW_EVENT).object_id(event.getId()).build()))
                .build();

            sendNotification(notificationDTO);
        }
    }


    public void notifyDriverAssigned(Long id) {
        Optional<Ride> rideOptional = rideRepository.findById(id);
        if (rideOptional.isPresent()) {
            Ride ride = rideOptional.get();
            // first send email
            try {
                mailService.sendDriverAssignedMail(ride);
            } catch (MessagingException e) {
                throw new RuntimeException(e);
            }

            // send ws notification
            NotificationDTO notificationDTO = NotificationDTO.builder()
                .title("You are assigned as driver")
                .description("You are driving to " + ride.getEvent().getTitle())
                .type(Notification.NotificationType.SYSTEM)
                .isRead(false)
                .actions(List.of(NotificationAction.builder().type(Notification.NotificationActionEnum.VIEW_RIDE)
                    .object_id(ride.getId()).build()))
                .build();

            sendSpecific(notificationDTO, ride.getUser().getId());
        }
    }


    public void notifyPassengersAssigned(Long id) {
        Optional<Ride> rideOptional = rideRepository.findById(id);
        if (rideOptional.isPresent()) {
            Ride ride = rideOptional.get();
            // first send email
            try {
                mailService.sendPassengersAssignedMail(ride);
            } catch (MessagingException e) {
                throw new RuntimeException(e);
            }

            // send ws notification
            assert ride.getDriverRide() != null;
            NotificationDTO notificationDTO = NotificationDTO.builder()
                .title("Joined carpool to the event: " + ride.getEvent().getTitle() + "!")
                .description("You joined " + ride.getDriverRide().getUser().getUsername() + "'s ride!")
                .type(Notification.NotificationType.SYSTEM)
                .isRead(false)
                .actions(List.of(NotificationAction.builder().type(Notification.NotificationActionEnum.VIEW_RIDE)
                    .object_id(ride.getId()).build()))
                .build();

            Iterable<User> passengers = ride.getPassengerRides().stream().map(Ride::getUser).toList();
            passengers.forEach((passenger) -> {
                sendSpecific(notificationDTO, passenger.getId());
            });
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
