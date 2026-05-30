package com.picstore.backend.controller;

import com.picstore.backend.model.Observation;
import com.picstore.backend.model.User;
import com.picstore.backend.repository.ObservationRepository;
import com.picstore.backend.repository.UserRepository;
import com.picstore.backend.service.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
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

/* REST API controller for handling all observation-related HTTP requests and binary file uploads. */
@RestController
@RequestMapping("/api/observations")
@RequiredArgsConstructor
public class ObservationController {

    private final ObservationRepository observationRepository;
    private final UserRepository userRepository;
    private final JwtService jwtService;

    @Value("${upload.path}")
    private String uploadPath;

    /* ONLY USER'S OWN OBSERVATIONS */
    @GetMapping
    public ResponseEntity<List<Observation>> findAll(@RequestHeader("Authorization") String authHeader) {

        String token = authHeader.replace("Bearer ", "");
        String username = jwtService.extractUsername(token);

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Observation> observations = observationRepository.findByUser(user);

        return ResponseEntity.ok(observations);
    }

    @PostMapping
    public ResponseEntity<Observation> add(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam("speciesName") String speciesName,
            @RequestParam(value = "categoryId", required = false, defaultValue = "8") int categoryId,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "latitude", required = false) Double latitude,
            @RequestParam(value = "longitude", required = false) Double longitude,
            @RequestParam(value = "country", required = false) String country,
            @RequestParam(value = "city", required = false) String city,
            @RequestParam("image") MultipartFile file) {

        try {
            String token = authHeader.replace("Bearer ", "");
            String username = jwtService.extractUsername(token);

            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            File directory = new File(uploadPath);
            if (!directory.exists()) {
                directory.mkdirs();
            }

            String originalFilename = file.getOriginalFilename();
            String fileExtension = (originalFilename != null && originalFilename.contains("."))
                    ? originalFilename.substring(originalFilename.lastIndexOf("."))
                    : ".png";

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

            Observation saved = observationRepository.save(observation);

            return ResponseEntity.ok(saved);

        } catch (IOException e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteObservation(@PathVariable Long id) {

        return observationRepository.findById(id)
                .map(observation -> {

                    String imagePath = observation.getImagePath();

                    if (imagePath != null && imagePath.contains("/uploads/")) {
                        String filename = imagePath.substring(imagePath.lastIndexOf("/") + 1);
                        Path targetFilePath = Paths.get(uploadPath, filename);

                        try {
                            Files.deleteIfExists(targetFilePath);
                        } catch (IOException e) {
                            System.err.println("File delete error: " + e.getMessage());
                        }
                    }

                    observationRepository.deleteById(id);
                    return ResponseEntity.ok().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Observation> updateObservation(
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

                    Observation updated = observationRepository.save(observation);
                    return ResponseEntity.ok(updated);
                })
                .orElse(ResponseEntity.notFound().build());
    }
}