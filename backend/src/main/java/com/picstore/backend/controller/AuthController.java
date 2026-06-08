package com.picstore.backend.controller;

import com.picstore.backend.auth.LoginRequest;
import com.picstore.backend.auth.RegisterRequest;
import com.picstore.backend.auth.AuthResponse;
import com.picstore.backend.auth.RefreshRequest;
import com.picstore.backend.service.AuthService;
import com.picstore.backend.service.JwtService;
import com.picstore.backend.service.RefreshTokenService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {

        UserDetails user = authService.authenticate(
                request.getEmail(),
                request.getPassword()
        );

        String accessToken = jwtService.generateToken(user);
        String refreshToken = refreshTokenService.create(user.getUsername());

        return ResponseEntity.ok(
                new AuthResponse(accessToken, refreshToken)
        );
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(@RequestBody RefreshRequest request) {

        var refresh = refreshTokenService.verify(request.getRefreshToken());

        UserDetails user = authService.loadUser(refresh.getUsername());

        String newAccessToken = jwtService.generateToken(user);

        return ResponseEntity.ok(
                new AuthResponse(newAccessToken, refresh.getToken())
        );
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@RequestBody RefreshRequest request) {

        refreshTokenService.delete(request.getRefreshToken());

        return ResponseEntity.ok().build();
    }

    @PostMapping("/register")
    public ResponseEntity<Map<String, String>> register(@RequestBody RegisterRequest request) {
        try {
            authService.register(request);
            return ResponseEntity.ok(Map.of("message", "User created"));
        } catch (Exception e) {
            String message = e.getMessage() != null ? e.getMessage() : "Unknown error";
            return ResponseEntity.badRequest().body(Map.of("error", "Registration failed: " + message));
        }
    }
}
