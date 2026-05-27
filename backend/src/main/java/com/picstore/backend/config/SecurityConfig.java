package com.picstore.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // Enable CORS filtering configurations defined below
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                // Disable CSRF protection to allow multipart form data uploads
                .csrf(AbstractHttpConfigurer::disable)

                // Configure route access policies
                .authorizeHttpRequests(auth -> auth
                        // Allow public access to all observation endpoints and static assets
                        .requestMatchers("/api/observations/**").permitAll()
                        .requestMatchers("/uploads/**").permitAll()
                        // Secure all other remaining routes outside this scope
                        .anyRequest().authenticated()
                );

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // Allow connections from any origin, including mobile emulators and physical hardware profiles
        configuration.setAllowedOrigins(List.of("*"));

        // Permit all traditional REST verbs needed by the system
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));

        // Accept incoming application headers dynamically
        configuration.setAllowedHeaders(List.of("*"));

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        // Bind the configuration globally to all endpoints
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}