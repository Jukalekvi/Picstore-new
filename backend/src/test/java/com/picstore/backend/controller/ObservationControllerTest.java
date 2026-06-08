package com.picstore.backend.controller;

import com.picstore.backend.dto.ObservationDto;
import com.picstore.backend.dto.ObservationUpdateRequest;
import com.picstore.backend.model.Observation;
import com.picstore.backend.model.User;
import com.picstore.backend.repository.ObservationRepository;
import com.picstore.backend.repository.UserRepository;
import com.picstore.backend.service.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.api.io.TempDir;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.util.ReflectionTestUtils;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ObservationControllerTest {

    private static final String AUTH_HEADER = "Bearer test-token";
    private static final String EMAIL = "birdwatcher@example.com";

    @Mock
    private ObservationRepository observationRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private JwtService jwtService;

    @InjectMocks
    private ObservationController observationController;

    @TempDir
    private Path uploadDir;

    private User user;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(observationController, "uploadPath", uploadDir.toString());

        user = new User();
        user.setId(1L);
        user.setEmail(EMAIL);
        user.setUsername("birdwatcher");
        user.setPassword("password");
    }

    @Test
    void findAll_ShouldReturnUserObservations() {
        Observation obs1 = new Observation();
        obs1.setId(1L);
        obs1.setSpeciesName("Bird");
        obs1.setUser(user);

        Observation obs2 = new Observation();
        obs2.setId(2L);
        obs2.setSpeciesName("Mammal");
        obs2.setUser(user);

        when(jwtService.extractUsername("test-token")).thenReturn(EMAIL);
        when(userRepository.findByEmail(EMAIL)).thenReturn(Optional.of(user));
        when(observationRepository.findByUser(user)).thenReturn(List.of(obs1, obs2));

        ResponseEntity<List<ObservationDto>> response = observationController.findAll(AUTH_HEADER);

        assertEquals(200, response.getStatusCode().value());
        assertNotNull(response.getBody());
        assertEquals(2, response.getBody().size());
        assertEquals("Bird", response.getBody().get(0).getSpeciesName());
        verify(observationRepository).findByUser(user);
        verify(observationRepository, never()).findAll();
    }

    @Test
    void findAll_ShouldReturnUnauthorizedWhenAuthHeaderIsMissing() {
        ResponseEntity<List<ObservationDto>> response = observationController.findAll(null);

        assertEquals(401, response.getStatusCode().value());
        assertNull(response.getBody());
        verifyNoInteractions(jwtService, userRepository, observationRepository);
    }

    @Test
    void add_ShouldSaveUploadedObservationForAuthenticatedUser() {
        MockMultipartFile file = new MockMultipartFile(
                "image",
                "bird.jpg",
                "image/jpeg",
                "image-data".getBytes(StandardCharsets.UTF_8)
        );

        when(jwtService.extractUsername("test-token")).thenReturn(EMAIL);
        when(userRepository.findByEmail(EMAIL)).thenReturn(Optional.of(user));
        when(observationRepository.save(any(Observation.class))).thenAnswer(invocation -> {
            Observation saved = invocation.getArgument(0);
            saved.setId(1L);
            return saved;
        });

        ResponseEntity<ObservationDto> response = observationController.add(
                AUTH_HEADER,
                "Insect",
                4,
                "Small garden visitor",
                60.1699,
                24.9384,
                "Finland",
                "Helsinki",
                file
        );

        assertEquals(200, response.getStatusCode().value());
        assertNotNull(response.getBody());

        ObservationDto result = response.getBody();
        assertEquals(1L, result.getId());
        assertEquals("Insect", result.getSpeciesName());
        assertEquals(4, result.getCategoryId());
        assertEquals("Small garden visitor", result.getDescription());
        assertEquals(60.1699, result.getLatitude());
        assertEquals(24.9384, result.getLongitude());
        assertEquals("Finland", result.getCountry());
        assertEquals("Helsinki", result.getCity());
        assertEquals(user.getId(), result.getUserId());
        assertNotNull(result.getImagePath());
        assertTrue(result.getImagePath().startsWith("/uploads/"));
        assertTrue(result.getImagePath().endsWith(".jpg"));

        String uploadedFileName = result.getImagePath().substring(result.getImagePath().lastIndexOf("/") + 1);
        assertTrue(Files.exists(uploadDir.resolve(uploadedFileName)));

        ArgumentCaptor<Observation> captor = ArgumentCaptor.forClass(Observation.class);
        verify(observationRepository).save(captor.capture());
        assertEquals(user, captor.getValue().getUser());
    }

    @Test
    void add_ShouldReturnUnauthorizedWhenAuthHeaderIsMissing() {
        MockMultipartFile file = new MockMultipartFile(
                "image",
                "bird.jpg",
                "image/jpeg",
                "image-data".getBytes(StandardCharsets.UTF_8)
        );

        ResponseEntity<ObservationDto> response = observationController.add(
                null,
                "Bird",
                8,
                null,
                null,
                null,
                null,
                null,
                file
        );

        assertEquals(401, response.getStatusCode().value());
        assertNull(response.getBody());
        verifyNoInteractions(jwtService, userRepository, observationRepository);
    }

    @Test
    void updateObservation_ShouldUpdateExistingObservation() {
        Long obsId = 1L;
        Observation existingObs = new Observation();
        existingObs.setId(obsId);
        existingObs.setSpeciesName("Old Name");
        existingObs.setCategoryId(8);
        existingObs.setUser(user);

        ObservationUpdateRequest details = new ObservationUpdateRequest(
                "New Name",
                2,
                "Updated description",
                61.0,
                25.0,
                "Finland",
                "Tampere"
        );

        when(jwtService.extractUsername("test-token")).thenReturn(EMAIL);
        when(userRepository.findByEmail(EMAIL)).thenReturn(Optional.of(user));
        when(observationRepository.findById(obsId)).thenReturn(Optional.of(existingObs));
        when(observationRepository.save(any(Observation.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ResponseEntity<ObservationDto> response = observationController.updateObservation(AUTH_HEADER, obsId, details);

        assertEquals(200, response.getStatusCode().value());
        assertNotNull(response.getBody());
        assertEquals("New Name", response.getBody().getSpeciesName());
        assertEquals(2, response.getBody().getCategoryId());
        assertEquals("Updated description", response.getBody().getDescription());
        assertEquals(61.0, response.getBody().getLatitude());
        assertEquals(25.0, response.getBody().getLongitude());
        assertEquals("Finland", response.getBody().getCountry());
        assertEquals("Tampere", response.getBody().getCity());
        verify(observationRepository).save(existingObs);
    }

    @Test
    void updateObservation_ShouldReturnNotFoundWhenIdDoesNotExist() {
        Long obsId = 999L;
        ObservationUpdateRequest details = new ObservationUpdateRequest(
                "Ghost Species",
                null,
                null,
                null,
                null,
                null,
                null
        );

        when(jwtService.extractUsername("test-token")).thenReturn(EMAIL);
        when(userRepository.findByEmail(EMAIL)).thenReturn(Optional.of(user));
        when(observationRepository.findById(obsId)).thenReturn(Optional.empty());

        ResponseEntity<ObservationDto> response = observationController.updateObservation(AUTH_HEADER, obsId, details);

        assertEquals(404, response.getStatusCode().value());
        assertNull(response.getBody());
        verify(observationRepository, never()).save(any(Observation.class));
    }

    @Test
    void deleteObservation_ShouldDeleteObservationAndUploadedImageWhenFound() throws IOException {
        Long obsId = 1L;
        Path uploadedFile = uploadDir.resolve("bird.jpg");
        Files.writeString(uploadedFile, "image-data");

        Observation existingObs = new Observation();
        existingObs.setId(obsId);
        existingObs.setImagePath("/uploads/bird.jpg");
        existingObs.setUser(user);

        when(jwtService.extractUsername("test-token")).thenReturn(EMAIL);
        when(userRepository.findByEmail(EMAIL)).thenReturn(Optional.of(user));
        when(observationRepository.findById(obsId)).thenReturn(Optional.of(existingObs));

        ResponseEntity<Void> response = observationController.deleteObservation(AUTH_HEADER, obsId);

        assertEquals(200, response.getStatusCode().value());
        assertFalse(Files.exists(uploadedFile));
        verify(observationRepository).deleteById(obsId);
    }

    @Test
    void deleteObservation_ShouldReturnNotFoundWhenIdDoesNotExist() {
        Long obsId = 999L;
        when(jwtService.extractUsername("test-token")).thenReturn(EMAIL);
        when(userRepository.findByEmail(EMAIL)).thenReturn(Optional.of(user));
        when(observationRepository.findById(obsId)).thenReturn(Optional.empty());

        ResponseEntity<Void> response = observationController.deleteObservation(AUTH_HEADER, obsId);

        assertEquals(404, response.getStatusCode().value());
        verify(observationRepository, never()).deleteById(anyLong());
    }
}
