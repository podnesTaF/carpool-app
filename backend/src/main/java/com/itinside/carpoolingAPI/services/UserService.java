package com.itinside.carpoolingAPI.services;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.itinside.carpoolingAPI.dto.UserDTO;
import com.itinside.carpoolingAPI.dto.UserUpdateDTO;
import com.itinside.carpoolingAPI.models.Auth0TokenResponse;
import com.itinside.carpoolingAPI.models.Genre;
import com.itinside.carpoolingAPI.models.User;
import com.itinside.carpoolingAPI.repositories.GenreRepository;
import com.itinside.carpoolingAPI.repositories.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class UserService {
    private final UserRepository userRepository;
    private final GenreRepository genreRepository;
    private final Auth0Service auth0Service;
    private final ObjectMapper objectMapper;
    private final WebClient webClient = WebClient.builder().build();


    public UserDTO updateUser(Long id, UserUpdateDTO updatedUser) {
        Optional<User> optionalUser = userRepository.findById(id);
        if (optionalUser.isEmpty()) {
            throw new RuntimeException("User not found with id: " + id);
        }

        User user = optionalUser.get();
        log.debug("Starting user update process for ID: {}", id);

        if (!Objects.equals(user.getPhone(), updatedUser.getPhone())) {
            log.debug("Current user phone: {}, New phone: {}", user.getPhone(), updatedUser.getPhone());
            updateAuth0UserPhone(user, updatedUser.getPhone());
        }

        if (!Objects.equals(user.getUsername(), updatedUser.getUsername())) {
            log.debug("Current user username: {}, New username: {}", user.getUsername(), updatedUser.getUsername());
            updateAuth0UserUsername(user, updatedUser.getUsername());
        }


        if (!Objects.equals(user.getEmail(), updatedUser.getEmail())) {
            log.debug("Current user email: {}, New email: {}", user.getEmail(), updatedUser.getEmail());
            updateAuth0UserUsername(user, updatedUser.getEmail());
        }

        updateUserFields(user, updatedUser);
        User savedUser = userRepository.save(user);
        return UserDTO.fromEntity(savedUser);
    }

    private void sendAuth0UserPatch(User user, Map<String, Object> payload) {
        try {
            Auth0TokenResponse auth0ManagementToken = auth0Service.fetchAuth0ManagementToken();
            if (auth0ManagementToken == null || auth0ManagementToken.access_token() == null) {
                log.error("Failed to obtain Auth0 management token");
                throw new RuntimeException("Unable to obtain Auth0 management token");
            }

            String baseUrl = System.getenv("AUTH0_ISSUER");
            if (baseUrl == null || baseUrl.isEmpty()) {
                throw new RuntimeException("AUTH0_ISSUER environment variable is not set");
            }

            if (!baseUrl.endsWith("/")) {
                baseUrl += "/";
            }

            String url = baseUrl + "api/v2/users/" + user.getAuth0Sub();

            log.debug("Auth0 API URL: {}", url);
            String jsonPayload = objectMapper.writeValueAsString(payload);
            log.debug("Auth0 update payload: {}", jsonPayload);

            // Sending PATCH request using WebClient
            String response = webClient.patch()
                .uri(url)
                .headers(headers -> {
                    headers.setBearerAuth(auth0ManagementToken.access_token());
                    headers.setContentType(MediaType.APPLICATION_JSON);
                })
                .bodyValue(jsonPayload)
                .retrieve()
                .onStatus(HttpStatusCode::isError, clientResponse -> clientResponse.bodyToMono(String.class)
                    .flatMap(errorBody -> {
                        log.error("Auth0 API error: {}", errorBody);
                        return Mono.error(new RuntimeException("Auth0 API error: " + errorBody));
                    }))
                .bodyToMono(String.class)
                .block(); // Blocking since this is a synchronous method

            log.info("Successfully updated Auth0 user phone number");
            log.debug("Auth0 response: {}", response);
        } catch (Exception e) {
            log.error("Unexpected error while updating Auth0 user", e);
            throw new RuntimeException("Failed to update Auth0 user: " + e.getMessage());
        }
    }

    private void updateAuth0UserPhone(User user, String newPhone) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("phone_number", newPhone);
        sendAuth0UserPatch(user, payload);
    }

    private void updateAuth0UserUsername(User user, String newUsername) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("username", newUsername);
        sendAuth0UserPatch(user, payload);
    }


    private void updateAuth0UserEmail(User user, String newEmail) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("email", newEmail);
        sendAuth0UserPatch(user, payload);
    }


    private void updateUserFields(User user, UserUpdateDTO updatedUser) {
        user.setUsername(updatedUser.getUsername());
        user.setEmail(updatedUser.getEmail());
        user.setPhone(updatedUser.getPhone());
        user.setAuth0Sub(updatedUser.getAuth0Sub());
        user.setAddress(updatedUser.getAddress());
        user.setAvatarUrl(updatedUser.getAvatarUrl());
        user.setSeatingPreference(updatedUser.isSeatingPreference());
        user.setSmoking(updatedUser.isSmoking());
        user.setTalkative(updatedUser.isTalkative());

        if (updatedUser.getPreferredGenreIds() != null) {
            updateUserGenres(user, updatedUser.getPreferredGenreIds());
        } else {
            user.setPreferredGenres(new ArrayList<>());
        }
    }

    private void updateUserGenres(User user, List<Long> genreIds) {
        List<Long> distinctGenreIds = genreIds.stream().distinct().toList();
        List<Genre> genres = distinctGenreIds.stream()
            .map(genreId -> genreRepository.findById(genreId)
                .orElseThrow(() -> new RuntimeException("Genre not found with id: " + genreId)))
            .collect(Collectors.toList());
        user.setPreferredGenres(genres);
    }
}