package com.itjob.dashboardservice.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.itjob.dashboardservice.entity.DashboardApplicationProjection;
import com.itjob.dashboardservice.entity.DashboardJobProjection;
import com.itjob.dashboardservice.entity.ProcessedEvent;
import com.itjob.dashboardservice.repository.DashboardApplicationProjectionRepository;
import com.itjob.dashboardservice.repository.DashboardJobProjectionRepository;
import com.itjob.dashboardservice.repository.ProcessedEventRepository;
import io.micrometer.core.instrument.MeterRegistry;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class DashboardReadModelService {

    private final DashboardJobProjectionRepository jobProjectionRepository;
    private final DashboardApplicationProjectionRepository applicationProjectionRepository;
    private final ProcessedEventRepository processedEventRepository;
    private final MeterRegistry meterRegistry;

    public boolean hasReadModelData() {
        return jobProjectionRepository.count() > 0 || applicationProjectionRepository.count() > 0;
    }

    public Map<String, Object> getJobStats(LocalDateTime startDate, LocalDateTime endDate) {
        Map<String, Object> stats = new HashMap<>();
        stats.put("total", countJobsInRange(startDate, endDate));
        stats.put("open", countJobsByStatusInRange("open", startDate, endDate));
        stats.put("pending", countJobsByStatusInRange("pending", startDate, endDate));
        stats.put("closed", countJobsByStatusInRange("closed", startDate, endDate));
        stats.put("rejected", countJobsByStatusInRange("rejected", startDate, endDate));
        stats.put("expired", countExpiredJobsInRange(LocalDateTime.now(), startDate, endDate));
        return stats;
    }

    public Map<String, Object> getApplicationStats(LocalDateTime startDate, LocalDateTime endDate) {
        Map<String, Object> stats = new HashMap<>();
        stats.put("total", countApplicationsInRange(startDate, endDate));
        stats.put("pending", countApplicationsByStatusInRange("pending", startDate, endDate));
        stats.put("accepted", countApplicationsByStatusInRange("accepted", startDate, endDate));
        stats.put("rejected", countApplicationsByStatusInRange("rejected", startDate, endDate));
        return stats;
    }

    @Transactional
    public boolean applyJobCreated(JsonNode payload, String topic) {
        String jobId = requiredText(payload, "jobId");
        return processEvent(payload, topic, jobId, () -> {
            LocalDateTime now = LocalDateTime.now();
            DashboardJobProjection projection = jobProjectionRepository.findById(jobId)
                    .orElseGet(() -> DashboardJobProjection.builder()
                            .jobId(jobId)
                            .postedAt(resolveDate(payload, "postedAt", "occurredAt", now))
                            .build());

            projection.setJobTitle(textOrNull(payload, "jobTitle"));
            projection.setRecruiterId(textOrNull(payload, "recruiterId"));
            projection.setStatus(normalizeJobStatus(textOrDefault(payload, "status", "pending")));
            projection.setPostedAt(resolveDate(payload, "postedAt", "occurredAt", projection.getPostedAt()));
            projection.setExpiredAt(dateOrNull(payload, "expiredAt"));
            projection.setUpdatedAt(resolveDate(payload, "occurredAt", now));
            jobProjectionRepository.save(projection);
        });
    }

    @Transactional
    public boolean applyJobStatusChanged(JsonNode payload, String topic) {
        String jobId = requiredText(payload, "jobId");
        return processEvent(payload, topic, jobId, () -> {
            LocalDateTime now = LocalDateTime.now();
            DashboardJobProjection projection = jobProjectionRepository.findById(jobId)
                    .orElseGet(() -> DashboardJobProjection.builder()
                            .jobId(jobId)
                            .postedAt(resolveDate(payload, "postedAt", "occurredAt", now))
                            .build());

            projection.setJobTitle(textOrNull(payload, "jobTitle"));
            projection.setRecruiterId(textOrNull(payload, "recruiterId"));
            projection.setStatus(normalizeJobStatus(textOrDefault(payload, "newStatus", textOrDefault(payload, "status", "pending"))));
            if (payload.hasNonNull("expiredAt")) {
                projection.setExpiredAt(dateOrNull(payload, "expiredAt"));
            }
            projection.setUpdatedAt(resolveDate(payload, "occurredAt", now));
            jobProjectionRepository.save(projection);
        });
    }

    @Transactional
    public boolean applyJobExpired(JsonNode payload, String topic) {
        String jobId = requiredText(payload, "jobId");
        return processEvent(payload, topic, jobId, () -> {
            LocalDateTime now = LocalDateTime.now();
            DashboardJobProjection projection = jobProjectionRepository.findById(jobId)
                    .orElseGet(() -> DashboardJobProjection.builder()
                            .jobId(jobId)
                            .postedAt(resolveDate(payload, "postedAt", "occurredAt", now))
                            .build());

            projection.setJobTitle(textOrNull(payload, "jobTitle"));
            projection.setRecruiterId(textOrNull(payload, "recruiterId"));
            projection.setStatus("closed");
            projection.setExpiredAt(resolveDate(payload, "expiredAt", "occurredAt", now));
            projection.setUpdatedAt(resolveDate(payload, "occurredAt", now));
            jobProjectionRepository.save(projection);
        });
    }

    @Transactional
    public boolean applyApplicationCreated(JsonNode payload, String topic) {
        String applicationId = requiredText(payload, "applicationId");
        return processEvent(payload, topic, applicationId, () -> {
            LocalDateTime now = LocalDateTime.now();
            DashboardApplicationProjection projection = applicationProjectionRepository.findById(applicationId)
                    .orElseGet(() -> DashboardApplicationProjection.builder()
                            .applicationId(applicationId)
                            .appliedAt(resolveDate(payload, "appliedAt", "occurredAt", now))
                            .build());

            projection.setJobId(textOrNull(payload, "jobId"));
            projection.setJobTitle(textOrNull(payload, "jobTitle"));
            projection.setCandidateId(textOrNull(payload, "candidateId"));
            projection.setCandidateName(textOrNull(payload, "candidateName"));
            projection.setRecruiterId(textOrNull(payload, "recruiterId"));
            projection.setStatus(textOrDefault(payload, "status", "pending").toLowerCase());
            projection.setAppliedAt(resolveDate(payload, "appliedAt", "occurredAt", projection.getAppliedAt()));
            projection.setUpdatedAt(resolveDate(payload, "occurredAt", now));
            applicationProjectionRepository.save(projection);
        });
    }

    @Transactional
    public boolean applyApplicationStatusChanged(JsonNode payload, String topic) {
        String applicationId = requiredText(payload, "applicationId");
        return processEvent(payload, topic, applicationId, () -> {
            LocalDateTime now = LocalDateTime.now();
            DashboardApplicationProjection projection = applicationProjectionRepository.findById(applicationId)
                    .orElseGet(() -> DashboardApplicationProjection.builder()
                            .applicationId(applicationId)
                            .appliedAt(resolveDate(payload, "appliedAt", "occurredAt", now))
                            .build());

            projection.setJobId(textOrNull(payload, "jobId"));
            projection.setJobTitle(textOrNull(payload, "jobTitle"));
            projection.setCandidateId(textOrNull(payload, "candidateId"));
            projection.setCandidateName(textOrNull(payload, "candidateName"));
            projection.setRecruiterId(textOrNull(payload, "recruiterId"));
            projection.setStatus(textOrDefault(payload, "newStatus", textOrDefault(payload, "status", "pending")).toLowerCase());
            projection.setUpdatedAt(resolveDate(payload, "occurredAt", now));
            applicationProjectionRepository.save(projection);
        });
    }

    private boolean processEvent(JsonNode payload, String topic, String aggregateId, Runnable handler) {
        String eventId = resolveEventId(payload, topic, aggregateId);
        String eventType = textOrDefault(payload, "eventType", topic);

        if (processedEventRepository.existsById(eventId)) {
            incrementEventMetric(topic, "duplicate");
            log.info("Skipping duplicate dashboard event: {}", eventId);
            return false;
        }

        try {
            processedEventRepository.save(ProcessedEvent.builder()
                    .eventId(eventId)
                    .eventType(eventType)
                    .aggregateId(aggregateId)
                    .processedAt(LocalDateTime.now())
                    .build());
            processedEventRepository.flush();
            handler.run();
            incrementEventMetric(topic, "processed");
            return true;
        } catch (DataIntegrityViolationException exception) {
            incrementEventMetric(topic, "duplicate");
            log.info("Skipping concurrently processed dashboard event: {}", eventId);
            return false;
        }
    }

    private void incrementEventMetric(String topic, String result) {
        meterRegistry.counter(
                "dashboard_read_model_events_total",
                "topic", topic,
                "result", result
        ).increment();
    }

    private String resolveEventId(JsonNode payload, String topic, String aggregateId) {
        String explicitEventId = textOrNull(payload, "eventId");
        if (explicitEventId == null) {
            explicitEventId = textOrNull(payload, "event_id");
        }
        if (explicitEventId != null && !explicitEventId.isBlank()) {
            return explicitEventId;
        }

        String version = textOrDefault(payload, "occurredAt",
                textOrDefault(payload, "occurred_at",
                        textOrDefault(payload, "updated_at",
                                textOrDefault(payload, "appliedAt",
                                        textOrDefault(payload, "postedAt", textOrDefault(payload, "status", "unknown"))))));
        return topic + ":" + aggregateId + ":" + version;
    }

    private long countJobsInRange(LocalDateTime startDate, LocalDateTime endDate) {
        if (startDate != null && endDate != null) {
            return jobProjectionRepository.countByPostedAtBetween(startDate, endDate);
        }
        if (startDate != null) {
            return jobProjectionRepository.countByPostedAtGreaterThanEqual(startDate);
        }
        if (endDate != null) {
            return jobProjectionRepository.countByPostedAtLessThanEqual(endDate);
        }
        return jobProjectionRepository.count();
    }

    private long countJobsByStatusInRange(String status, LocalDateTime startDate, LocalDateTime endDate) {
        if (startDate != null && endDate != null) {
            return jobProjectionRepository.countByStatusAndPostedAtBetween(status, startDate, endDate);
        }
        if (startDate != null) {
            return jobProjectionRepository.countByStatusAndPostedAtGreaterThanEqual(status, startDate);
        }
        if (endDate != null) {
            return jobProjectionRepository.countByStatusAndPostedAtLessThanEqual(status, endDate);
        }
        return jobProjectionRepository.countByStatus(status);
    }

    private long countExpiredJobsInRange(LocalDateTime now, LocalDateTime startDate, LocalDateTime endDate) {
        if (startDate != null && endDate != null) {
            return jobProjectionRepository.countByExpiredAtLessThanAndPostedAtBetween(now, startDate, endDate);
        }
        if (startDate != null) {
            return jobProjectionRepository.countByExpiredAtLessThanAndPostedAtGreaterThanEqual(now, startDate);
        }
        if (endDate != null) {
            return jobProjectionRepository.countByExpiredAtLessThanAndPostedAtLessThanEqual(now, endDate);
        }
        return jobProjectionRepository.countByExpiredAtLessThan(now);
    }

    private long countApplicationsInRange(LocalDateTime startDate, LocalDateTime endDate) {
        if (startDate != null && endDate != null) {
            return applicationProjectionRepository.countByAppliedAtBetween(startDate, endDate);
        }
        if (startDate != null) {
            return applicationProjectionRepository.countByAppliedAtGreaterThanEqual(startDate);
        }
        if (endDate != null) {
            return applicationProjectionRepository.countByAppliedAtLessThanEqual(endDate);
        }
        return applicationProjectionRepository.count();
    }

    private long countApplicationsByStatusInRange(String status, LocalDateTime startDate, LocalDateTime endDate) {
        if (startDate != null && endDate != null) {
            return applicationProjectionRepository.countByStatusAndAppliedAtBetween(status, startDate, endDate);
        }
        if (startDate != null) {
            return applicationProjectionRepository.countByStatusAndAppliedAtGreaterThanEqual(status, startDate);
        }
        if (endDate != null) {
            return applicationProjectionRepository.countByStatusAndAppliedAtLessThanEqual(status, endDate);
        }
        return applicationProjectionRepository.countByStatus(status);
    }

    private String normalizeJobStatus(String status) {
        if ("approved".equalsIgnoreCase(status)) {
            return "open";
        }
        return status.toLowerCase();
    }

    private String requiredText(JsonNode payload, String field) {
        String value = textOrNull(payload, field);
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException("Missing required field: " + field);
        }
        return value;
    }

    private String textOrNull(JsonNode payload, String field) {
        JsonNode value = payload.get(field);
        return value == null || value.isNull() ? null : value.asText();
    }

    private String textOrDefault(JsonNode payload, String field, String fallback) {
        String value = textOrNull(payload, field);
        return value == null || value.isBlank() ? fallback : value;
    }

    private LocalDateTime resolveDate(JsonNode payload, String primaryField, String fallbackField, LocalDateTime fallback) {
        LocalDateTime primary = dateOrNull(payload, primaryField);
        if (primary != null) {
            return primary;
        }

        LocalDateTime secondary = dateOrNull(payload, fallbackField);
        return secondary != null ? secondary : fallback;
    }

    private LocalDateTime resolveDate(JsonNode payload, String primaryField, LocalDateTime fallback) {
        LocalDateTime primary = dateOrNull(payload, primaryField);
        return primary != null ? primary : fallback;
    }

    private LocalDateTime dateOrNull(JsonNode payload, String field) {
        String value = textOrNull(payload, field);
        if (value == null || value.isBlank()) {
            return null;
        }

        try {
            return LocalDateTime.parse(value, DateTimeFormatter.ISO_DATE_TIME);
        } catch (Exception ignored) {
            return null;
        }
    }
}
