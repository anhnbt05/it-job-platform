package com.itjob.dashboardservice.kafka;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.micrometer.core.instrument.MeterRegistry;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.concurrent.TimeUnit;

@Component
@RequiredArgsConstructor
@Slf4j
public class DashboardDlqPublisher {

    public static final String DASHBOARD_DLQ_TOPIC = "dashboard.dlq";

    private final KafkaTemplate<String, String> kafkaTemplate;
    private final ObjectMapper objectMapper;
    private final MeterRegistry meterRegistry;

    public void publish(String sourceTopic, String originalMessage, Exception exception, int retryAttempts) {
        try {
            Map<String, Object> payload = new LinkedHashMap<>();
            payload.put("sourceTopic", sourceTopic);
            payload.put("retryAttempts", retryAttempts);
            payload.put("errorType", exception.getClass().getSimpleName());
            payload.put("errorMessage", exception.getMessage());
            payload.put("failedAt", LocalDateTime.now().toString());
            payload.put("originalMessage", originalMessage);

            kafkaTemplate.send(DASHBOARD_DLQ_TOPIC, sourceTopic, objectMapper.writeValueAsString(payload))
                    .get(10, TimeUnit.SECONDS);
            meterRegistry.counter(
                    "dashboard_dlq_events_total",
                    "source_topic", sourceTopic,
                    "result", "published"
            ).increment();
            log.warn("Published dashboard read model event from topic {} to DLQ", sourceTopic);
        } catch (Exception dlqException) {
            meterRegistry.counter(
                    "dashboard_dlq_events_total",
                    "source_topic", sourceTopic,
                    "result", "publish_failed"
            ).increment();
            log.error("Failed to publish dashboard DLQ event for topic {}: {}", sourceTopic, dlqException.getMessage(), dlqException);
        }
    }
}
