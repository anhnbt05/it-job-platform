package com.itjob.applicationservice.kafka;

import com.itjob.applicationservice.service.ApplicationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class JobEventConsumer {

    private final ApplicationService applicationService;

    @KafkaListener(topics = "job-expired", groupId = "application-service-job-events-group")
    public void handleJobExpired(Map<String, Object> event) {
        log.info("Received job-expired event: {}", event);
        applicationService.notifyCandidatesJobClosed(event);
    }

    @KafkaListener(topics = "job-status-changed", groupId = "application-service-job-events-group")
    public void handleJobStatusChanged(Map<String, Object> event) {
        String newStatus = String.valueOf(event.getOrDefault("newStatus", event.getOrDefault("status", "")));
        if (!"closed".equalsIgnoreCase(newStatus)) {
            return;
        }

        log.info("Received closed job-status-changed event: {}", event);
        applicationService.notifyCandidatesJobClosed(event);
    }
}
