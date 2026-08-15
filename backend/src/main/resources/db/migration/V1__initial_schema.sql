CREATE TABLE users (
    id UUID PRIMARY KEY,
    auth_provider_id VARCHAR(255) UNIQUE,
    email VARCHAR(320) NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE monitors (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    url VARCHAR(2048) NOT NULL,
    method VARCHAR(16) NOT NULL,
    interval_seconds INTEGER NOT NULL CHECK (interval_seconds >= 10),
    timeout_ms INTEGER NOT NULL CHECK (timeout_ms >= 100),
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_monitors_user_id ON monitors(user_id);

CREATE TABLE check_results (
    id UUID PRIMARY KEY,
    monitor_id UUID NOT NULL REFERENCES monitors(id) ON DELETE CASCADE,
    checked_at TIMESTAMP NOT NULL,
    status VARCHAR(16) NOT NULL,
    http_status INTEGER,
    response_time_ms INTEGER,
    error_message TEXT
);

CREATE INDEX idx_check_results_monitor_checked_at
    ON check_results(monitor_id, checked_at DESC);

CREATE TABLE incidents (
    id UUID PRIMARY KEY,
    monitor_id UUID NOT NULL REFERENCES monitors(id) ON DELETE CASCADE,
    started_at TIMESTAMP NOT NULL,
    resolved_at TIMESTAMP,
    reason VARCHAR(255) NOT NULL
);

CREATE INDEX idx_incidents_monitor_started_at
    ON incidents(monitor_id, started_at DESC);
