package com.picstore.backend.dto;

public record ObservationUpdateRequest(
        String speciesName,
        Integer categoryId,
        String description,
        Double latitude,
        Double longitude,
        String country,
        String city
) {
}
