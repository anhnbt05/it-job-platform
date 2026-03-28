package com.itjob.jobservice.kafka;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class JobEventProducer {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    public static final String TOPIC_JOB_CREATED = "job-created";
    public static final String TOPIC_JOB_STATUS_CHANGED = "job-status-changed";
    public static final String TOPIC_JOB_EXPIRED = "job-expired";
    public static final String TOPIC_JOB_EXPIRING_SOON = "job-expiring-soon";
    public static final String TOPIC_NEW_APPLICATION_NOTIFY = "new-application-notify";

    public void sendJobCreated(Map<String, Object> event) {
        log.info("Gửi event job-created: {}", event);
        kafkaTemplate.send(TOPIC_JOB_CREATED, event);
    }

    public void sendJobStatusChanged(Map<String, Object> event) {
        log.info("Gửi event job-status-changed: {}", event);
        kafkaTemplate.send(TOPIC_JOB_STATUS_CHANGED, event);
    }

    public void sendJobExpired(Map<String, Object> event) {
        log.info("Gửi event job-expired: {}", event);
        kafkaTemplate.send(TOPIC_JOB_EXPIRED, event);
    }

    public void sendJobExpiringSoon(Map<String, Object> event) {
        log.info("Gửi event job-expiring-soon: {}", event);
        kafkaTemplate.send(TOPIC_JOB_EXPIRING_SOON, event);
    }
}
