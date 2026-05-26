package com.itjob.applicationservice.outbox;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.micrometer.core.instrument.MeterRegistry;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.Clock;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@Slf4j
public class ApplicationOutboxService {

    private static final int MAX_ERROR_LENGTH = 1000;
    private static final Clock UTC_CLOCK = Clock.systemUTC();
    private static final TypeReference<Map<String, Object>> MAP_TYPE = new TypeReference<>() {
    };

    private final OutboxEventRepository outboxEventRepository;
    private final KafkaTemplate<String, Object> kafkaTemplate;
    private final ObjectMapper objectMapper;
    private final MeterRegistry meterRegistry;

    public void enqueue(String topic, Map<String, Object> event) {
        String eventId = resolveEventId(event);
        event.put("eventId", eventId);

        if (outboxEventRepository.existsById(eventId)) {
            incrementOutboxMetric(topic, "duplicate");
            log.info("Skipping duplicate application outbox event: {}", eventId);
            return;
        }

        try {
            OutboxEvent outboxEvent = OutboxEvent.builder()
                    .eventId(eventId)
                    .eventType(String.valueOf(event.getOrDefault("eventType", topic)))
                    .aggregateId(resolveAggregateId(event))
                    .topic(topic)
                    .payload(objectMapper.writeValueAsString(event))
                    .status(OutboxEventStatus.PENDING)
                    .attempts(0)
                    .createdAt(now())
                    .nextAttemptAt(now())
                    .build();

            outboxEventRepository.save(outboxEvent);
            incrementOutboxMetric(topic, "enqueued");
            publishEvent(eventId);
        } catch (Exception exception) {
            incrementOutboxMetric(topic, "enqueue_failed");
            throw new IllegalStateException("Failed to enqueue application outbox event " + eventId, exception);
        }
    }

    @Scheduled(fixedDelayString = "${app.outbox.publisher-interval-ms:5000}")
    public void publishPendingEvents() {
        List<OutboxEvent> events = outboxEventRepository
                .findTop100ByStatusInAndNextAttemptAtLessThanEqualOrderByCreatedAtAsc(
                        List.of(OutboxEventStatus.PENDING, OutboxEventStatus.FAILED),
                        now()
                );

        for (OutboxEvent event : events) {
            publishEvent(event.getEventId());
        }
    }

    public void publishEvent(String eventId) {
        outboxEventRepository.findById(eventId).ifPresent(event -> {
            if (event.getStatus() == OutboxEventStatus.PUBLISHED) {
                return;
            }

            try {
                Map<String, Object> payload = objectMapper.readValue(event.getPayload(), MAP_TYPE);
                kafkaTemplate.send(event.getTopic(), event.getAggregateId(), payload).get(10, TimeUnit.SECONDS);

                event.setStatus(OutboxEventStatus.PUBLISHED);
                event.setPublishedAt(now());
                event.setLastError(null);
                outboxEventRepository.save(event);
                incrementOutboxMetric(event.getTopic(), "published");
                log.info("Published application outbox event {} to topic {}", event.getEventId(), event.getTopic());
            } catch (Exception exception) {
                event.setStatus(OutboxEventStatus.FAILED);
                event.setAttempts(event.getAttempts() + 1);
                event.setLastError(truncate(exception.getMessage()));
                event.setNextAttemptAt(now().plusSeconds(Math.min(60, event.getAttempts() * 5L)));
                outboxEventRepository.save(event);
                incrementOutboxMetric(event.getTopic(), "failed");
                log.warn("Failed to publish application outbox event {}: {}", event.getEventId(), exception.getMessage());
            }
        });
    }

    private String resolveEventId(Map<String, Object> event) {
        Object explicitEventId = event.get("eventId");
        if (explicitEventId != null && !explicitEventId.toString().isBlank()) {
            return explicitEventId.toString();
        }
        return UUID.randomUUID().toString();
    }

    private String resolveAggregateId(Map<String, Object> event) {
        Object applicationId = event.get("applicationId");
        return applicationId == null || applicationId.toString().isBlank()
                ? "unknown"
                : applicationId.toString();
    }

    private String truncate(String value) {
        if (value == null) {
            return null;
        }
        return value.length() <= MAX_ERROR_LENGTH ? value : value.substring(0, MAX_ERROR_LENGTH);
    }

    private void incrementOutboxMetric(String topic, String result) {
        meterRegistry.counter(
                "application_outbox_events_total",
                "topic", topic,
                "result", result
        ).increment();
    }

    private LocalDateTime now() {
        return LocalDateTime.now(UTC_CLOCK);
    }
}
