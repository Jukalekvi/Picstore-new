package com.picstore.backend.controller;

import com.picstore.backend.model.Observation;
import com.picstore.backend.model.User;
import com.picstore.backend.repository.ObservationRepository;
import com.picstore.backend.repository.UserRepository;
import com.picstore.backend.service.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/observations")
@RequiredArgsConstructor
public class ObservationController {

    private final ObservationRepository observationRepository;
    private final UserRepository userRepository;
    private final JwtService jwtService;

    @Value("${upload.path}")
    private String uploadPath;

    @GetMapping
    public ResponseEntity<List<Observation>> findAll(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String token = authHeader.substring(7);
        String email = jwtService.extractUsername(token);

        return userRepository.findByEmail(email)
                .map(user -> ResponseEntity.ok(observationRepository.findByUser(user)))
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }

    @PostMapping
    public ResponseEntity<?> add(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestParam("speciesName") String speciesName,
            @RequestParam(value = "categoryId", required = false, defaultValue = "8") int categoryId,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "latitude", required = false) Double latitude,
            @RequestParam(value = "longitude", required = false) Double longitude,
            @RequestParam(value = "country", required = false) String country,
            @RequestParam(value = "city", required = false) String city,
            @RequestParam("image") MultipartFile file) {

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            System.err.println("DEBUG: Add failed - Authorization header missing or invalid");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Authorization header missing");
        }

        try {
            String token = authHeader.substring(7);
            String email = jwtService.extractUsername(token);

            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            File directory = new File(uploadPath);
            if (!directory.exists()) directory.mkdirs();

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

            return ResponseEntity.ok(observationRepository.save(observation));
        } catch (Exception e) {
            System.err.println("DEBUG: Save error: " + e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteObservation(@RequestHeader("Authorization") String authHeader, @PathVariable Long id) {
        return observationRepository.findById(id)
                .map(observation -> {
                    String imagePath = observation.getImagePath();
                    if (imagePath != null && imagePath.contains("/uploads/")) {
                        try { Files.deleteIfExists(Paths.get(uploadPath, imagePath.substring(imagePath.lastIndexOf("/") + 1))); } catch (IOException ignored) {}
                    }
                    observationRepository.deleteById(id);
                    return ResponseEntity.ok().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Observation> updateObservation(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long id,
            @RequestBody Observation details) {

        return observationRepository.findById(id)
                .map(observation -> {
                    observation.setSpeciesName(details.getSpeciesName());
                    observation.setCategoryId(details.getCategoryId());
                    observation.setDescription(details.getDescription());
                    observation.setLatitude(details.getLatitude());
                    observation.setLongitude(details.getLongitude());
                    observation.setCountry(details.getCountry());
                    observation.setCity(details.getCity());
                    return ResponseEntity.ok(observationRepository.save(observation));
                })
                .orElse(ResponseEntity.notFound().build());
    }
}