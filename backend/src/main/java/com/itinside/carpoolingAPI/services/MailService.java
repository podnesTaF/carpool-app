package com.itinside.carpoolingAPI.services;

import com.itinside.carpoolingAPI.models.Event;
import com.itinside.carpoolingAPI.models.Ride;
import com.itinside.carpoolingAPI.models.User;
import com.itinside.carpoolingAPI.repositories.RideRepository;
import com.itinside.carpoolingAPI.repositories.UserRepository;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class MailService {
    private final JavaMailSender emailSender;
    private final SpringTemplateEngine thymeleafTemplateEngine;
    private final UserRepository userRepository;
    private final RideRepository rideRepository;

    public void sendCarpoolCancelledMail(Ride ride) throws MessagingException {
        String subject = "Axxes Carpool: carpool cancelled";
        Iterable<User> passengers = ride.getPassengerRides().stream().map(Ride::getUser).toList();
        Map<String, Object> templateModel = new HashMap<>();
        templateModel.put("event", ride.getEvent());
        templateModel.put("driver", ride.getUser());

        // Notify the passengers
        passengers.forEach((user -> {
            try {
                sendMessageUsingThymeleafTemplate("template-carpool-cancelled.html", user, subject,
                    templateModel);
            } catch (MessagingException e) {
                throw new RuntimeException(e);
            }
        }));

    }

    public void sendPassengersAssignedMail(Ride driverRide) throws MessagingException {
        String subject = "Axxes Carpool: Assigned as passenger to carpool";
        Iterable<User> passengers = driverRide.getPassengerRides().stream().map((ride) -> ride.getUser()).toList();
        log.info("passengers to send mail to: " + passengers);
        Map<String, Object> templateModel = new HashMap<>();
        templateModel.put("ride", driverRide);
        passengers.forEach((passenger -> {
            try {
                if (passenger != null) {
                    sendMessageUsingThymeleafTemplate("template-new-event.html", passenger,
                        subject,
                        templateModel);
                }
            } catch (MessagingException e) {
                throw new RuntimeException(e);
            }
        }));
    }


    public void sendEventDeadlineApproachingMail(Event event) throws MessagingException {
        String subject = "Axxes Carpool: Event deadline approaching!";
        Iterable<User> users = userRepository.findAll();
        Map<String, Object> templateModel = new HashMap<>();
        templateModel.put("event", event);
        users.forEach((user -> {
            try {
                if (user != null) {
                    sendMessageUsingThymeleafTemplate("template-deadline-reminder.html", user,
                        subject,
                        templateModel);
                }
            } catch (MessagingException e) {
                throw new RuntimeException(e);
            }
        }));
    }


    public void sendDriverAssignedMail(Ride ride) throws MessagingException {
        String subject = "Axxes Carpool: Assigned as driver to carpool";
        User driver = ride.getUser();
        Map<String, Object> templateModel = new HashMap<>();
        templateModel.put("ride", ride);
        try {
            sendMessageUsingThymeleafTemplate("template-driver-assigned.html", driver, subject,
                templateModel);
        } catch (MessagingException e) {
            throw new RuntimeException(e);
        }

    }

    public void sendNewEventMail(Event newEvent) throws MessagingException {
        String subject = "Axxes Carpool: New Event " + newEvent.getTitle();
        Iterable<User> users = userRepository.findAll();
        Map<String, Object> templateModel = new HashMap<>();
        templateModel.put("event", newEvent);
        users.forEach((user -> {
            try {
                sendMessageUsingThymeleafTemplate("template-new-event.html", user, subject,
                    templateModel);
            } catch (MessagingException e) {
                throw new RuntimeException(e);
            }
        }));

    }

    public void sendMessageUsingThymeleafTemplate(String templateName, User toUser, String subject,
                                                  Map<String, Object> templateModel) throws MessagingException {

        Context thymeleafContext = new Context();
        templateModel.put("user", toUser);
        templateModel.put("frontendUrl", System.getenv("FRONTEND_URL"));
        thymeleafContext.setVariables(templateModel);
        // template-thymeleaf.html
        String htmlBody = thymeleafTemplateEngine.process(templateName, thymeleafContext);

        if (toUser.getEmail() != null) {
            sendHtmlMessage(toUser.getEmail(), subject, htmlBody);
        } else {
            log.info("User has no email address provided, cannot send mail");
        }
    }

    public void sendTestMail() throws MessagingException {
        Map<String, Object> templateModel = new HashMap<>();
        templateModel.put("recipientName", "John Doe");
        templateModel.put("senderName", "Carpooling app");
        templateModel.put("text", "Thank you for signing up");
        templateModel.put("regards", "See you later!");
        Optional<User> user = userRepository.findByEmail("janpeter.dhalle@gmail.com");
        if (user.isPresent()) {
            if (user.get().getEmail() != null) {
                sendMessageUsingThymeleafTemplate("template-thymeleaf.html", user.get(), "Test Subject",
                    templateModel);
            } else {
                log.info("User has no email address provided, cannot send mail");
            }

        }
    }

    private void sendHtmlMessage(String to, String subject, String htmlBody) throws MessagingException {
        MimeMessage message = emailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
        helper.setTo(to);
        helper.setFrom("Axxes Carpooling App <" + System.getenv("MAIL_USERNAME") + ">");
        helper.setSubject(subject);
        helper.setText(htmlBody, true);
        emailSender.send(message);
    }

    public void sendSimpleMessage(String to, String subject, String text) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom("Axxes Carpooling App <" + System.getenv("MAIL_USERNAME") + ">");
        message.setTo(to);
        message.setSubject(subject);
        message.setText(text);
        emailSender.send(message);
    }
}