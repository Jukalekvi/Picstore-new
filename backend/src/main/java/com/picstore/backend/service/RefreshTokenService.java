package com.picstore.backend.service;

import com.picstore.backend.exception.TokenRefreshException;
import com.picstore.backend.model.RefreshToken;
import com.picstore.backend.repository.RefreshTokenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Clock;
import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RefreshTokenService {

    private static final long REFRESH_TOKEN_DURATION_MS = 1000L * 60 * 60 * 24 * 30;

    private final RefreshTokenRepository refreshTokenRepository;
    private final Clock clock = Clock.systemUTC();

    // 1. CREATE
    public String create(String username) {

        RefreshToken token = RefreshToken.builder()
                .token(UUID.randomUUID().toString())
                .username(username)
                .expiryDate(Instant.now(clock).plusMillis(REFRESH_TOKEN_DURATION_MS))
                .build();

        refreshTokenRepository.save(token);

        return token.getToken();
    }

    // 2. VALIDATE
    public RefreshToken verify(String token) {

        RefreshToken refreshToken = refreshTokenRepository
                .findByToken(token)
                .orElseThrow(() -> new TokenRefreshException("Invalid refresh token"));

        if (refreshToken.getExpiryDate().isBefore(Instant.now(clock))) {
            refreshTokenRepository.delete(refreshToken);
            throw new TokenRefreshException("Refresh token expired");
        }

        return refreshToken;
    }

    // 3. DELETE (logout)
    public void delete(String token) {
        refreshTokenRepository.findByToken(token)
                .ifPresent(refreshTokenRepository::delete);
    }
}
