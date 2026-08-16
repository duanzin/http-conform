package com.httpconformance.monitor;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.OffsetDateTime;
import java.util.UUID;
import org.hibernate.validator.constraints.URL;

@Entity
@Table(name = "monitors")
public class Monitor {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @NotBlank
    @Column(nullable = false)
    private String name;

    @NotBlank
    @URL
    @Column(nullable = false, length = 2048)
    private String url;

    @NotBlank
    @Column(nullable = false, length = 16)
    private String method;

    @NotNull
    @Min(10)
    @Max(86400)
    @Column(name = "interval_seconds", nullable = false)
    private Integer intervalSeconds;

    @NotNull
    @Min(100)
    @Max(30000)
    @Column(name = "timeout_ms", nullable = false)
    private Integer timeoutMs;

    @NotNull
    @Column(nullable = false)
    private Boolean enabled = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    protected Monitor() {}

    public Monitor(UUID userId, String name, String url, String method, Integer intervalSeconds, Integer timeoutMs, Boolean enabled) {
        this.userId = userId;
        this.name = name;
        this.url = url;
        this.method = method;
        this.intervalSeconds = intervalSeconds;
        this.timeoutMs = timeoutMs;
        this.enabled = enabled != null ? enabled : true;
        this.createdAt = OffsetDateTime.now();
        this.updatedAt = this.createdAt;
    }

    public UUID getId() {
        return id;
    }

    public UUID getUserId() {
        return userId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
        this.updatedAt = OffsetDateTime.now();
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
        this.updatedAt = OffsetDateTime.now();
    }

    public String getMethod() {
        return method;
    }

    public void setMethod(String method) {
        this.method = method;
        this.updatedAt = OffsetDateTime.now();
    }

    public Integer getIntervalSeconds() {
        return intervalSeconds;
    }

    public void setIntervalSeconds(Integer intervalSeconds) {
        this.intervalSeconds = intervalSeconds;
        this.updatedAt = OffsetDateTime.now();
    }

    public Integer getTimeoutMs() {
        return timeoutMs;
    }

    public void setTimeoutMs(Integer timeoutMs) {
        this.timeoutMs = timeoutMs;
        this.updatedAt = OffsetDateTime.now();
    }

    public Boolean getEnabled() {
        return enabled;
    }

    public void setEnabled(Boolean enabled) {
        this.enabled = enabled;
        this.updatedAt = OffsetDateTime.now();
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }

    public OffsetDateTime getUpdatedAt() {
        return updatedAt;
    }
}
