package com.itinside.carpoolingAPI.services;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.itinside.carpoolingAPI.models.Auth0TokenResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientException;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import reactor.core.publisher.Mono;

import java.time.Duration;
import java.util.List;
import java.util.concurrent.TimeUnit;

@Slf4j
@Service
@RequiredArgsConstructor
public class Auth0Service {
    private static final String AUTH0_CACHE = "auth0_token";
    private final String AUTH0_CLIENT_ID = System.getenv("AUTH0_CLIENT_ID");
    private final String AUTH0_CLIENT_SECRET = System.getenv("AUTH0_CLIENT_SECRET");
    private final String AUTH0_MANAGEMENT_AUDIENCE = System.getenv("AUTH0_MANAGEMENT_AUDIENCE");
    private final String AUTH0_MANAGEMENT_TOKEN_URI = System.getenv("AUTH0_MANAGEMENT_TOKEN_URI");
    private final WebClient webClient;
    private final ObjectMapper objectMapper;

    // First, define custom exceptions
    public class Auth0Exception extends RuntimeException {
        public Auth0Exception(String message) {
            super(message);
        }

        public Auth0Exception(String message, Throwable cause) {
            super(message, cause);
        }
    }

    public class UserNotFoundException extends Auth0Exception {
        public UserNotFoundException(String userId) {
            super("User not found with ID: " + userId);
        }
    }

    public class Auth0ConfigurationException extends Auth0Exception {
        public Auth0ConfigurationException(String message) {
            super(message);
        }
    }

    // The improved isAdmin method
    public boolean isAdmin(String userAuth0Sub) {
        if (userAuth0Sub == null || userAuth0Sub.trim().isEmpty()) {
            throw new IllegalArgumentException("User Auth0 ID cannot be null or empty");
        }

        try {
            Auth0TokenResponse auth0ManagementToken = fetchAuth0ManagementToken();
            if (auth0ManagementToken == null || auth0ManagementToken.access_token() == null) {
                log.error("Failed to obtain Auth0 management token");
                throw new Auth0Exception("Unable to obtain Auth0 management token");
            }

            String baseUrl = System.getenv("AUTH0_ISSUER");
            if (baseUrl == null || baseUrl.isEmpty()) {
                throw new Auth0ConfigurationException("AUTH0_ISSUER environment variable is not set");
            }

            String url = baseUrl.endsWith("/") ? baseUrl + "api/v2/users/" : baseUrl + "/api/v2/users/";
            url += userAuth0Sub + "/roles";
            log.debug("Fetching roles from Auth0 API URL: {}", url);

            record Role(String id, String name, String description) {
            }

            try {
                List<Role> roles = webClient.get()
                    .uri(url)
                    .headers(headers -> {
                        headers.setBearerAuth(auth0ManagementToken.access_token());
                        headers.set("Accept", "application/json");
                    })
                    .retrieve()
                    .onStatus(
                        status -> status.equals(HttpStatus.NOT_FOUND),
                        response -> Mono.error(new UserNotFoundException(userAuth0Sub))
                    )
                    .onStatus(
                        status -> status.equals(HttpStatus.UNAUTHORIZED),
                        response -> Mono.error(new Auth0Exception("Invalid or expired management token"))
                    )
                    .onStatus(
                        status -> status.equals(HttpStatus.FORBIDDEN),
                        response -> Mono.error(new Auth0Exception("Insufficient permissions to access Auth0 API"))
                    )
                    .onStatus(
                        HttpStatusCode::is5xxServerError,
                        response -> response.bodyToMono(String.class)
                            .flatMap(errorBody -> Mono.error(new Auth0Exception("Auth0 server error: " + errorBody)))
                    )
                    .onStatus(
                        HttpStatusCode::isError,
                        response -> response.bodyToMono(String.class)
                            .flatMap(errorBody -> Mono.error(new Auth0Exception("Auth0 API error: " + errorBody)))
                    )
                    .bodyToMono(new ParameterizedTypeReference<List<Role>>() {
                    })
                    .block();

                if (roles == null) {
                    log.warn("No roles found for user: {}", userAuth0Sub);
                    return false;
                }

                log.debug("Retrieved {} roles for user {}: {}", roles.size(), userAuth0Sub, roles);

                boolean isAdmin = roles.stream()
                    .anyMatch(role -> "admin".equalsIgnoreCase(role.name()));

                log.info("User {} admin status: {}", userAuth0Sub, isAdmin);
                return isAdmin;

            } catch (WebClientResponseException e) {
                log.error("WebClient error while fetching roles for user {}: {} - {}",
                    userAuth0Sub, e.getStatusCode(), e.getResponseBodyAsString());
                throw new Auth0Exception("Error fetching user roles: " + e.getMessage(), e);
            }

        } catch (WebClientException e) {
            log.error("Network error while connecting to Auth0", e);
            throw new Auth0Exception("Failed to connect to Auth0: " + e.getMessage(), e);
        } catch (UserNotFoundException | Auth0ConfigurationException e) {
            // Re-throw these specific exceptions
            throw e;
        } catch (Exception e) {
            log.error("Unexpected error while checking Auth0 admin status for user: {}", userAuth0Sub, e);
            throw new Auth0Exception("Failed to check admin status: " + e.getMessage(), e);
        }
    }


    @Cacheable(value = AUTH0_CACHE, key = "'managementToken'")
    public Auth0TokenResponse fetchAuth0ManagementToken() {
        try {
            return webClient.post()
                .uri(AUTH0_MANAGEMENT_TOKEN_URI)
                .header("content-type", "application/x-www-form-urlencoded")
                .body(BodyInserters.fromFormData("grant_type", "client_credentials")
                    .with("client_id", AUTH0_CLIENT_ID)
                    .with("client_secret", AUTH0_CLIENT_SECRET)
                    .with("audience", AUTH0_MANAGEMENT_AUDIENCE))
                .retrieve()
                .bodyToMono(Auth0TokenResponse.class)
                .timeout(Duration.ofSeconds(10))
                .block();
        } catch (Exception e) {
            throw new RuntimeException("Failed to fetch management API token", e);
        }
    }

    // Clear cache every 20 hours
    @CacheEvict(value = AUTH0_CACHE, allEntries = true)
    @Scheduled(fixedRate = 20, timeUnit = TimeUnit.HOURS)
    public void clearTokenCache() {
        // Method can be empty - the @CacheEvict annotation does the work
    }

}
