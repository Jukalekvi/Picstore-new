package com.picstore.backend.controller;

import com.picstore.backend.model.Observation;
import com.picstore.backend.repository.ObservationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
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
@RequestMapping("api/observations")
@RequiredArgsConstructor
public class ObservationController {

    private final ObservationRepository observationRepository;

    /* Injects the permanent storage location configuration from application.properties */
    @Value("${upload.path}")
    private String uploadPath;

    /* Retrieves all observations from the database. */
    @GetMapping
    public List<Observation> findAll() {
        return observationRepository.findAll();
    }

    /* Creates and saves a new observation record along with its binary image asset. */
    @PostMapping
    public ResponseEntity<Observation> add(
            @RequestParam("speciesName") String speciesName,
            @RequestParam(value = "categoryId", required = false, defaultValue = "8") int categoryId,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "latitude", required = false) Double latitude,
            @RequestParam(value = "longitude", required = false) Double longitude,
            @RequestParam(value = "country", required = false) String country,
            @RequestParam(value = "city", required = false) String city,
            @RequestParam("image") MultipartFile file) {

        try {
            // Guarantee that the targeted upload directory exists locally
            File directory = new File(uploadPath);
            if (!directory.exists() && !directory.mkdirs()) {
                System.err.println("Warning: Could not create upload directory or it already exists.");
            }

            // Generate a unique identifier for the filename to prevent collision errors
            String originalFilename = file.getOriginalFilename();
            String fileExtension = originalFilename != null && originalFilename.contains(".")
                    ? originalFilename.substring(originalFilename.lastIndexOf("."))
                    : ".png";
            String uniqueFilename = UUID.randomUUID() + fileExtension;

            // Secure transfer and writing of the raw asset onto the local storage disk
            Path targetPath = Paths.get(uploadPath + uniqueFilename);
            Files.copy(file.getInputStream(), targetPath);

            // Construct a clean relative web path served over our WebConfig resource location registry mapping
            String relativeImageUrl = "/uploads/" + uniqueFilename;

            // Instantiate and populate the domain entity model metadata
            Observation observation = new Observation();
            observation.setSpeciesName(speciesName);
            observation.setCategoryId(categoryId);
            observation.setDescription(description);
            observation.setLatitude(latitude);
            observation.setLongitude(longitude);
            observation.setCountry(country != null ? country : "Unknown Country");
            observation.setCity(city != null ? city : "Unknown City");
            observation.setImagePath(relativeImageUrl);

            // Note: setTimestamp is omitted because @PrePersist handles it automatically in the model entity

            Observation savedObservation = observationRepository.save(observation);
            return ResponseEntity.ok(savedObservation);

        } catch (IOException e) {
            System.err.println("Failed to store uploaded profile asset: " + e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    /* Deletes an observation record by its ID and cleans up its associated binary image asset from the disk. */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteObservation(@PathVariable Long id) {
        return observationRepository.findById(id)
                .map(observation -> {
                    // 1. Get the relative web image path (e.g., "/uploads/filename.png")
                    String imagePath = observation.getImagePath();

                    if (imagePath != null && imagePath.contains("/uploads/")) {
                        // Extract just the filename from the path extension
                        String filename = imagePath.substring(imagePath.lastIndexOf("/") + 1);

                        // Construct the absolute path pointing directly to the file on the physical disk
                        Path targetFilePath = Paths.get(uploadPath + filename);

                        try {
                            // Attempt to securely delete the binary asset from the system disk storage
                            boolean deleted = Files.deleteIfExists(targetFilePath);
                            if (deleted) {
                                System.out.println("[File System] Successfully deleted file asset: " + filename);
                            } else {
                                System.err.println("[File System] Warning: Target file did not exist on disk: " + filename);
                            }
                        } catch (IOException e) {
                            System.err.println("[File System] Error: Failed to purge file from storage: " + e.getMessage());
                            // We can choose to continue or return an internal error depending on preference
                        }
                    }

                    // 2. Perform the traditional relational database row removal routine
                    observationRepository.deleteById(id);
                    return ResponseEntity.ok().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }

    /* Updates an existing observation record with new descriptive metadata and location privacy configurations. */
    @PutMapping("/{id}")
    public ResponseEntity<Observation> updateObservation(@PathVariable Long id, @RequestBody Observation details) {
        return observationRepository.findById(id)
                .map(observation -> {
                    observation.setSpeciesName(details.getSpeciesName());
                    observation.setCategoryId(details.getCategoryId());

                    /* Dynamic updates for new descriptive notes and parameters */
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