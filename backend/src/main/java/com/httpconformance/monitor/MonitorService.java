package com.httpconformance.monitor;

import com.httpconformance.monitor.api.CreateMonitorRequest;
import com.httpconformance.monitor.api.MonitorResponse;
import com.httpconformance.monitor.api.UpdateMonitorRequest;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class MonitorService {

    private static final UUID TEMP_USER_ID = UUID.fromString("11111111-1111-1111-1111-111111111111");

    private final MonitorRepository monitorRepository;

    public MonitorService(MonitorRepository monitorRepository) {
        this.monitorRepository = monitorRepository;
    }

    public List<MonitorResponse> listMonitors() {
        return monitorRepository.findAllByUserIdOrderByCreatedAtDesc(TEMP_USER_ID).stream()
                .map(this::toResponse)
                .toList();
    }

    public MonitorResponse getMonitor(UUID id) {
        Monitor monitor = findById(id);
        return toResponse(monitor);
    }

    @Transactional
    public MonitorResponse createMonitor(CreateMonitorRequest request) {
        Monitor monitor = new Monitor(
                TEMP_USER_ID,
                request.name(),
                request.url(),
                request.method(),
                request.intervalSeconds(),
                request.timeoutMs(),
                request.enabled());

        Monitor saved = monitorRepository.save(monitor);
        return toResponse(saved);
    }

    @Transactional
    public MonitorResponse updateMonitor(UUID id, UpdateMonitorRequest request) {
        Monitor monitor = findById(id);
        monitor.setName(request.name());
        monitor.setUrl(request.url());
        monitor.setMethod(request.method());
        monitor.setIntervalSeconds(request.intervalSeconds());
        monitor.setTimeoutMs(request.timeoutMs());
        monitor.setEnabled(request.enabled());

        Monitor updated = monitorRepository.save(monitor);
        return toResponse(updated);
    }

    @Transactional
    public void deleteMonitor(UUID id) {
        Monitor monitor = findById(id);
        monitorRepository.delete(monitor);
    }

    private Monitor findById(UUID id) {
        return monitorRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Monitor not found"));
    }

    private MonitorResponse toResponse(Monitor monitor) {
        return new MonitorResponse(
                monitor.getId(),
                monitor.getName(),
                monitor.getUrl(),
                monitor.getMethod(),
                monitor.getIntervalSeconds(),
                monitor.getTimeoutMs(),
                monitor.getEnabled(),
                monitor.getCreatedAt(),
                monitor.getUpdatedAt());
    }
}
