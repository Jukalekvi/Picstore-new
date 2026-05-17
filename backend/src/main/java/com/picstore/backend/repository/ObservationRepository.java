package com.picstore.backend.repository;

import com.picstore.backend.model.Observation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/* Spring Data JPA repository for Observation entities. Provides CRUD (Create, Read, Update, Delete) operations for managing observations in the database. Automatically generates database queries based on the interface definition. No custom query methods are currently implemented; all database operations use standard JPA methods. */
@Repository
public interface ObservationRepository extends JpaRepository<Observation, Long> {
}
