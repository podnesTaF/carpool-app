package com.itinside.carpoolingAPI.models;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIdentityInfo;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.ObjectIdGenerators;
import jakarta.annotation.Nullable;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "rides")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIdentityInfo(
    generator = ObjectIdGenerators.PropertyGenerator.class,
    property = "id"
)
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Ride {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Builder.Default
    private boolean isDriver = true;

    @Builder.Default
    private boolean canBeDriver = false;

    @Builder.Default
    private boolean outlier = false;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id", nullable = false)
    private Event event;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Nullable
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicle_id", referencedColumnName = "id")
    private Vehicle vehicle;

    @Nullable
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "driver_ride_id")
    private Ride driverRide;

    @OneToMany(mappedBy = "driverRide", cascade = {CascadeType.PERSIST, CascadeType.MERGE}, fetch = FetchType.LAZY)
    @Builder.Default
    private List<Ride> passengerRides = new ArrayList<>();

    @Nullable
    private Float pickupLat;

    @Nullable
    private Float pickupLong;

    @Nullable
    private Float pickupRadius;

    @Nullable
    private Integer pickupSequence;

    @Nullable
    private Integer maxPassengers;

    @Nullable
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime startDateTime;

    // Helper method to manage bidirectional relationship
    public void addPassengerRide(Ride passengerRide) {
        passengerRides.add(passengerRide);
        passengerRide.setDriverRide(this);
    }

    public void removePassengerRide(Ride passengerRide) {
        passengerRides.remove(passengerRide);
        passengerRide.setDriverRide(null);
    }

    @PreRemove
    private void preRemove() {
        for (Ride passenger : passengerRides) {
            passenger.setDriverRide(null);
        }
        passengerRides.clear();
    }
}
