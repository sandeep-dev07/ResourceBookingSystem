package com.bookslot.config;

import org.springframework.context.annotation.Configuration;

/**
 * CORS configuration is now managed by SecurityConfig.java
 * This class is kept for reference and can be removed if no longer needed.
 * Spring Security's corsConfigurationSource bean handles all CORS requirements.
 */
@Configuration
public class CorsConfig {
    // CORS is configured in SecurityConfig via corsConfigurationSource()
}
