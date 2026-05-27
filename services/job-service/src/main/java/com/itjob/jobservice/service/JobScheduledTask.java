package com.itjob.jobservice.service;

import com.itjob.jobservice.entity.Job;
import com.itjob.jobservice.enums.JobStatus;
import com.itjob.jobservice.kafka.JobEventProducer;
import com.itjob.jobservice.repository.JobRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
public class JobScheduledTask {

    private static final String RECRUITER_JOB_EXPIRING_SOON = "recruiter_job_expiring_soon";
    private static final String RECRUITER_JOB_EXPIRED = "recruiter_job_expired";

    private final JobRepository jobRepository;
    private final JobEventProducer jobEventProducer;

    /**
     * Chạy lúc 0h mỗi ngày: kiểm tra jobs hết hạn hoặc sắp hết hạn
     */
    @Scheduled(cron = "0 0 0 * * *")
    public void checkExpiredJobs() {
        log.info("Đang kiểm tra các công việc đã hết hạn hoặc sắp hết hạn...");

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime soonDate = now.plusDays(2);

        // Jobs sắp hết hạn (còn 2 ngày)
        List<Job> expiringSoon = jobRepository.findExpiringSoonJobs(now, soonDate);
        for (Job job : expiringSoon) {
            log.info("Công việc sắp hết hạn: '{}' (ID: {})", job.getTitle(), job.getId());

            Map<String, Object> event = new HashMap<>();
            event.put("eventId", UUID.randomUUID().toString());
            event.put("eventType", "JobExpiringSoon");
            event.put("occurredAt", LocalDateTime.now().toString());
            event.put("jobId", job.getId().toString());
            event.put("jobTitle", job.getTitle());
            event.put("recruiterId", job.getRecruiterId().toString());
            event.put("status", job.getStatus().name().toLowerCase());
            event.put("postedAt", job.getPostedAt().toString());
            event.put("expiredAt", job.getExpiredAt().toString());
            jobEventProducer.sendJobExpiringSoon(event);
            jobEventProducer.sendNotificationCreated(createUserNotificationEvent(
                    "notification:job-expiring-soon:" + job.getId() + ":" + job.getExpiredAt().toLocalDate(),
                    RECRUITER_JOB_EXPIRING_SOON,
                    "Tin tuyển dụng của bạn sắp hết hạn",
                    job.getRecruiterId().toString(),
                    metadataOf(
                            "jobId", job.getId().toString(),
                            "jobTitle", job.getTitle(),
                            "jobExpiredAt", job.getExpiredAt().toString(),
                            "status", job.getStatus().name().toLowerCase()
                    )
            ));
        }

        // Jobs đã hết hạn
        List<Job> expired = jobRepository.findExpiredJobs(now);
        for (Job job : expired) {
            log.info("Công việc đã hết hạn: '{}' (ID: {}), cập nhật trạng thái...", job.getTitle(), job.getId());

            String oldStatus = job.getStatus().name().toLowerCase();
            job.setStatus(JobStatus.closed);
            jobRepository.save(job);

            Map<String, Object> event = new HashMap<>();
            event.put("eventId", UUID.randomUUID().toString());
            event.put("eventType", "JobExpired");
            event.put("occurredAt", LocalDateTime.now().toString());
            event.put("jobId", job.getId().toString());
            event.put("jobTitle", job.getTitle());
            event.put("recruiterId", job.getRecruiterId().toString());
            event.put("oldStatus", oldStatus);
            event.put("status", "closed");
            event.put("newStatus", "closed");
            event.put("postedAt", job.getPostedAt().toString());
            event.put("expiredAt", job.getExpiredAt().toString());
            jobEventProducer.sendJobExpired(event);
            jobEventProducer.sendNotificationCreated(createUserNotificationEvent(
                    "notification:job-expired:" + job.getId(),
                    RECRUITER_JOB_EXPIRED,
                    "Tin tuyển dụng của bạn đã hết hạn",
                    job.getRecruiterId().toString(),
                    metadataOf(
                            "jobId", job.getId().toString(),
                            "jobTitle", job.getTitle(),
                            "jobExpiredAt", job.getExpiredAt().toString(),
                            "oldStatus", oldStatus,
                            "newStatus", "closed"
                    )
            ));
        }

        log.info("Hoàn tất kiểm tra. Sắp hết hạn: {}, Đã hết hạn: {}", expiringSoon.size(), expired.size());
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
