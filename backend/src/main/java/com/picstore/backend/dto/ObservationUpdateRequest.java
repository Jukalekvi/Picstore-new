package com.picstore.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ObservationUpdateRequest {
    private String speciesName;
    private Integer categoryId;
    private String description;
    private Double latitude;
    private Double longitude;
    private String country;
    private String city;
}
