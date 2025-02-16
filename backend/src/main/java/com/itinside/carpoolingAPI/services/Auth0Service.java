package com.itinside.carpoolingAPI.services;

import com.itinside.carpoolingAPI.models.Auth0TokenResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Duration;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class Auth0Service {
    private static final String AUTH0_CACHE = "auth0_token";
    private final String AUTH0_CLIENT_ID = System.getenv("AUTH0_CLIENT_ID");
    private final String AUTH0_CLIENT_SECRET = System.getenv("AUTH0_CLIENT_SECRET");
    private final String MANAGEMENT_AUD = System.getenv("MANAGEMENT_AUD");
    private final String AUTH0_MANAGEMENT_TOKEN_URI = System.getenv("AUTH0_MANAGEMENT_TOKEN_URI");
    private final WebClient webClient;


    @Cacheable(value = AUTH0_CACHE, key = "'managementToken'")
    public Auth0TokenResponse fetchAuth0ManagementToken() {
        try {
            return webClient.post()
                .uri(AUTH0_MANAGEMENT_TOKEN_URI)
                .header("content-type", "application/x-www-form-urlencoded")
                .body(BodyInserters.fromFormData("grant_type", "client_credentials")
                    .with("client_id", AUTH0_CLIENT_ID)
                    .with("client_secret", AUTH0_CLIENT_SECRET)
                    .with("audience", MANAGEMENT_AUD))
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
