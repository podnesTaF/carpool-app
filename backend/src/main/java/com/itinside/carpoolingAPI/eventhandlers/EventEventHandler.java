package com.itinside.carpoolingAPI.eventhandlers;

import com.itinside.carpoolingAPI.models.Event;
import com.itinside.carpoolingAPI.services.EventSchedulingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.rest.core.annotation.HandleAfterCreate;
import org.springframework.data.rest.core.annotation.RepositoryEventHandler;

@Slf4j
@RepositoryEventHandler
@RequiredArgsConstructor
public class EventEventHandler {
    private final EventSchedulingService eventSchedulingService;

    @HandleAfterCreate
    public void handleEventAfterCreate(Event event) {
        // Schedule the event assignment
        eventSchedulingService.scheduleEventRideAssignment(event);
    }
}
