package com.itinside.carpoolingAPI.repositories;

import com.itinside.carpoolingAPI.models.Event;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;

import java.util.List;

@RepositoryRestResource(collectionResourceRel = "events", path = "events")
public interface EventRepository extends JpaRepository<Event, Long> {
    List<Event> findByIsArchivedFalse();
}
