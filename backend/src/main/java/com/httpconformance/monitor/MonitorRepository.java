package com.httpconformance.monitor;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MonitorRepository extends JpaRepository<Monitor, UUID> {
    List<Monitor> findAllByUserIdOrderByCreatedAtDesc(UUID userId);
}
