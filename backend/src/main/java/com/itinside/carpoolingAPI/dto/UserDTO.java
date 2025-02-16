package com.itinside.carpoolingAPI.dto;
import com.itinside.carpoolingAPI.models.Genre;
import com.itinside.carpoolingAPI.models.User;
import lombok.*;

import java.util.List;
import java.util.stream.Collectors;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDTO {
    private Long id;
    private String auth0Sub;
    private String address;
    private String phone;
    private String email;
    private String username;
    private String avatarUrl;
    private boolean isSmoking;
    private boolean isTalkative;
    private boolean seatingPreference;
    private List<GenreDTO> preferredGenres;

    public static UserDTO fromEntity(User user) {
        return UserDTO.builder()
            .id(user.getId())
            .address(user.getAddress())
            .isSmoking(user.isSmoking())
            .isTalkative(user.isTalkative())
            .seatingPreference(user.isSeatingPreference())
            .avatarUrl(user.getAvatarUrl())
            .auth0Sub(user.getAuth0Sub())
            .username(user.getUsername())
            .phone(user.getPhone())
            .email(user.getEmail())
            .preferredGenres(user.getPreferredGenres() != null
                ? user.getPreferredGenres().stream().map(GenreDTO::fromEntity).collect(Collectors.toList())
                : null)
            .build();
    }
}