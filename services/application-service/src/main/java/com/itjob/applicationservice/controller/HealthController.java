package com.itjob.applicationservice.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.Map;

@RestController
public class HealthController {

    @GetMapping("/health")
    public Map<String, Object> getHealth() {
        return Map.of(
                "status", "ok",
                "service", "application-service",
                "timestamp", Instant.now().toString()
        );
    }
}
