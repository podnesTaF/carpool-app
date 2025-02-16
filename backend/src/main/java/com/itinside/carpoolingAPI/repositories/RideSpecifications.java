package com.itinside.carpoolingAPI.repositories;

import com.itinside.carpoolingAPI.models.Ride;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class RideSpecifications {

    public static Specification<Ride> excludeArchived() {
        // Exclude rides whose event.endDateTime < now
        return (root, query, cb) ->
            cb.greaterThan(root.join("event").get("endDateTime"), LocalDateTime.now());
    }

    public static Specification<Ride> isDriver() {
        return (root, query, cb) ->
            cb.isTrue(root.get("isDriver"));
    }

    public static Specification<Ride> isActive() {
        return (root, query, cb) -> cb.and(
            cb.lessThan(
                root.join("event").get("registerDeadline"),
                root.join("event").get("endDateTime")
            ),
            cb.lessThan(
                root.join("event").get("registerDeadline"),
                LocalDateTime.now()
            )
        );
    }
}
