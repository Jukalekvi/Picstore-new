package com.picstore.backend.repository;

import com.picstore.backend.model.Observation;
import com.picstore.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ObservationRepository extends JpaRepository<Observation, Long> {

    List<Observation> findByUser(User user);
}