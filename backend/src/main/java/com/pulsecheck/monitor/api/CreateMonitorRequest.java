package com.pulsecheck.monitor.api;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import org.hibernate.validator.constraints.URL;

public record CreateMonitorRequest(
        @NotBlank String name,
        @NotBlank @URL String url,
        @NotBlank @Pattern(regexp = "GET|HEAD|POST|PUT|PATCH|DELETE|OPTIONS") String method,
        @NotNull @Min(10) @Max(86400) Integer intervalSeconds,
        @NotNull @Min(100) @Max(30000) Integer timeoutMs,
        @NotNull Boolean enabled) {}
