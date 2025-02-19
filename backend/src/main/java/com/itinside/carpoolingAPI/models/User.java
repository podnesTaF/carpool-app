package com.itinside.carpoolingAPI.models;

import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.*;
import jakarta.persistence.*;
import org.springframework.data.rest.core.annotation.RestResource;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "users")
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Data
@Builder
@JsonIdentityInfo(generator = ObjectIdGenerators.PropertyGenerator.class, property = "id")
@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String auth0Sub;
    private String address;
    private String phone;
    private String email;
    private String username;
    @Lob
    @Column(columnDefinition = "TEXT")
    private String avatarUrl;
    private boolean isSmoking;
    private boolean isTalkative;
    private boolean seatingPreference;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(name = "users_genres", joinColumns = @JoinColumn(name = "user_id", referencedColumnName = "id"), inverseJoinColumns = @JoinColumn(name = "genre_id", referencedColumnName = "id"))
    @RestResource(exported = false)
    @Builder.Default
    @JsonIdentityReference(alwaysAsId = true)
    private List<Genre> preferredGenres = new ArrayList<>();

    @OneToMany(cascade = CascadeType.ALL, mappedBy = "user", fetch = FetchType.EAGER)
    @Builder.Default
    private List<Notification> notifications = new ArrayList<>();

    @OneToMany(cascade = CascadeType.ALL, mappedBy = "user", fetch = FetchType.EAGER)
    @Builder.Default
    private List<Vehicle> vehicles = new ArrayList<>();

    @OneToMany(cascade = CascadeType.ALL, mappedBy = "user", fetch = FetchType.EAGER)
    @Builder.Default
    private List<Ride> rides = new ArrayList<>();
}
