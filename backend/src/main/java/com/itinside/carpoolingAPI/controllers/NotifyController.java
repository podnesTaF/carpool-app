package com.itinside.carpoolingAPI.controllers;

import com.itinside.carpoolingAPI.services.MailService;
import com.itinside.carpoolingAPI.services.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/notify")
public class NotifyController {
    private final MailService mailService;
    private final NotificationService notificationService;

    @GetMapping("/driver-assigned/{id}")
    public void NotifyDriverAssigned(
        @PathVariable Long id
    ) {
        notificationService.notifyDriverAssigned(id);
    }

    @GetMapping("/event-deadline/{id}")
    public void NotifyEventDeadline(
        @PathVariable Long id
    ) {
        notificationService.notifyEventDeadlineApproaching(id);
    }

    @GetMapping("/new-event/{id}")
    public void NotifyEvent(
        @PathVariable Long id
    ) {
        notificationService.NotifyNewEvent(id);
    }
}
