package com.itjob.applicationservice.document;

import com.itjob.applicationservice.enums.ApplicationStatus;
import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "applications")
@CompoundIndex(name = "candidate_job_idx", def = "{'candidateId': 1, 'jobId': 1}", unique = true)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Application {

    @Id
    private String id;

    private String candidateId;
    private String candidateName;

    private String jobId;
    private String jobTitle;

    private String recruiterId;

    private String resumeUrl;

    @Builder.Default
    private ApplicationStatus status = ApplicationStatus.pending;

    @Builder.Default
    private LocalDateTime appliedAt = LocalDateTime.now();

    private LocalDateTime deletedAt;
}
