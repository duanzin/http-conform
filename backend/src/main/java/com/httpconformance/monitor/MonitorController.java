package com.httpconformance.monitor;

import com.httpconformance.monitor.api.CreateMonitorRequest;
import com.httpconformance.monitor.api.MonitorResponse;
import com.httpconformance.monitor.api.UpdateMonitorRequest;
import com.httpconformance.user.CurrentUserService;
import com.httpconformance.user.User;
import jakarta.validation.Valid;
import java.net.URI;
import java.util.List;
import java.util.UUID;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class MonitorController {

    private final MonitorService monitorService;
    private final CurrentUserService currentUserService;

    public MonitorController(MonitorService monitorService, CurrentUserService currentUserService) {
        this.monitorService = monitorService;
        this.currentUserService = currentUserService;
    }

    @GetMapping("/monitors")
    public List<MonitorResponse> listMonitors(@AuthenticationPrincipal Jwt jwt) {
        User user = currentUserService.getOrCreateUser(jwt);
        return monitorService.listMonitors(user.getId());
    }

    @GetMapping("/monitors/{id}")
    public MonitorResponse getMonitor(@PathVariable UUID id, @AuthenticationPrincipal Jwt jwt) {
        User user = currentUserService.getOrCreateUser(jwt);
        return monitorService.getMonitor(id, user.getId());
    }

    @PostMapping("/monitors")
    public ResponseEntity<MonitorResponse> createMonitor(
            @Valid @RequestBody CreateMonitorRequest request,
            @AuthenticationPrincipal Jwt jwt) {
        User user = currentUserService.getOrCreateUser(jwt);
        MonitorResponse response = monitorService.createMonitor(request, user.getId());
        return ResponseEntity.created(URI.create("/api/monitors/" + response.id())).body(response);
    }

    @PutMapping("/monitors/{id}")
    public MonitorResponse updateMonitor(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateMonitorRequest request,
            @AuthenticationPrincipal Jwt jwt) {
        User user = currentUserService.getOrCreateUser(jwt);
        return monitorService.updateMonitor(id, request, user.getId());
    }

    @DeleteMapping("/monitors/{id}")
    public ResponseEntity<Void> deleteMonitor(
            @PathVariable UUID id,
            @AuthenticationPrincipal Jwt jwt) {
        User user = currentUserService.getOrCreateUser(jwt);
        monitorService.deleteMonitor(id, user.getId());
        return ResponseEntity.noContent().build();
    }
}
