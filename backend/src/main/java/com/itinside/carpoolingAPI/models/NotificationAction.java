package com.itinside.carpoolingAPI.models;

import java.util.ArrayList;
import java.util.List;

import com.itinside.carpoolingAPI.models.Notification.NotificationActionEnum;
import jakarta.persistence.*;
import lombok.*;

import lombok.Builder;

@Entity
@Table(name = "notification_actions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationAction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    NotificationActionEnum type;
    Long object_id;
    @Builder.Default
    @ManyToMany(cascade = CascadeType.ALL, mappedBy = "actions")
    List<Notification> notifications = new ArrayList<>();
}
