package com.itinside.carpoolingAPI.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;

import static org.springframework.security.config.Customizer.withDefaults;

/**
 * Configures our application with Spring Security to restrict access to our API
 * endpoints.
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        return http
            .authorizeHttpRequests((authorize) -> authorize
                .requestMatchers(HttpMethod.OPTIONS).permitAll()
                .requestMatchers("/v3/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/swagger-ui/**").permitAll()
                .requestMatchers(HttpMethod.GET).permitAll()
                .requestMatchers(HttpMethod.GET, "/genres").authenticated()
                .requestMatchers(HttpMethod.GET, "/notifications").authenticated()
                .requestMatchers(HttpMethod.GET, "/rides").authenticated()
                .requestMatchers(HttpMethod.GET, "/users").authenticated()
                .requestMatchers(HttpMethod.GET, "/vehicles").authenticated()
                .requestMatchers(HttpMethod.GET, "/notify").authenticated()
                .requestMatchers(HttpMethod.GET, "/images").authenticated()
                .requestMatchers(HttpMethod.GET, "/auth").authenticated()

                .requestMatchers(HttpMethod.POST, "/events").hasAuthority("admin")
                .requestMatchers(HttpMethod.PUT, "/events").hasAuthority("admin")
                .requestMatchers(HttpMethod.PATCH, "/events").hasAuthority("admin")
                .requestMatchers(HttpMethod.DELETE, "/events").hasAuthority("admin")
                // More general authentication requirements last
                .requestMatchers(HttpMethod.POST).authenticated()
                .requestMatchers(HttpMethod.PUT).authenticated()
                .requestMatchers(HttpMethod.DELETE).authenticated()
                .requestMatchers(HttpMethod.PATCH).authenticated())
            .csrf().disable()
            .oauth2ResourceServer(oauth2 -> oauth2
                .jwt(withDefaults()))
            .build();
    }
}
