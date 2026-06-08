package com.picstore.backend.auth;

public record RegisterRequest(
        String username,
        String email,
        String password
) {}
