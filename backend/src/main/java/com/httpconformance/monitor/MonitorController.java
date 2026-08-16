package com.httpconformance.monitor;

import com.httpconformance.monitor.api.CreateMonitorRequest;
import com.httpconformance.monitor.api.MonitorResponse;
import com.httpconformance.monitor.api.UpdateMonitorRequest;
import jakarta.validation.Valid;
import java.net.URI;
import java.util.List;
import java.util.UUID;
import org.springframework.http.ResponseEntity;
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

    public MonitorController(MonitorService monitorService) {
        this.monitorService = monitorService;
    }

    @GetMapping("/monitors")
    public List<MonitorResponse> listMonitors() {
        return monitorService.listMonitors();
    }

    @GetMapping("/monitors/{id}")
    public MonitorResponse getMonitor(@PathVariable UUID id) {
        return monitorService.getMonitor(id);
    }

    @PostMapping("/monitors")
    public ResponseEntity<MonitorResponse> createMonitor(@Valid @RequestBody CreateMonitorRequest request) {
        MonitorResponse response = monitorService.createMonitor(request);
        return ResponseEntity.created(URI.create("/api/monitors/" + response.id())).body(response);
    }

    @PutMapping("/monitors/{id}")
    public MonitorResponse updateMonitor(@PathVariable UUID id, @Valid @RequestBody UpdateMonitorRequest request) {
        return monitorService.updateMonitor(id, request);
    }

    @DeleteMapping("/monitors/{id}")
    public ResponseEntity<Void> deleteMonitor(@PathVariable UUID id) {
        monitorService.deleteMonitor(id);
        return ResponseEntity.noContent().build();
    }
}
