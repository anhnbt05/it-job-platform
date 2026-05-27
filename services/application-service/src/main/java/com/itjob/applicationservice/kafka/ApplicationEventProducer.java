package com.itjob.applicationservice.kafka;

import com.itjob.applicationservice.outbox.ApplicationOutboxService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class ApplicationEventProducer {

    private final ApplicationOutboxService outboxService;

    public static final String TOPIC_APPLICATION_CREATED = "application-created";
    public static final String TOPIC_APPLICATION_STATUS_CHANGED = "application-status-changed";
    public static final String TOPIC_JOB_CLOSED = "job-closed-by-vacancy";
    public static final String TOPIC_NOTIFICATION_CREATE = "notification.create";

    public void sendApplicationCreated(Map<String, Object> event) {
        log.info("Enqueue event application-created: {}", event);
        outboxService.enqueue(TOPIC_APPLICATION_CREATED, event);
    }

    public void sendApplicationStatusChanged(Map<String, Object> event) {
        log.info("Enqueue event application-status-changed: {}", event);
        outboxService.enqueue(TOPIC_APPLICATION_STATUS_CHANGED, event);
    }

    public void sendJobClosedByVacancy(Map<String, Object> event) {
        log.info("Enqueue event job-closed-by-vacancy: {}", event);
        outboxService.enqueue(TOPIC_JOB_CLOSED, event);
    }

    public void sendNotificationCreated(Map<String, Object> event) {
        log.info("Enqueue event notification.create: {}", event);
        outboxService.enqueue(TOPIC_NOTIFICATION_CREATE, event);
    }
}
