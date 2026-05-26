package com.itjob.applicationservice.outbox;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "outbox_events")
@CompoundIndex(name = "idx_application_outbox_status_next_attempt", def = "{'status': 1, 'nextAttemptAt': 1}")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OutboxEvent {

    @Id
    private String eventId;

    private String eventType;
    private String aggregateId;
    private String topic;
    private String payload;
    private OutboxEventStatus status;
    private int attempts;
    private String lastError;
    private LocalDateTime createdAt;
    private LocalDateTime nextAttemptAt;
    private LocalDateTime publishedAt;
}
