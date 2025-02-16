package com.itinside.carpoolingAPI.config;

import com.itinside.carpoolingAPI.eventhandlers.EventEventHandler;
import com.itinside.carpoolingAPI.services.EventSchedulingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RepositoryConfiguration {
    private final EventSchedulingService eventSchedulingService;

    @Autowired
    public RepositoryConfiguration(EventSchedulingService eventSchedulingService) {
        this.eventSchedulingService = eventSchedulingService;
    }


    @Bean
    EventEventHandler eventHandler() {
        return new EventEventHandler(eventSchedulingService);
    }
}
