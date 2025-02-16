package com.itinside.carpoolingAPI.config;

import org.springframework.data.rest.core.config.RepositoryRestConfiguration;
import org.springframework.data.rest.webmvc.config.RepositoryRestConfigurer;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.config.annotation.CorsRegistry;

import com.itinside.carpoolingAPI.models.Event;
import com.itinside.carpoolingAPI.models.Genre;
import com.itinside.carpoolingAPI.models.Notification;
import com.itinside.carpoolingAPI.models.Ride;
import com.itinside.carpoolingAPI.models.User;
import com.itinside.carpoolingAPI.models.Vehicle;
import com.itinside.carpoolingAPI.projections.RideProjection;

@Component
public class SpringDataRestCustomization implements RepositoryRestConfigurer {

    @Override
    public void configureRepositoryRestConfiguration(RepositoryRestConfiguration config, CorsRegistry cors) {
        config.exposeIdsFor(Event.class);
        config.exposeIdsFor(Genre.class);
        config.exposeIdsFor(Notification.class);
        config.exposeIdsFor(Ride.class);
        config.exposeIdsFor(User.class);
        config.exposeIdsFor(Vehicle.class);
        // Configure projection to be used by default
        config.getProjectionConfiguration()
                .addProjection(RideProjection.class);
        cors.addMapping("/**")
            .allowedOrigins("http://localhost:3000", "http://localhost:8000")
            .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
            .allowedHeaders("*")
            .allowCredentials(true);
    }
}
