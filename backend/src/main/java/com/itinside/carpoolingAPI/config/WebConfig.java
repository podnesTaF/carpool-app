package com.itinside.carpoolingAPI.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
            .allowedOrigins(
                "https://dev-o1f855c2je0c61ae.us.auth0.com",
                "https://54cf-193-190-124-113.ngrok-free.app",
                "http://localhost:3000",
                "https://axxes-carpool-test.duckdns.org",
                "https://carpool-app-rouge.vercel.app",
                System.getenv("FRONTEND_URL"),
                System.getenv("AI_SERVICE_API_URL")
            )
            .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH")
            .allowedHeaders("*")
            .allowCredentials(true);
    }
}