package com.itjob.dashboardservice.kafka;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.itjob.dashboardservice.service.DashboardReadModelService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DashboardReadModelConsumer {

    private static final int MAX_RETRY_ATTEMPTS = 3;

    private final DashboardReadModelService readModelService;
    private final DashboardDlqPublisher dlqPublisher;
    private final ObjectMapper objectMapper;

    @KafkaListener(topics = "job-created", groupId = "dashboard-service-read-model-group")
    public void handleJobCreated(String message) {
        handle("job-created", message, payload -> readModelService.applyJobCreated(payload, "job-created"));
    }

    @KafkaListener(topics = "job-status-changed", groupId = "dashboard-service-read-model-group")
    public void handleJobStatusChanged(String message) {
        handle("job-status-changed", message, payload -> readModelService.applyJobStatusChanged(payload, "job-status-changed"));
    }

    @KafkaListener(topics = "job-expired", groupId = "dashboard-service-read-model-group")
    public void handleJobExpired(String message) {
        handle("job-expired", message, payload -> readModelService.applyJobExpired(payload, "job-expired"));
    }

    @KafkaListener(topics = "application-created", groupId = "dashboard-service-read-model-group")
    public void handleApplicationCreated(String message) {
        handle("application-created", message, payload -> readModelService.applyApplicationCreated(payload, "application-created"));
    }

    @KafkaListener(topics = "application-status-changed", groupId = "dashboard-service-read-model-group")
    public void handleApplicationStatusChanged(String message) {
        handle("application-status-changed", message, payload -> readModelService.applyApplicationStatusChanged(payload, "application-status-changed"));
    }

    private void handle(String topic, String message, EventHandler handler) {
        Exception lastException = null;

        for (int attempt = 1; attempt <= MAX_RETRY_ATTEMPTS; attempt++) {
            try {
                JsonNode payload = objectMapper.readTree(message);
                boolean processed = handler.apply(payload);
                log.info("Dashboard read model event {} handled. processed={}", topic, processed);
                return;
            } catch (Exception exception) {
                lastException = exception;
                log.warn(
                        "Failed to process dashboard read model event from topic {} on attempt {}/{}: {}",
                        topic,
                        attempt,
                        MAX_RETRY_ATTEMPTS,
                        exception.getMessage()
                );
            }
        }

        if (lastException != null) {
            log.error(
                    "Sending dashboard read model event from topic {} to DLQ after {} failed attempts",
                    topic,
                    MAX_RETRY_ATTEMPTS,
                    lastException
            );
            dlqPublisher.publish(topic, message, lastException, MAX_RETRY_ATTEMPTS);
        }
    }

    @FunctionalInterface
    private interface EventHandler {
        boolean apply(JsonNode payload);
    }
}
