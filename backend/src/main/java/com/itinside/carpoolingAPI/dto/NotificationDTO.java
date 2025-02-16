package com.itinside.carpoolingAPI.dto;

import java.util.Date;
import java.util.List;

import com.itinside.carpoolingAPI.models.Notification;
import com.itinside.carpoolingAPI.models.NotificationAction;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationDTO {
    private Long id;
    private String title;
    private String description;
    private Notification.NotificationType type;
    private boolean isRead;
    @Builder.Default
    private Date sendDate = new Date();
    private List<NotificationAction> actions;
    private Long userId;

    public static NotificationDTO fromEntity(Notification notification) {
        return NotificationDTO.builder()
                .id(notification.getId())
                .title(notification.getTitle())
                .description(notification.getDescription())
                .type(notification.getType())
                .isRead(notification.isRead())
                .sendDate(notification.getSendDate())
                .actions(notification.getActions())
                .userId(notification.getUser() != null ? notification.getUser().getId() : null)
                .build();
    }
}
