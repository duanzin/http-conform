package com.httpconformance.monitor;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.httpconformance.monitor.api.CreateMonitorRequest;
import com.httpconformance.monitor.api.UpdateMonitorRequest;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.JwtRequestPostProcessor;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
class MonitorControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private JwtRequestPostProcessor userA() {
        return jwt().jwt(builder -> builder
                .subject("auth0|user-a")
                .claim("email", "user-a@example.com")
                .claim("name", "User A"));
    }

    private JwtRequestPostProcessor userB() {
        return jwt().jwt(builder -> builder
                .subject("auth0|user-b")
                .claim("email", "user-b@example.com")
                .claim("name", "User B"));
    }

    @Test
    void shouldRejectUnauthenticatedRequestsToMonitors() throws Exception {
        mockMvc.perform(get("/api/monitors"))
                .andExpect(status().isUnauthorized());

        CreateMonitorRequest createRequest = new CreateMonitorRequest(
                "GitHub API",
                "https://api.github.com",
                "GET",
                60,
                5000,
                true);

        mockMvc.perform(post("/api/monitors")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createRequest)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void shouldAllowUnauthenticatedAccessToHealthEndpoint() throws Exception {
        mockMvc.perform(get("/api/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("UP"));
    }

    @Test
    void shouldCreateListReadUpdateAndDeleteMonitorForAuthenticatedUser() throws Exception {
        CreateMonitorRequest createRequest = new CreateMonitorRequest(
                "GitHub API",
                "https://api.github.com",
                "GET",
                60,
                5000,
                true);

        String createResponse = mockMvc.perform(post("/api/monitors")
                        .with(userA())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("GitHub API"))
                .andExpect(jsonPath("$.url").value("https://api.github.com"))
                .andReturn()
                .getResponse()
                .getContentAsString();

        String id = objectMapper.readTree(createResponse).get("id").asText();

        mockMvc.perform(get("/api/monitors").with(userA()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("GitHub API"));

        mockMvc.perform(get("/api/monitors/{id}", id).with(userA()))
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
                        .with(userA())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("GitHub API Updated"))
                .andExpect(jsonPath("$.enabled").value(false));

        mockMvc.perform(delete("/api/monitors/{id}", id).with(userA()))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/monitors/{id}", id).with(userA()))
                .andExpect(status().isNotFound());

        mockMvc.perform(get("/api/monitors").with(userA()))
                .andExpect(status().isOk())
                .andExpect(result -> assertThat(result.getResponse().getContentAsString()).doesNotContain("GitHub API Updated"));
    }

    @Test
    void shouldEnforceUserIsolationAndPreventCrossTenantAccess() throws Exception {
        // User A creates a monitor
        CreateMonitorRequest createRequest = new CreateMonitorRequest(
                "User A Private API",
                "https://api.user-a.internal",
                "GET",
                30,
                3000,
                true);

        String createResponse = mockMvc.perform(post("/api/monitors")
                        .with(userA())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createRequest)))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();

        String monitorId = objectMapper.readTree(createResponse).get("id").asText();

        // User B cannot see User A's monitor in list
        mockMvc.perform(get("/api/monitors").with(userB()))
                .andExpect(status().isOk())
                .andExpect(result -> assertThat(result.getResponse().getContentAsString()).doesNotContain("User A Private API"));

        // User B cannot get User A's monitor
        mockMvc.perform(get("/api/monitors/{id}", monitorId).with(userB()))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("NOT_FOUND"));

        // User B cannot update User A's monitor
        UpdateMonitorRequest maliciousUpdate = new UpdateMonitorRequest(
                "Hijacked Monitor",
                "https://evil.example.com",
                "POST",
                10,
                1000,
                false);

        mockMvc.perform(put("/api/monitors/{id}", monitorId)
                        .with(userB())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(maliciousUpdate)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("NOT_FOUND"));

        // User B cannot delete User A's monitor
        mockMvc.perform(delete("/api/monitors/{id}", monitorId).with(userB()))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("NOT_FOUND"));

        // User A still owns and can access the monitor
        mockMvc.perform(get("/api/monitors/{id}", monitorId).with(userA()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("User A Private API"));

        // Cleanup by User A
        mockMvc.perform(delete("/api/monitors/{id}", monitorId).with(userA()))
                .andExpect(status().isNoContent());
    }

    @Test
    void shouldReturnValidationErrorsOnCreateWithBlankName() throws Exception {
        CreateMonitorRequest createRequest = new CreateMonitorRequest(
                "",
                "https://api.github.com",
                "GET",
                60,
                5000,
                true);

        mockMvc.perform(post("/api/monitors")
                        .with(userA())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"))
                .andExpect(jsonPath("$.details[0]").exists());
    }

    @Test
    void shouldReturnValidationErrorsOnCreateWithInvalidUrl() throws Exception {
        CreateMonitorRequest createRequest = new CreateMonitorRequest(
                "Monitor",
                "not-a-valid-url",
                "GET",
                60,
                5000,
                true);

        mockMvc.perform(post("/api/monitors")
                        .with(userA())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"));
    }

    @Test
    void shouldReturnValidationErrorsOnCreateWithInvalidMethod() throws Exception {
        CreateMonitorRequest createRequest = new CreateMonitorRequest(
                "Monitor",
                "https://api.github.com",
                "INVALID",
                60,
                5000,
                true);

        mockMvc.perform(post("/api/monitors")
                        .with(userA())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"));
    }

    @Test
    void shouldReturnValidationErrorsOnCreateWithInvalidInterval() throws Exception {
        CreateMonitorRequest createRequest = new CreateMonitorRequest(
                "Monitor",
                "https://api.github.com",
                "GET",
                5,
                5000,
                true);

        mockMvc.perform(post("/api/monitors")
                        .with(userA())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"));
    }

    @Test
    void shouldReturnNotFoundWhenGettingNonExistentMonitor() throws Exception {
        UUID nonExistentId = UUID.randomUUID();

        mockMvc.perform(get("/api/monitors/{id}", nonExistentId).with(userA()))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("NOT_FOUND"));
    }

    @Test
    void shouldReturnNotFoundWhenUpdatingNonExistentMonitor() throws Exception {
        UUID nonExistentId = UUID.randomUUID();
        UpdateMonitorRequest updateRequest = new UpdateMonitorRequest(
                "Updated",
                "https://api.github.com",
                "GET",
                60,
                5000,
                true);

        mockMvc.perform(put("/api/monitors/{id}", nonExistentId)
                        .with(userA())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("NOT_FOUND"));
    }

    @Test
    void shouldReturnNotFoundWhenDeletingNonExistentMonitor() throws Exception {
        UUID nonExistentId = UUID.randomUUID();

        mockMvc.perform(delete("/api/monitors/{id}", nonExistentId).with(userA()))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("NOT_FOUND"));
    }
}

