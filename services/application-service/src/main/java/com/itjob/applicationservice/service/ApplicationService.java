package com.itjob.applicationservice.service;

import com.itjob.applicationservice.document.Application;
import com.itjob.applicationservice.dto.request.CreateApplicationRequest;
import com.itjob.applicationservice.dto.request.ProcessApplicationsRequest;
import com.itjob.applicationservice.dto.response.ApplicationResponse;
import com.itjob.applicationservice.dto.response.ApplicationSummaryResponse;
import com.itjob.applicationservice.enums.ApplicationStatus;
import com.itjob.applicationservice.exception.BadRequestException;
import com.itjob.applicationservice.exception.ForbiddenException;
import com.itjob.applicationservice.exception.ResourceNotFoundException;
import com.itjob.applicationservice.kafka.ApplicationEventProducer;
import com.itjob.applicationservice.repository.ApplicationRepository;
import io.micrometer.core.instrument.MeterRegistry;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ApplicationService {

    private static final String RECRUITER_NEW_APPLICATION = "recruiter_new_application";
    private static final String CANDIDATE_APPLICATION_APPROVED = "candidate_application_approved";
    private static final String CANDIDATE_APPLICATION_REJECTED = "candidate_application_rejected";
    private static final String CANDIDATE_JOB_CLOSED = "candidate_job_closed";

    private final ApplicationRepository applicationRepository;
    private final ApplicationEventProducer eventProducer;
    private final MeterRegistry meterRegistry;

    /**
     * Lấy danh sách đơn ứng tuyển của candidate
     */
    public List<ApplicationResponse> getApplications(String candidateId) {
        return applicationRepository.findByCandidateIdAndDeletedAtIsNull(candidateId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Lấy chi tiết đơn ứng tuyển
     */
    public ApplicationResponse getApplication(String applicationId, String candidateId) {
        Application app = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy đơn ứng tuyển có id '" + applicationId + "'."));

        if (app.getDeletedAt() != null) {
            throw new ResourceNotFoundException("Đơn ứng tuyển đã bị xóa.");
        }

        if (!app.getCandidateId().equals(candidateId)) {
            throw new ForbiddenException("Bạn chỉ có thể xem đơn ứng tuyển của chính mình.");
        }

        return mapToResponse(app);
    }

    /**
     * Tạo đơn ứng tuyển mới
     */
    public ApplicationResponse createApplication(CreateApplicationRequest request,
                                                   String candidateId,
                                                   String candidateName,
                                                   String jobTitle,
                                                   String recruiterId) {
    
        Optional<Application> existing = applicationRepository
                .findByCandidateIdAndJobId(candidateId, request.getJobId());

        Application app;
        if (existing.isPresent()) {
            app = existing.get();
            if (app.getDeletedAt() == null && app.getStatus() == ApplicationStatus.pending) {
                throw new BadRequestException("Bạn đã ứng tuyển công việc này rồi.");
            }
            app.setStatus(ApplicationStatus.pending);
            app.setDeletedAt(null);
            app.setAppliedAt(LocalDateTime.now());
            if (request.getResumeUrl() != null) {
                app.setResumeUrl(request.getResumeUrl());
            }
        } else {
            app = Application.builder()
                    .candidateId(candidateId)
                    .candidateName(candidateName)
                    .jobId(request.getJobId())
                    .jobTitle(jobTitle)
                    .recruiterId(recruiterId)
                    .resumeUrl(request.getResumeUrl())
                    .status(ApplicationStatus.pending)
                    .appliedAt(LocalDateTime.now())
                    .build();
        }

        app = applicationRepository.save(app);

        Map<String, Object> event = new HashMap<>();
        event.put("eventId", UUID.randomUUID().toString());
        event.put("eventType", "ApplicationCreated");
        event.put("occurredAt", LocalDateTime.now().toString());
        event.put("applicationId", app.getId());
        event.put("jobId", app.getJobId());
        event.put("jobTitle", app.getJobTitle());
        event.put("candidateId", candidateId);
        event.put("candidateName", candidateName);
        event.put("recruiterId", recruiterId);
        event.put("status", "pending");
        event.put("newStatus", "pending");
        event.put("appliedAt", app.getAppliedAt().toString());
        eventProducer.sendApplicationCreated(event);
        Map<String, Object> applicationCreatedMetadata = metadataOf(
                "applicationId", app.getId(),
                "jobId", app.getJobId(),
                "jobTitle", app.getJobTitle(),
                "candidateId", candidateId,
                "candidateName", candidateName,
                "recruiterId", recruiterId
        );
        eventProducer.sendNotificationCreated(createUserNotificationEvent(
                RECRUITER_NEW_APPLICATION,
                "Có ứng viên mới ứng tuyển bài đăng của bạn",
                recruiterId,
                applicationCreatedMetadata
        ));
        incrementApplicationMetric("create", "pending");

        return mapToResponse(app);
    }

    /**
     * Xóa mềm đơn ứng tuyển
     */
    public void deleteApplication(String applicationId, String candidateId) {
        Application app = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy đơn ứng tuyển có id '" + applicationId + "'."));

        if (!app.getCandidateId().equals(candidateId)) {
            throw new ForbiddenException("Bạn chỉ có thể xóa đơn ứng tuyển của chính mình.");
        }

        app.setDeletedAt(LocalDateTime.now());
        applicationRepository.save(app);
        incrementApplicationMetric("delete", "deleted");
    }

    /**
     * Recruiter xử lý đơn ứng tuyển (approve/reject)
     */
    public void processApplications(ProcessApplicationsRequest request, String recruiterId) {
        if (request.getAcceptedApplicationIds() == null && request.getRejectedApplications() == null) {
            throw new BadRequestException("Bạn phải cung cấp thông tin về các đơn ứng tuyển cần xử lý.");
        }

        // Accept
        if (request.getAcceptedApplicationIds() != null) {
            for (String appId : request.getAcceptedApplicationIds()) {
                Application app = verifyApplication(appId, recruiterId);
                String oldStatus = app.getStatus().name().toLowerCase();
                app.setStatus(ApplicationStatus.accepted);
                applicationRepository.save(app);

                Map<String, Object> event = new HashMap<>();
                event.put("eventId", UUID.randomUUID().toString());
                event.put("eventType", "ApplicationStatusChanged");
                event.put("occurredAt", LocalDateTime.now().toString());
                event.put("applicationId", app.getId());
                event.put("jobId", app.getJobId());
                event.put("jobTitle", app.getJobTitle());
                event.put("candidateId", app.getCandidateId());
                event.put("candidateName", app.getCandidateName());
                event.put("oldStatus", oldStatus);
                event.put("status", "accepted");
                event.put("newStatus", "accepted");
                event.put("recruiterId", recruiterId);
                event.put("appliedAt", app.getAppliedAt().toString());
                eventProducer.sendApplicationStatusChanged(event);
                eventProducer.sendNotificationCreated(createUserNotificationEvent(
                        CANDIDATE_APPLICATION_APPROVED,
                        "Đơn ứng tuyển của bạn đã được chấp nhận",
                        app.getCandidateId(),
                        metadataOf(
                                "applicationId", app.getId(),
                                "jobId", app.getJobId(),
                                "jobTitle", app.getJobTitle(),
                                "candidateName", app.getCandidateName(),
                                "recruiterId", recruiterId,
                                "oldStatus", oldStatus,
                                "newStatus", "accepted"
                        )
                ));
                incrementApplicationMetric("process", "accepted");
            }
        }

        // Reject
        if (request.getRejectedApplications() != null) {
            for (ProcessApplicationsRequest.RejectedApplication ra : request.getRejectedApplications()) {
                Application app = verifyApplication(ra.getApplicationId(), recruiterId);
                String oldStatus = app.getStatus().name().toLowerCase();
                app.setStatus(ApplicationStatus.rejected);
                applicationRepository.save(app);

                Map<String, Object> event = new HashMap<>();
                event.put("eventId", UUID.randomUUID().toString());
                event.put("eventType", "ApplicationStatusChanged");
                event.put("occurredAt", LocalDateTime.now().toString());
                event.put("applicationId", app.getId());
                event.put("jobId", app.getJobId());
                event.put("jobTitle", app.getJobTitle());
                event.put("candidateId", app.getCandidateId());
                event.put("candidateName", app.getCandidateName());
                event.put("oldStatus", oldStatus);
                event.put("status", "rejected");
                event.put("newStatus", "rejected");
                event.put("reason", ra.getReason() != null ? ra.getReason() : "");
                event.put("recruiterId", recruiterId);
                event.put("appliedAt", app.getAppliedAt().toString());
                eventProducer.sendApplicationStatusChanged(event);
                Map<String, Object> metadata = new HashMap<>();
                metadata.put("applicationId", app.getId());
                metadata.put("jobId", app.getJobId());
                metadata.put("jobTitle", app.getJobTitle());
                metadata.put("candidateName", app.getCandidateName());
                metadata.put("recruiterId", recruiterId);
                metadata.put("oldStatus", oldStatus);
                metadata.put("newStatus", "rejected");
                metadata.put("reason", ra.getReason() != null ? ra.getReason() : "");
                eventProducer.sendNotificationCreated(createUserNotificationEvent(
                        CANDIDATE_APPLICATION_REJECTED,
                        "Đơn ứng tuyển của bạn đã bị từ chối",
                        app.getCandidateId(),
                        metadata
                ));
                incrementApplicationMetric("process", "rejected");
            }
        }
    }

    /**
     * Lấy danh sách đơn ứng tuyển theo jobId (internal API cho Job Service)
     */
    public List<ApplicationResponse> getApplicationsByJobId(String jobId) {
        return applicationRepository.findByJobIdAndDeletedAtIsNull(jobId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public void notifyCandidatesJobClosed(Map<String, Object> jobEvent) {
        String jobId = String.valueOf(jobEvent.getOrDefault("jobId", ""));
        if (jobId.isBlank()) {
            log.warn("Skip candidate job closed notifications because jobId is missing: {}", jobEvent);
            return;
        }

        String sourceEventId = String.valueOf(jobEvent.getOrDefault("eventId", jobId));
        String jobTitle = String.valueOf(jobEvent.getOrDefault("jobTitle", "không rõ"));
        String newStatus = String.valueOf(jobEvent.getOrDefault("newStatus", jobEvent.getOrDefault("status", "")));

        if (!"closed".equalsIgnoreCase(newStatus) && !"JobExpired".equals(String.valueOf(jobEvent.get("eventType")))) {
            return;
        }

        List<Application> applications = applicationRepository.findByJobIdAndDeletedAtIsNull(jobId).stream()
                .filter(app -> app.getStatus() != ApplicationStatus.rejected)
                .collect(Collectors.toList());

        for (Application app : applications) {
            eventProducer.sendNotificationCreated(createUserNotificationEvent(
                    "notification:candidate-job-closed:" + sourceEventId + ":" + app.getId(),
                    CANDIDATE_JOB_CLOSED,
                    "Công việc bạn đã ứng tuyển hiện không còn hoạt động",
                    app.getCandidateId(),
                    metadataOf(
                            "applicationId", app.getId(),
                            "jobId", jobId,
                            "jobTitle", jobTitle,
                            "candidateName", app.getCandidateName(),
                            "recruiterId", app.getRecruiterId(),
                            "oldStatus", jobEvent.get("oldStatus"),
                            "newStatus", "closed"
                    )
            ));
        }
    }

    /**
     * Thống kê đơn ứng tuyển (cho Dashboard Service)
     */
    public ApplicationSummaryResponse getSummary(LocalDateTime startDate, LocalDateTime endDate) {
        long total, pending, accepted, rejected;

        if (startDate != null && endDate != null) {
            total = applicationRepository.countByAppliedAtBetween(startDate, endDate);
            pending = applicationRepository.countByStatusAndAppliedAtBetween(ApplicationStatus.pending, startDate, endDate);
            accepted = applicationRepository.countByStatusAndAppliedAtBetween(ApplicationStatus.accepted, startDate, endDate);
            rejected = applicationRepository.countByStatusAndAppliedAtBetween(ApplicationStatus.rejected, startDate, endDate);
        } else {
            total = applicationRepository.count();
            pending = applicationRepository.countByStatus(ApplicationStatus.pending);
            accepted = applicationRepository.countByStatus(ApplicationStatus.accepted);
            rejected = applicationRepository.countByStatus(ApplicationStatus.rejected);
        }

        return ApplicationSummaryResponse.builder()
                .total(total)
                .pending(pending)
                .accepted(accepted)
                .rejected(rejected)
                .build();
    }

    // ========== Helper methods ==========

    private Application verifyApplication(String applicationId, String recruiterId) {
        Application app = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Đơn ứng tuyển có id '" + applicationId + "' không tìm thấy."));

        if (!app.getRecruiterId().equals(recruiterId)) {
            throw new ForbiddenException("Đơn ứng tuyển này không thuộc công việc của bạn.");
        }

        return app;
    }

    private ApplicationResponse mapToResponse(Application app) {
        return ApplicationResponse.builder()
                .id(app.getId())
                .jobId(app.getJobId())
                .jobTitle(app.getJobTitle())
                .candidateId(app.getCandidateId())
                .candidateName(app.getCandidateName())
                .recruiterId(app.getRecruiterId())
                .resumeUrl(app.getResumeUrl())
                .status(app.getStatus())
                .appliedAt(app.getAppliedAt())
                .build();
    }

    private void incrementApplicationMetric(String action, String outcome) {
        meterRegistry.counter(
                "application_events_total",
                "action", action,
                "outcome", outcome
        ).increment();
    }

    private Map<String, Object> createUserNotificationEvent(
            String type,
            String title,
            String userId,
            Map<String, Object> metadata
    ) {
        return createUserNotificationEvent(UUID.randomUUID().toString(), type, title, userId, metadata);
    }

    private Map<String, Object> createUserNotificationEvent(
            String eventId,
            String type,
            String title,
            String userId,
            Map<String, Object> metadata
    ) {
        Map<String, Object> event = new HashMap<>();
        event.put("eventId", eventId);
        event.put("eventType", "NotificationCreated");
        event.put("occurredAt", LocalDateTime.now().toString());
        event.put("type", type);
        event.put("title", title);
        event.put("userId", userId);
        event.put("metadata", metadata);
        return event;
    }

    private Map<String, Object> metadataOf(Object... entries) {
        Map<String, Object> metadata = new HashMap<>();
        for (int i = 0; i + 1 < entries.length; i += 2) {
            metadata.put(String.valueOf(entries[i]), entries[i + 1]);
        }
        return metadata;
    }
}
