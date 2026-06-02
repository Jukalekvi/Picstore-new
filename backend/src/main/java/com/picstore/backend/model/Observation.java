package com.picstore.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore; // TÄMÄ IMPORT ON TÄRKEÄ
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "observations")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Observation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String speciesName;

    @Column(length = 200)
    private String description;

    private String imagePath;

    private Double latitude;

    private Double longitude;

    private String country;

    private String city;

    private LocalDateTime timestamp;

    private int categoryId;

    @Column(nullable = false)
    private String privacySetting = "PUBLIC";

    // LISÄTTY @JsonIgnore estämään "no Session" -virhe
    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @PrePersist
    protected void onCreate() {
        this.timestamp = LocalDateTime.now();
    }
}