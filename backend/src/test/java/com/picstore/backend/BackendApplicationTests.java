package com.picstore.backend;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.picstore.backend.model.Observation;
import com.picstore.backend.model.User;
import com.picstore.backend.repository.ObservationRepository;
import com.picstore.backend.repository.UserRepository;
import com.picstore.backend.service.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc(addFilters = false)
@ActiveProfiles("test")
class BackendApplicationTests {

    private static final String AUTH_HEADER = "Bearer test-token";
    private static final String EMAIL = "integration@example.com";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObservationRepository observationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private JwtService jwtService;

    private User user;

    @BeforeEach
    void setUp() {
        observationRepository.deleteAll();
        userRepository.deleteAll();

        user = new User();
        user.setEmail(EMAIL);
        user.setUsername("integration-user");
        user.setPassword("password");
        user = userRepository.save(user);

        Mockito.when(jwtService.extractUsername("test-token")).thenReturn(EMAIL);
    }

    @Test
    void contextLoads() {
    }

    @Test
    void integration_addObservationAndGetAll_ShouldPersistInDatabase() throws Exception {
        MockMultipartFile image = new MockMultipartFile(
                "image",
                "integration-bird.jpg",
                "image/jpeg",
                "image-data".getBytes()
        );

        mockMvc.perform(multipart("/api/observations")
                        .file(image)
                        .header("Authorization", AUTH_HEADER)
                        .param("speciesName", "Integration Bird")
                        .param("categoryId", "5")
                        .param("description", "Seen near the lake")
                        .param("latitude", "60.1699")
                        .param("longitude", "24.9384")
                        .param("country", "Finland")
                        .param("city", "Helsinki"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.speciesName").value("Integration Bird"))
                .andExpect(jsonPath("$.categoryId").value(5))
                .andExpect(jsonPath("$.country").value("Finland"))
                .andExpect(jsonPath("$.city").value("Helsinki"));

        mockMvc.perform(get("/api/observations")
                        .header("Authorization", AUTH_HEADER))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].speciesName").value("Integration Bird"))
                .andExpect(jsonPath("$[0].categoryId").value(5));
    }

    @Test
    void integration_updateObservation_ShouldModifyExistingData() throws Exception {
        Observation observation = new Observation();
        observation.setSpeciesName("Old Name");
        observation.setCategoryId(1);
        observation.setUser(user);
        Observation saved = observationRepository.save(observation);

        Observation details = new Observation();
        details.setSpeciesName("Updated Name");
        details.setCategoryId(9);
        details.setDescription("Updated description");
        details.setCountry("Finland");
        details.setCity("Turku");

        mockMvc.perform(put("/api/observations/" + saved.getId())
                        .header("Authorization", AUTH_HEADER)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(details)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.speciesName").value("Updated Name"))
                .andExpect(jsonPath("$.categoryId").value(9))
                .andExpect(jsonPath("$.description").value("Updated description"))
                .andExpect(jsonPath("$.country").value("Finland"))
                .andExpect(jsonPath("$.city").value("Turku"));
    }

    @Test
    void integration_deleteObservation_ShouldRemoveDataFromDatabase() throws Exception {
        Observation observation = new Observation();
        observation.setSpeciesName("To Be Deleted");
        observation.setCategoryId(2);
        observation.setUser(user);
        Observation saved = observationRepository.save(observation);

        mockMvc.perform(delete("/api/observations/" + saved.getId())
                        .header("Authorization", AUTH_HEADER))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/observations")
                        .header("Authorization", AUTH_HEADER))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(0)));
    }
}
