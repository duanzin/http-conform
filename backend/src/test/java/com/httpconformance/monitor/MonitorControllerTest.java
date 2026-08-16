package com.httpconformance.monitor;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.httpconformance.monitor.api.CreateMonitorRequest;
import com.httpconformance.monitor.api.UpdateMonitorRequest;
import com.httpconformance.user.User;
import com.httpconformance.user.UserRepository;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc(addFilters = false)
class MonitorControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @BeforeEach
    void setUp() {
        UUID tempUserId = UUID.fromString("11111111-1111-1111-1111-111111111111");
        userRepository.findById(tempUserId).orElseGet(() -> userRepository.save(new User(tempUserId, "dev@example.com", "Development User")));
    }

    @Test
    void shouldCreateListReadUpdateAndDeleteMonitor() throws Exception {
        CreateMonitorRequest createRequest = new CreateMonitorRequest(
                "GitHub API",
                "https://api.github.com",
                "GET",
                60,
                5000,
                true);

        String createResponse = mockMvc.perform(post("/api/monitors")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("GitHub API"))
                .andExpect(jsonPath("$.url").value("https://api.github.com"))
                .andReturn()
                .getResponse()
                .getContentAsString();

        String id = objectMapper.readTree(createResponse).get("id").asText();

        mockMvc.perform(get("/api/monitors"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("GitHub API"));

        mockMvc.perform(get("/api/monitors/{id}", id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(id));

        UpdateMonitorRequest updateRequest = new UpdateMonitorRequest(
                "GitHub API Updated",
                "https://api.github.com/health",
                "GET",
                120,
                7000,
                false);

        mockMvc.perform(put("/api/monitors/{id}", id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("GitHub API Updated"))
                .andExpect(jsonPath("$.enabled").value(false));

        mockMvc.perform(delete("/api/monitors/{id}", id))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/monitors/{id}", id))
                .andExpect(status().isNotFound());

        mockMvc.perform(get("/api/monitors"))
                .andExpect(status().isOk())
                .andExpect(result -> assertThat(result.getResponse().getContentAsString()).doesNotContain("GitHub API Updated"));
    }
}
