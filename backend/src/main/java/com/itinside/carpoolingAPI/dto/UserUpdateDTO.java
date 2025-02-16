package com.itinside.carpoolingAPI.dto;

import lombok.Data;
import java.util.List;

@Data
public class UserUpdateDTO {
    private String username;
    private String email;
    private String phone;
    private String auth0Sub;
    private String address;
    private String avatarUrl;
    private boolean seatingPreference;
    private boolean isSmoking;
    private boolean isTalkative;
    private List<Long> preferredGenreIds;
}