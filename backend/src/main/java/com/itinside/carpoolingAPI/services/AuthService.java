package com.itinside.carpoolingAPI.services;

import com.itinside.carpoolingAPI.models.User;
import com.itinside.carpoolingAPI.repositories.UserRepository;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AuthService {

    private final UserRepository userRepository;

    public AuthService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User getUser(Jwt jwt) {
        return userRepository.findByAuth0Sub(jwt.getClaim("sub").toString())
            .orElseThrow(() -> new IllegalStateException("Authenticated user not found"));
    }

    public Long getAuthenticatedUserId(Jwt jwt) {
        return userRepository.findIdByAuth0Sub(jwt.getClaim("sub").toString())
            .orElseThrow(() -> new IllegalStateException("Authenticated user not found"));
    }

    public boolean isAdmin(Jwt jwt) {
        Object claim = jwt.getClaim("permissions");
        if (claim instanceof List<?> permissions) {
            return permissions.stream()
                .filter(String.class::isInstance)
                .map(String.class::cast)
                .anyMatch("admin"::equals);
        }
        return false;
    }
}