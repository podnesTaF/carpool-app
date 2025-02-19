package com.itinside.carpoolingAPI.controllers;

import com.itinside.carpoolingAPI.models.Auth0TokenResponse;
import com.itinside.carpoolingAPI.services.Auth0Service;
import com.itinside.carpoolingAPI.services.MailService;
import com.itinside.carpoolingAPI.services.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.repository.query.Param;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthenticationController {
    private final Auth0Service auth0Service;
    @GetMapping("/admin")
    public boolean isAdmin(@Param("auth0Sub") String auth0Sub) {
        return auth0Service.isAdmin(auth0Sub);
    }
}
