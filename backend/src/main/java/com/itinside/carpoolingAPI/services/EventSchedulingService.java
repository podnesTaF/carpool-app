package com.itinside.carpoolingAPI.services;

import com.itinside.carpoolingAPI.models.Event;
import com.itinside.carpoolingAPI.repositories.EventRepository;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.TaskScheduler;
import org.springframework.scheduling.Trigger;
import org.springframework.scheduling.support.CronTrigger;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.concurrent.ScheduledFuture;

@Slf4j
@Service
public class EventSchedulingService {
    private final RideService rideService;
    private final EventRepository eventRepository;
    private final TaskScheduler taskScheduler;

    public EventSchedulingService(RideService rideService,
                                  EventRepository eventRepository,
                                  TaskScheduler taskScheduler) {
        this.rideService = rideService;
        this.eventRepository = eventRepository;
        this.taskScheduler = taskScheduler;
    }

    @PostConstruct
    public void scheduleExistingEvents() {
        // Schedule all upcoming events that haven't been archived.
        List<Event> nonArchivedEvents = eventRepository.findByIsArchivedFalse();
        for (Event event : nonArchivedEvents) {
            scheduleEventRideAssignment(event);
        }
    }

    public void scheduleEventRideAssignment(Event event) {
        if (event.getRegisterDeadline() == null) {
            log.warn("Cannot schedule ride assignment for event {} as it has no registration deadline", event.getId());
            return;
        }

        // Convert the event's registration deadline to a cron expression.
        String cronExpression = getCronExpression(event.getRegisterDeadline());
        Trigger trigger = new CronTrigger(cronExpression);

        // Schedule the task using the TaskScheduler.
        ScheduledFuture<?> future = taskScheduler.schedule(() -> {
            try {
                log.info("Starting ride assignment for event {}", event.getId());
                rideService.assignRidesForEvent(event.getId());
                log.info("Completed ride assignment for event {}", event.getId());
            } catch (Exception e) {
                log.error("Error assigning rides for event {}", event.getId(), e);
            }
        }, trigger);

        log.info("Scheduled ride assignment for event {} at {}. Future: {}",
            event.getId(), event.getRegisterDeadline(), future);
    }

    /**
     * Converts a LocalDateTime to a cron expression.
     * Spring cron expressions have the format: "sec min hour day month day-of-week".
     * Here we use '?' for the day-of-week.
     */
    private String getCronExpression(LocalDateTime dateTime) {
        return String.format("%d %d %d %d %d ?",
            dateTime.getSecond(),
            dateTime.getMinute(),
            dateTime.getHour(),
            dateTime.getDayOfMonth(),
            dateTime.getMonthValue());
    }
}
