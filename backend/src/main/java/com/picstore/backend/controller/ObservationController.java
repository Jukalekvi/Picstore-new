package com.picstore.backend.controller;

import com.picstore.backend.model.Observation;
import com.picstore.backend.repository.ObservationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;

import java.util.List;

/* REST API controller for handling all observation-related HTTP requests. */
@RestController
@RequestMapping("api/observations")
@RequiredArgsConstructor
public class ObservationController {

    private final ObservationRepository observationRepository;

    /* Retrieves all observations from the database. */
    @GetMapping
    public List<Observation> findAll() {
        return observationRepository.findAll();
    }

    /* Creates and saves a new observation record. */
    @PostMapping
    public Observation add(@RequestBody Observation observation) {
        return observationRepository.save(observation);
    }

    /* Deletes an observation record by its ID. */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteObservation(@PathVariable Long id) {
        if (observationRepository.existsById(id)) {
            observationRepository.deleteById(id);
            return ResponseEntity.ok().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    /* Updates an existing observation record with new species name and category. */
    @PutMapping("/{id}")
    public ResponseEntity<Observation> updateObservation(@PathVariable Long id, @RequestBody Observation details) {
        return observationRepository.findById(id)
                .map(observation -> {
                    observation.setSpeciesName(details.getSpeciesName());
                    observation.setCategoryId(details.getCategoryId());
                    Observation updated = observationRepository.save(observation);
                    return ResponseEntity.ok(updated);
                })
                .orElse(ResponseEntity.notFound().build());
    }
}