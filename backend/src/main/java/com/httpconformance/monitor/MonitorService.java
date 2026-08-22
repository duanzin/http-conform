package com.httpconformance.monitor;

import com.httpconformance.monitor.api.CreateMonitorRequest;
import com.httpconformance.monitor.api.MonitorResponse;
import com.httpconformance.monitor.api.UpdateMonitorRequest;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class MonitorService {

    private final MonitorRepository monitorRepository;

    public MonitorService(MonitorRepository monitorRepository) {
        this.monitorRepository = monitorRepository;
    }

    public List<MonitorResponse> listMonitors(UUID userId) {
        return monitorRepository.findAllByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::toResponse)
                .toList();
    }

    public MonitorResponse getMonitor(UUID id, UUID userId) {
        Monitor monitor = findByIdAndUserId(id, userId);
        return toResponse(monitor);
    }

    @Transactional
    public MonitorResponse createMonitor(CreateMonitorRequest request, UUID userId) {
        Monitor monitor = new Monitor(
                userId,
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
    public MonitorResponse updateMonitor(UUID id, UpdateMonitorRequest request, UUID userId) {
        Monitor monitor = findByIdAndUserId(id, userId);
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
    public void deleteMonitor(UUID id, UUID userId) {
        Monitor monitor = findByIdAndUserId(id, userId);
        monitorRepository.delete(monitor);
    }

    private Monitor findByIdAndUserId(UUID id, UUID userId) {
        return monitorRepository.findByIdAndUserId(id, userId)
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
