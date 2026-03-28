package com.itjob.applicationservice.kafka;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class ApplicationEventProducer {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    public static final String TOPIC_APPLICATION_CREATED = "application-created";
    public static final String TOPIC_APPLICATION_STATUS_CHANGED = "application-status-changed";
    public static final String TOPIC_JOB_CLOSED = "job-closed-by-vacancy";

    public void sendApplicationCreated(Map<String, Object> event) {
        log.info("Gửi event application-created: {}", event);
        kafkaTemplate.send(TOPIC_APPLICATION_CREATED, event);
    }

    public void sendApplicationStatusChanged(Map<String, Object> event) {
        log.info("Gửi event application-status-changed: {}", event);
        kafkaTemplate.send(TOPIC_APPLICATION_STATUS_CHANGED, event);
    }

    public void sendJobClosedByVacancy(Map<String, Object> event) {
        log.info("Gửi event job-closed-by-vacancy: {}", event);
        kafkaTemplate.send(TOPIC_JOB_CLOSED, event);
    }
}
