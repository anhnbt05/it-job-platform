package com.itjob.dashboardservice.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "dashboard_application_projections")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardApplicationProjection {

    @Id
    @Column(name = "application_id", nullable = false, updatable = false)
    private String applicationId;

    @Column(name = "job_id")
    private String jobId;

    @Column(name = "job_title")
    private String jobTitle;

    @Column(name = "candidate_id")
    private String candidateId;

    @Column(name = "candidate_name")
    private String candidateName;

    @Column(name = "recruiter_id")
    private String recruiterId;

    @Column(nullable = false)
    private String status;

    @Column(name = "applied_at", nullable = false)
    private LocalDateTime appliedAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
