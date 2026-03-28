package com.itjob.applicationservice.dto.response;

import com.itjob.applicationservice.enums.ApplicationStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class ApplicationResponse {
    private String id;
    private String jobId;
    private String jobTitle;
    private String candidateId;
    private String candidateName;
    private String recruiterId;
    private String resumeUrl;
    private ApplicationStatus status;
    private LocalDateTime appliedAt;
}
