package com.itinside.carpoolingAPI.config;

import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.concurrent.ConcurrentMapCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;

@Configuration
@EnableCaching
@EnableScheduling
public class CacheConfig {
    public static final String AUTH0_CACHE = "auth0_token";

    @Bean
    public CacheManager cacheManager() {
        return new ConcurrentMapCacheManager(AUTH0_CACHE);
    }
}
