package com.picstore.backend.controller;

import com.picstore.backend.dto.ObservationDto;
import com.picstore.backend.dto.ObservationUpdateRequest;
import com.picstore.backend.model.Observation;
import com.picstore.backend.model.User;
import com.picstore.backend.repository.ObservationRepository;
import com.picstore.backend.repository.UserRepository;
import com.picstore.backend.service.JwtService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/observations")
@RequiredArgsConstructor
@Slf4j
public class ObservationController {

    private final ObservationRepository observationRepository;
    private final UserRepository userRepository;
    private final JwtService jwtService;

    @Value("${upload.path}")
    private String uploadPath;

    @GetMapping
    public ResponseEntity<List<ObservationDto>> findAll(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        if (isInvalidAuthHeader(authHeader)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        return findAuthenticatedUser(authHeader)
                .map(user -> ResponseEntity.ok(observationRepository.findByUser(user).stream()
                        .map(this::toDto)
                        .toList()))
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }

    @PostMapping
    public ResponseEntity<ObservationDto> add(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestParam("speciesName") String speciesName,
            @RequestParam(value = "categoryId", required = false, defaultValue = "8") int categoryId,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "latitude", required = false) Double latitude,
            @RequestParam(value = "longitude", required = false) Double longitude,
            @RequestParam(value = "country", required = false) String country,
            @RequestParam(value = "city", required = false) String city,
            @RequestParam("image") MultipartFile file) {

        if (isInvalidAuthHeader(authHeader)) {
            log.warn("Add observation failed because Authorization header is missing or invalid");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        try {
            Optional<User> userResult = findAuthenticatedUser(authHeader);
            if (userResult.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
            }
            User user = userResult.get();

            Files.createDirectories(Paths.get(uploadPath));

            String originalFilename = file.getOriginalFilename();
            String fileExtension = (originalFilename != null && originalFilename.contains("."))
                    ? originalFilename.substring(originalFilename.lastIndexOf(".")) : ".png";
            String uniqueFilename = UUID.randomUUID() + fileExtension;
            Path targetPath = Paths.get(uploadPath, uniqueFilename);
            Files.copy(file.getInputStream(), targetPath);

            Observation observation = new Observation();
            observation.setSpeciesName(speciesName);
            observation.setCategoryId(categoryId);
            observation.setDescription(description);
            observation.setLatitude(latitude);
            observation.setLongitude(longitude);
            observation.setCountry(country != null ? country : "Unknown Country");
            observation.setCity(city != null ? city : "Unknown City");
            observation.setImagePath("/uploads/" + uniqueFilename);
            observation.setUser(user);

            return ResponseEntity.ok(toDto(observationRepository.save(observation)));
        } catch (Exception e) {
            log.error("Failed to save observation", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteObservation(@RequestHeader("Authorization") String authHeader, @PathVariable Long id) {
        if (isInvalidAuthHeader(authHeader)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Optional<User> userResult = findAuthenticatedUser(authHeader);
        if (userResult.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
        User user = userResult.get();

        return observationRepository.findById(id)
                .map(observation -> {
                    if (!isOwner(observation, user)) {
                        return ResponseEntity.status(HttpStatus.FORBIDDEN).<Void>build();
                    }

                    String imagePath = observation.getImagePath();
                    if (imagePath != null && imagePath.contains("/uploads/")) {
                        try {
                            Files.deleteIfExists(Paths.get(uploadPath, imagePath.substring(imagePath.lastIndexOf("/") + 1)));
                        } catch (IOException e) {
                            log.warn("Failed to delete uploaded image {}", imagePath, e);
                        }
                    }
                    observationRepository.deleteById(id);
                    return ResponseEntity.ok().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<ObservationDto> updateObservation(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long id,
            @RequestBody ObservationUpdateRequest details) {

        if (isInvalidAuthHeader(authHeader)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Optional<User> userResult = findAuthenticatedUser(authHeader);
        if (userResult.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
        User user = userResult.get();

        return observationRepository.findById(id)
                .map(observation -> {
                    if (!isOwner(observation, user)) {
                        return ResponseEntity.status(HttpStatus.FORBIDDEN).<ObservationDto>build();
                    }

                    if (details.getSpeciesName() != null) {
                        observation.setSpeciesName(details.getSpeciesName());
                    }
                    if (details.getCategoryId() != null) {
                        observation.setCategoryId(details.getCategoryId());
                    }
                    observation.setDescription(details.getDescription());
                    observation.setLatitude(details.getLatitude());
                    observation.setLongitude(details.getLongitude());
                    observation.setCountry(details.getCountry());
                    observation.setCity(details.getCity());
                    return ResponseEntity.ok(toDto(observationRepository.save(observation)));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    private ObservationDto toDto(Observation observation) {
        Long userId = observation.getUser() != null ? observation.getUser().getId() : null;
        return new ObservationDto(
                observation.getId(),
                observation.getSpeciesName(),
                observation.getDescription(),
                observation.getImagePath(),
                observation.getLatitude(),
                observation.getLongitude(),
                observation.getCountry(),
                observation.getCity(),
                observation.getTimestamp(),
                observation.getCategoryId(),
                observation.getPrivacySetting(),
                userId
        );
    }

    private boolean isInvalidAuthHeader(String authHeader) {
        return authHeader == null || !authHeader.startsWith("Bearer ");
    }

    private Optional<User> findAuthenticatedUser(String authHeader) {
        String token = authHeader.substring(7);
        String loginIdentifier = jwtService.extractUsername(token);
        return findUserByLoginIdentifier(loginIdentifier);
    }

    private boolean isOwner(Observation observation, User user) {
        Long observationUserId = observation.getUser() != null ? observation.getUser().getId() : null;
        return Objects.equals(observationUserId, user.getId());
    }

    private Optional<User> findUserByLoginIdentifier(String loginIdentifier) {
        if (loginIdentifier.contains("@")) {
            return userRepository.findByEmail(loginIdentifier)
                    .or(() -> userRepository.findByUsername(loginIdentifier));
        }

        return userRepository.findByUsername(loginIdentifier)
                .or(() -> userRepository.findByEmail(loginIdentifier));
    }
}
