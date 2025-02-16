package com.itinside.carpoolingAPI.dto;

import com.itinside.carpoolingAPI.models.Event;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Getter
@Setter
public class EventDTO {
    private Long id;
    private String title;
    private String description;
    private String startDateTime;
    private String endDateTime;
    private String address;
    private String registerDeadline;
    private float longitude;
    private float latitude;
    private boolean isArchived;
    private String bannerUrl;
    private List<RideDTO> rides;

    // Getters and Setters (or use Lombok)

    // Static helper to build from Event entity
    public static EventDTO fromEntity(Event event, boolean includeRides) {
        if (event == null) {
            return null;
        }
        DateTimeFormatter formatter = DateTimeFormatter.ISO_LOCAL_DATE_TIME;

        EventDTO dto = new EventDTO();
        dto.setId(event.getId());
        dto.setTitle(event.getTitle());
        dto.setDescription(event.getDescription());
        dto.setStartDateTime(event.getStartDateTime() != null ? event.getStartDateTime().format(formatter) : null);
        dto.setEndDateTime(event.getEndDateTime() != null ? event.getEndDateTime().format(formatter) : null);
        dto.setAddress(event.getAddress());
        dto.setRegisterDeadline(event.getRegisterDeadline() != null ? event.getRegisterDeadline().format(formatter) : null);
        dto.setLongitude(event.getLongitude());
        dto.setLatitude(event.getLatitude());
        dto.setArchived(event.isArchived());
        dto.setBannerUrl(event.getBannerUrl());

        // Convert rides
        if (includeRides && event.getRides() != null) {
            dto.setRides(
                event.getRides().stream()
                    .map((ride) -> RideDTO.fromEntity(ride, false, false,  false, true))  // Use the RideDto builder
                    .toList()
            );
        }
        return dto;
    }
}
