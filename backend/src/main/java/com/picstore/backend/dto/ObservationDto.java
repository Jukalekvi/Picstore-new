package com.picstore.backend.dto;

import java.time.LocalDateTime;

public record ObservationDto(
        Long id,
        String speciesName,
        String description,
        String imagePath,
        Double latitude,
        Double longitude,
        String country,
        String city,
        LocalDateTime timestamp,
        int categoryId,
        String privacySetting,
        Long userId
) {
}
