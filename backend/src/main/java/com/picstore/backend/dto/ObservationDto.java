package com.picstore.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class ObservationDto {
    private Long id;
    private String speciesName;
    private String description;
    private String imagePath;
    private Double latitude;
    private Double longitude;
    private String country;
    private String city;
    private LocalDateTime timestamp;
    private int categoryId;
    private String privacySetting;
    private Long userId;
}
