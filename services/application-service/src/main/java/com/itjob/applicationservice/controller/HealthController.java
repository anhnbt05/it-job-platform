package com.itjob.applicationservice.controller;

import com.itjob.applicationservice.repository.ApplicationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class HealthController {

    private final ApplicationRepository applicationRepository;

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> getHealth() {
        String timestamp = Instant.now().toString();

        try {
            applicationRepository.count();

            return ResponseEntity.ok(Map.of(
                    "status", "ok",
                    "service", "application-service",
                    "timestamp", timestamp,
                    "dependencies", Map.of("database", "ok")
            ));
        } catch (Exception exception) {
            Map<String, Object> body = new LinkedHashMap<>();
            body.put("status", "error");
            body.put("service", "application-service");
            body.put("timestamp", timestamp);
            body.put("dependencies", Map.of("database", "error"));
            body.put("message", exception.getMessage());
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(body);
        }
    }
}
