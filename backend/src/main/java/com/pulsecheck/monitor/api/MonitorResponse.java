package com.pulsecheck.monitor.api;

import java.time.OffsetDateTime;
import java.util.UUID;

public record MonitorResponse(
        UUID id,
        String name,
        String url,
        String method,
        int intervalSeconds,
        int timeoutMs,
        boolean enabled,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt) {}
