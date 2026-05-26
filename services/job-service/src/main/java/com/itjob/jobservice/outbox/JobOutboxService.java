package com.itjob.jobservice.outbox;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.micrometer.core.instrument.MeterRegistry;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.transaction.support.TransactionTemplate;

import java.time.Clock;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@Slf4j
public class JobOutboxService {

    private static final int MAX_ERROR_LENGTH = 1000;
    private static final Clock UTC_CLOCK = Clock.systemUTC();
    private static final TypeReference<Map<String, Object>> MAP_TYPE = new TypeReference<>() {
    };

    private final OutboxEventRepository outboxEventRepository;
    private final KafkaTemplate<String, Object> kafkaTemplate;
    private final ObjectMapper objectMapper;
    private final MeterRegistry meterRegistry;
    private final PlatformTransactionManager transactionManager;

    public void enqueue(String topic, Map<String, Object> event) {
        String eventId = resolveEventId(event);
        event.put("eventId", eventId);

        if (outboxEventRepository.existsById(eventId)) {
            incrementOutboxMetric(topic, "duplicate");
            log.info("Skipping duplicate job outbox event: {}", eventId);
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

            if (TransactionSynchronizationManager.isSynchronizationActive()) {
                TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                    @Override
                    public void afterCommit() {
                        publishEvent(eventId);
                    }
                });
            } else {
                publishEvent(eventId);
            }
        } catch (Exception exception) {
            incrementOutboxMetric(topic, "enqueue_failed");
            throw new IllegalStateException("Failed to enqueue job outbox event " + eventId, exception);
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
        TransactionTemplate transactionTemplate = new TransactionTemplate(transactionManager);
        transactionTemplate.executeWithoutResult(status -> outboxEventRepository.findById(eventId).ifPresent(event -> {
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
                log.info("Published job outbox event {} to topic {}", event.getEventId(), event.getTopic());
            } catch (Exception exception) {
                event.setStatus(OutboxEventStatus.FAILED);
                event.setAttempts(event.getAttempts() + 1);
                event.setLastError(truncate(exception.getMessage()));
                event.setNextAttemptAt(now().plusSeconds(Math.min(60, event.getAttempts() * 5L)));
                outboxEventRepository.save(event);
                incrementOutboxMetric(event.getTopic(), "failed");
                log.warn("Failed to publish job outbox event {}: {}", event.getEventId(), exception.getMessage());
            }
        }));
    }

    private String resolveEventId(Map<String, Object> event) {
        Object explicitEventId = event.get("eventId");
        if (explicitEventId != null && !explicitEventId.toString().isBlank()) {
            return explicitEventId.toString();
        }
        return UUID.randomUUID().toString();
    }

    private String resolveAggregateId(Map<String, Object> event) {
        Object jobId = event.get("jobId");
        return jobId == null || jobId.toString().isBlank()
                ? "unknown"
                : jobId.toString();
    }

    private String truncate(String value) {
        if (value == null) {
            return null;
        }
        return value.length() <= MAX_ERROR_LENGTH ? value : value.substring(0, MAX_ERROR_LENGTH);
    }

    private void incrementOutboxMetric(String topic, String result) {
        meterRegistry.counter(
                "job_outbox_events_total",
                "topic", topic,
                "result", result
        ).increment();
    }

    private LocalDateTime now() {
        return LocalDateTime.now(UTC_CLOCK);
    }
}
