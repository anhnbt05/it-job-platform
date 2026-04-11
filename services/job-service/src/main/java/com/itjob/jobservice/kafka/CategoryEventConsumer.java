package com.itjob.jobservice.kafka;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.itjob.jobservice.entity.CategorySnapshot;
import com.itjob.jobservice.repository.CategorySnapshotRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
public class CategoryEventConsumer {

    private final CategorySnapshotRepository categorySnapshotRepository;
    private final ObjectMapper objectMapper;

    @KafkaListener(topics = "category-snapshot.created", groupId = "job-service-category-group")
    @Transactional
    public void handleCategoryCreated(String message) {
        log.info("Received event category-snapshot.created: {}", message);
        try {
            JsonNode payload = objectMapper.readTree(message);
            UUID id = UUID.fromString(payload.get("id").asText());
            String name = payload.get("name").asText();
            LocalDateTime updatedAt = parseDate(payload.get("updated_at").asText());

            CategorySnapshot snapshot = CategorySnapshot.builder()
                    .id(id)
                    .categoryName(name)
                    .updatedAt(updatedAt)
                    .build();

            categorySnapshotRepository.save(snapshot);
            log.info("Saved new category snapshot: {}", name);
        } catch (Exception e) {
            log.error("Error processing category-snapshot.created event: {}", e.getMessage(), e);
        }
    }

    @KafkaListener(topics = "category-snapshot.updated", groupId = "job-service-category-group")
    @Transactional
    public void handleCategoryUpdated(String message) {
        log.info("Received event category-snapshot.updated: {}", message);
        try {
            JsonNode payload = objectMapper.readTree(message);
            UUID id = UUID.fromString(payload.get("id").asText());
            String name = payload.get("name").asText();
            LocalDateTime updatedAt = parseDate(payload.get("updated_at").asText());

            categorySnapshotRepository.findById(id).ifPresentOrElse(snapshot -> {
                snapshot.setCategoryName(name);
                snapshot.setUpdatedAt(updatedAt);
                categorySnapshotRepository.save(snapshot);
                log.info("Updated category snapshot: {}", name);
            }, () -> {
                log.warn("Received update for unknown category snapshot ID: {}", id);
                CategorySnapshot snapshot = CategorySnapshot.builder()
                        .id(id)
                        .categoryName(name)
                        .updatedAt(updatedAt)
                        .build();
                categorySnapshotRepository.save(snapshot);
            });
        } catch (Exception e) {
            log.error("Error processing category-snapshot.updated event: {}", e.getMessage(), e);
        }
    }

    @KafkaListener(topics = "category-snapshot.deleted", groupId = "job-service-category-group")
    @Transactional
    public void handleCategoryDeleted(String message) {
        log.info("Received event category-snapshot.deleted: {}", message);
        try {
            JsonNode payload = objectMapper.readTree(message);
            UUID id = UUID.fromString(payload.get("id").asText());

            categorySnapshotRepository.findById(id).ifPresent(snapshot -> {
                categorySnapshotRepository.delete(snapshot);
                log.info("Deleted category snapshot ID: {}", id);
            });
        } catch (Exception e) {
            log.error("Error processing category-snapshot.deleted event: {}", e.getMessage(), e);
        }
    }

    private LocalDateTime parseDate(String dateStr) {
        try {
            return LocalDateTime.parse(dateStr, DateTimeFormatter.ISO_DATE_TIME);
        } catch (Exception e) {
            return LocalDateTime.now();
        }
    }
}
