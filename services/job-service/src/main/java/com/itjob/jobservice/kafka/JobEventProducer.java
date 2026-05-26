package com.itjob.jobservice.kafka;

import com.itjob.jobservice.outbox.JobOutboxService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class JobEventProducer {

    private final JobOutboxService outboxService;

    public static final String TOPIC_JOB_CREATED = "job-created";
    public static final String TOPIC_JOB_STATUS_CHANGED = "job-status-changed";
    public static final String TOPIC_JOB_EXPIRED = "job-expired";
    public static final String TOPIC_JOB_EXPIRING_SOON = "job-expiring-soon";
    public static final String TOPIC_NEW_APPLICATION_NOTIFY = "new-application-notify";

    public void sendJobCreated(Map<String, Object> event) {
        log.info("Enqueue event job-created: {}", event);
        outboxService.enqueue(TOPIC_JOB_CREATED, event);
    }

    public void sendJobStatusChanged(Map<String, Object> event) {
        log.info("Enqueue event job-status-changed: {}", event);
        outboxService.enqueue(TOPIC_JOB_STATUS_CHANGED, event);
    }

    public void sendJobExpired(Map<String, Object> event) {
        log.info("Enqueue event job-expired: {}", event);
        outboxService.enqueue(TOPIC_JOB_EXPIRED, event);
    }

    public void sendJobExpiringSoon(Map<String, Object> event) {
        log.info("Enqueue event job-expiring-soon: {}", event);
        outboxService.enqueue(TOPIC_JOB_EXPIRING_SOON, event);
    }
}
