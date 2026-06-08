package com.picstore.backend.dto;

public record ErrorResponse(
        String error,
        String message
) {}
