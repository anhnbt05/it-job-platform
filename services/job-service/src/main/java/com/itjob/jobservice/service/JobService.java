package com.itjob.jobservice.service;

import com.itjob.jobservice.client.CreateOrganizationCategoryRequest;
import com.itjob.jobservice.client.OrganizationCategoryClient;
import com.itjob.jobservice.client.OrganizationCategoryResponse;
import com.itjob.jobservice.dto.request.*;
import com.itjob.jobservice.dto.response.JobDetailResponse;
import com.itjob.jobservice.dto.response.JobResponse;
import com.itjob.jobservice.dto.response.JobSummaryResponse;
import com.itjob.jobservice.entity.*;
import com.itjob.jobservice.enums.JobStatus;
import com.itjob.jobservice.enums.Level;
import com.itjob.jobservice.exception.BadRequestException;
import com.itjob.jobservice.exception.ForbiddenException;
import com.itjob.jobservice.exception.ResourceNotFoundException;
import com.itjob.jobservice.kafka.JobEventProducer;
import com.itjob.jobservice.repository.*;
import feign.FeignException;
import io.micrometer.core.instrument.MeterRegistry;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class JobService {

    private static final String ADMIN_NEW_JOB_POST = "admin_new_job_post";
    private static final String RECRUITER_JOB_APPROVED = "recruiter_job_approved";
    private static final String RECRUITER_JOB_REJECTED = "recruiter_job_rejected";
    private static final String ROLE_ADMIN = "admin";

    private final JobRepository jobRepository;
    private final JobDescriptionRepository jobDescriptionRepository;
    private final JobRequirementRepository jobRequirementRepository;
    private final JobBenefitRepository jobBenefitRepository;
    private final CategorySnapshotRepository categorySnapshotRepository;
    private final JobCategoryRepository jobCategoryRepository;
    private final OrganizationCategoryClient organizationCategoryClient;
    private final JobEventProducer jobEventProducer;
    private final MeterRegistry meterRegistry;

    /**
     * Lấy danh sách jobs theo role
     */
    public List<JobResponse> getJobs(String userId, String role, SearchJobQuery searchQuery) {
        List<Job> jobs;

        switch (role.toLowerCase()) {
            case "recruiter":
                UUID recruiterId = UUID.fromString(userId);
                jobs = jobRepository.findByRecruiterIdAndDeletedAtIsNull(recruiterId);
                break;
            case "admin":
                jobs = jobRepository.findByStatusAndDeletedAtIsNull(JobStatus.pending);
                break;
            default: // candidate
                jobs = jobRepository.findByStatusAndDeletedAtIsNull(JobStatus.open);
                break;
        }

        List<JobResponse> responses = jobs.stream()
                .map(this::mapToJobResponse)
                .collect(Collectors.toList());

        // Filter by category names
        if (searchQuery != null && searchQuery.getCategoryNames() != null && !searchQuery.getCategoryNames().isEmpty()) {
            responses = responses.stream()
                    .filter(job -> job.getCategories().stream()
                            .anyMatch(searchQuery.getCategoryNames()::contains))
                    .collect(Collectors.toList());
        }

        return responses;
    }

    /**
     * Lấy chi tiết job
     */
    public JobDetailResponse getJob(String jobId, String userId, String role) {
        UUID id = UUID.fromString(jobId);
        Job job = jobRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy công việc có id '" + jobId + "'"));

        if ("recruiter".equalsIgnoreCase(role) && !job.getRecruiterId().toString().equals(userId)) {
            throw new ForbiddenException("Công việc này không phải do bạn đăng.");
        }

        if ("candidate".equalsIgnoreCase(role)) {
            if (job.getStatus() == JobStatus.closed || job.getStatus() == JobStatus.rejected) {
                throw new BadRequestException("Công việc '" + job.getTitle() + "' đã được đóng.");
            }
            if (job.getStatus() == JobStatus.pending) {
                throw new BadRequestException("Công việc '" + job.getTitle() + "' đang chờ duyệt. Vui lòng quay lại sau.");
            }
        }

        return mapToJobDetailResponse(job);
    }

    /**
     * Tạo job mới (recruiter)
     */
    @Transactional
    public JobDetailResponse createJob(CreateJobRequest request, String recruiterId) {
        UUID recId = UUID.fromString(recruiterId);

        // Check duplicate
        List<Job> duplicates = jobRepository.findDuplicateJob(recId, request.getTitle());
        if (!duplicates.isEmpty()) {
            throw new BadRequestException("Bạn đã đăng công việc có tiêu đề '" + request.getTitle() + "' rồi.");
        }

        // Parse expired date
        LocalDateTime expiredAt = parseDateTime(request.getExpiredDate());
        if (expiredAt.isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Thời gian hết hạn phải lớn hơn thời gian hiện tại.");
        }

        // Create Job
        Job job = Job.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .address(request.getAddress())
                .salary(request.getSalary())
                .vacancies(request.getVacancies())
                .type(request.getType())
                .workingTimes(request.getWorkingTimes())
                .expiredAt(expiredAt)
                .level(request.getLevel())
                .recruiterId(recId)
                .status(JobStatus.pending)
                .postedAt(LocalDateTime.now())
                .build();

        job = jobRepository.save(job);

        // Save descriptions
        final Job savedJob = job;
        List<JobDescription> descriptions = request.getDescriptions().stream()
                .map(desc -> JobDescription.builder().description(desc).job(savedJob).build())
                .collect(Collectors.toList());
        jobDescriptionRepository.saveAll(descriptions);

        // Save requirements
        List<JobRequirement> requirements = request.getRequirements().stream()
                .map(req -> JobRequirement.builder().requirement(req).job(savedJob).build())
                .collect(Collectors.toList());
        jobRequirementRepository.saveAll(requirements);

        // Save benefits
        List<JobBenefit> benefits = request.getBenefits().stream()
                .map(ben -> JobBenefit.builder().benefit(ben).job(savedJob).build())
                .collect(Collectors.toList());
        jobBenefitRepository.saveAll(benefits);

        // Save categories
        saveJobCategories(savedJob, request.getCategories());

        // Send Kafka event
        Map<String, Object> event = new HashMap<>();
        event.put("eventId", UUID.randomUUID().toString());
        event.put("eventType", "JobCreated");
        event.put("occurredAt", LocalDateTime.now().toString());
        event.put("jobId", savedJob.getId().toString());
        event.put("jobTitle", savedJob.getTitle());
        event.put("recruiterId", recruiterId);
        event.put("status", "pending");
        event.put("newStatus", "pending");
        event.put("postedAt", savedJob.getPostedAt().toString());
        event.put("expiredAt", savedJob.getExpiredAt().toString());
        jobEventProducer.sendJobCreated(event);
        jobEventProducer.sendNotificationCreated(createRoleNotificationEvent(
                ADMIN_NEW_JOB_POST,
                "Nhà tuyển dụng vừa đăng tin mới",
                ROLE_ADMIN,
                metadataOf(
                        "jobId", savedJob.getId().toString(),
                        "jobTitle", savedJob.getTitle(),
                        "recruiterId", recruiterId
                )
        ));
        incrementMutationMetric("create", "pending");

        return mapToJobDetailResponse(savedJob);
    }

    /**
     * Cập nhật job (recruiter, chỉ khi pending hoặc rejected)
     */
    @Transactional
    public JobDetailResponse updateJob(String jobId, UpdateJobRequest request) {
        UUID id = UUID.fromString(jobId);
        Job job = jobRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy công việc có id '" + jobId + "'."));

        if (job.getStatus() == JobStatus.open || job.getStatus() == JobStatus.closed) {
            throw new BadRequestException("Bạn không thể cập nhật công việc đang " +
                    (job.getStatus() == JobStatus.open ? "mở" : "đóng") + ".");
        }

        // Update basic fields
        if (request.getTitle() != null) job.setTitle(request.getTitle());
        if (request.getDescription() != null) job.setDescription(request.getDescription());
        if (request.getAddress() != null) job.setAddress(request.getAddress());
        if (request.getSalary() != null) job.setSalary(request.getSalary());
        if (request.getVacancies() != null) job.setVacancies(request.getVacancies());
        if (request.getType() != null) job.setType(request.getType());
        if (request.getWorkingTimes() != null) job.setWorkingTimes(request.getWorkingTimes());
        if (request.getLevel() != null) job.setLevel(request.getLevel());

        if (request.getExpiredDate() != null) {
            LocalDateTime newExpiry = parseDateTime(request.getExpiredDate());
            if (newExpiry.isBefore(LocalDateTime.now())) {
                throw new BadRequestException("Thời gian hết hạn mới phải lớn hơn thời gian hiện tại.");
            }
            job.setExpiredAt(newExpiry);
        }

        // Sync descriptions
        if (request.getDescriptions() != null && !request.getDescriptions().isEmpty()) {
            syncJobDescriptions(job, request.getDescriptions());
        }

        // Sync requirements
        if (request.getRequirements() != null && !request.getRequirements().isEmpty()) {
            syncJobRequirements(job, request.getRequirements());
        }

        // Sync benefits
        if (request.getBenefits() != null && !request.getBenefits().isEmpty()) {
            syncJobBenefits(job, request.getBenefits());
        }

        // Sync categories
        if (request.getCategories() != null && !request.getCategories().isEmpty()) {
            syncJobCategories(job, request.getCategories());
        }

        // If was rejected, re-submit to pending
        if (job.getStatus() == JobStatus.rejected) {
            String oldStatus = job.getStatus().name().toLowerCase();
            job.setStatus(JobStatus.pending);
            Map<String, Object> event = new HashMap<>();
            event.put("eventId", UUID.randomUUID().toString());
            event.put("eventType", "JobStatusChanged");
            event.put("occurredAt", LocalDateTime.now().toString());
            event.put("jobId", job.getId().toString());
            event.put("jobTitle", job.getTitle());
            event.put("recruiterId", job.getRecruiterId().toString());
            event.put("oldStatus", oldStatus);
            event.put("status", "pending");
            event.put("newStatus", "pending");
            event.put("postedAt", job.getPostedAt().toString());
            event.put("expiredAt", job.getExpiredAt().toString());
            jobEventProducer.sendJobStatusChanged(event);
            jobEventProducer.sendNotificationCreated(createRoleNotificationEvent(
                    ADMIN_NEW_JOB_POST,
                    "Tin tuyển dụng được gửi duyệt lại",
                    ROLE_ADMIN,
                    metadataOf(
                            "jobId", job.getId().toString(),
                            "jobTitle", job.getTitle(),
                            "recruiterId", job.getRecruiterId().toString()
                    )
            ));
        }

        jobRepository.save(job);
        incrementMutationMetric("update", job.getStatus().name().toLowerCase());
        return mapToJobDetailResponse(job);
    }

    /**
     * Xóa mềm job
     */
    @Transactional
    public void deleteJob(String jobId, String userId, String role) {
        UUID id = UUID.fromString(jobId);
        Job job = jobRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy công việc có id '" + jobId + "'."));

        if ("recruiter".equalsIgnoreCase(role) && !job.getRecruiterId().toString().equals(userId)) {
            throw new ForbiddenException("Bạn chỉ được phép xoá công việc mà bạn đăng.");
        }

        job.setDeletedAt(LocalDateTime.now());
        String oldStatus = job.getStatus().name().toLowerCase();
        job.setStatus(JobStatus.closed);
        jobRepository.save(job);

        Map<String, Object> event = new HashMap<>();
        event.put("eventId", UUID.randomUUID().toString());
        event.put("eventType", "JobStatusChanged");
        event.put("occurredAt", LocalDateTime.now().toString());
        event.put("jobId", job.getId().toString());
        event.put("jobTitle", job.getTitle());
        event.put("recruiterId", job.getRecruiterId().toString());
        event.put("oldStatus", oldStatus);
        event.put("status", "closed");
        event.put("newStatus", "closed");
        event.put("closedByUserId", userId);
        event.put("closedByRole", role);
        event.put("postedAt", job.getPostedAt().toString());
        event.put("expiredAt", job.getExpiredAt().toString());
        jobEventProducer.sendJobStatusChanged(event);
        incrementMutationMetric("delete", "closed");
    }

    /**
     * Admin duyệt/từ chối các công việc
     */
    @Transactional
    public void processJobStatus(ProcessJobStatusRequest request, String adminUserId) {
        if (request.getOpenJobIds() != null) {
            for (String jobIdStr : request.getOpenJobIds()) {
                UUID jobId = UUID.fromString(jobIdStr);
                Job job = jobRepository.findById(jobId)
                        .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy công việc có id '" + jobIdStr + "'."));

                String oldStatus = job.getStatus().name().toLowerCase();
                job.setStatus(JobStatus.open);
                jobRepository.save(job);

                Map<String, Object> event = new HashMap<>();
                event.put("eventId", UUID.randomUUID().toString());
                event.put("eventType", "JobStatusChanged");
                event.put("occurredAt", LocalDateTime.now().toString());
                event.put("jobId", jobIdStr);
                event.put("jobTitle", job.getTitle());
                event.put("recruiterId", job.getRecruiterId().toString());
                event.put("oldStatus", oldStatus);
                event.put("status", "approved");
                event.put("newStatus", "open");
                event.put("postedAt", job.getPostedAt().toString());
                event.put("expiredAt", job.getExpiredAt().toString());
                jobEventProducer.sendJobStatusChanged(event);
                jobEventProducer.sendNotificationCreated(createUserNotificationEvent(
                        RECRUITER_JOB_APPROVED,
                        "Tin tuyển dụng của bạn đã được duyệt",
                        job.getRecruiterId().toString(),
                        metadataOf(
                                "jobId", jobIdStr,
                                "jobTitle", job.getTitle(),
                                "oldStatus", oldStatus,
                                "newStatus", "open",
                                "adminUserId", adminUserId
                        )
                ));
                incrementMutationMetric("process", "approved");
            }
        }

        if (request.getRejectedJobs() != null) {
            for (ProcessJobStatusRequest.RejectedJob rj : request.getRejectedJobs()) {
                UUID jobId = UUID.fromString(rj.getJobId());
                Job job = jobRepository.findById(jobId)
                        .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy công việc có id '" + rj.getJobId() + "'."));

                String oldStatus = job.getStatus().name().toLowerCase();
                job.setStatus(JobStatus.rejected);
                jobRepository.save(job);

                Map<String, Object> event = new HashMap<>();
                event.put("eventId", UUID.randomUUID().toString());
                event.put("eventType", "JobStatusChanged");
                event.put("occurredAt", LocalDateTime.now().toString());
                event.put("jobId", rj.getJobId());
                event.put("jobTitle", job.getTitle());
                event.put("recruiterId", job.getRecruiterId().toString());
                event.put("oldStatus", oldStatus);
                event.put("status", "rejected");
                event.put("newStatus", "rejected");
                event.put("postedAt", job.getPostedAt().toString());
                event.put("expiredAt", job.getExpiredAt().toString());
                event.put("reason", rj.getReason() != null ? rj.getReason() : "");
                jobEventProducer.sendJobStatusChanged(event);
                Map<String, Object> metadata = new HashMap<>();
                metadata.put("jobId", rj.getJobId());
                metadata.put("jobTitle", job.getTitle());
                metadata.put("oldStatus", oldStatus);
                metadata.put("newStatus", "rejected");
                metadata.put("reason", rj.getReason() != null ? rj.getReason() : "");
                metadata.put("adminUserId", adminUserId);
                jobEventProducer.sendNotificationCreated(createUserNotificationEvent(
                        RECRUITER_JOB_REJECTED,
                        "Tin tuyển dụng của bạn đã bị từ chối",
                        job.getRecruiterId().toString(),
                        metadata
                ));
                incrementMutationMetric("process", "rejected");
            }
        }
    }

    /**
     * Lấy recommended jobs theo level ứng viên
     */
    public List<JobDetailResponse> getRecommendedJobs(String candidateId, Level level) {
        List<Job> jobs = jobRepository.findRecommendedJobs(level);
        return jobs.stream()
                .map(this::mapToJobDetailResponse)
                .collect(Collectors.toList());
    }

    /**
     * Thống kê jobs (cho Dashboard Service)
     */
    public JobSummaryResponse getJobSummary(LocalDateTime startDate, LocalDateTime endDate) {
        long total = countJobsInRange(startDate, endDate);
        long open = countJobsByStatusInRange(JobStatus.open, startDate, endDate);
        long pending = countJobsByStatusInRange(JobStatus.pending, startDate, endDate);
        long closed = countJobsByStatusInRange(JobStatus.closed, startDate, endDate);
        long rejected = countJobsByStatusInRange(JobStatus.rejected, startDate, endDate);
        long expired = countExpiredJobsInRange(LocalDateTime.now(), startDate, endDate);

        return JobSummaryResponse.builder()
                .total(total)
                .open(open)
                .pending(pending)
                .closed(closed)
                .rejected(rejected)
                .expired(expired)
                .build();
    }

    /**
     * Snapshot readiness for graceful degradation demos.
     */
    public Map<String, Object> getSnapshotStatus() {
        Map<String, Object> status = new LinkedHashMap<>();
        status.put("mode", "local-snapshot");
        status.put("degradationStrategy", "serve-job-browsing-from-job-db-and-category-snapshots");
        status.put("jobCount", jobRepository.count());
        status.put("categorySnapshotCount", categorySnapshotRepository.count());
        status.put("jobCategoryMappingCount", jobCategoryRepository.count());
        status.put("organizationServiceRequiredForBrowsing", false);
        return status;
    }

    // ========== Helper methods ==========

    private void saveJobCategories(Job job, List<String> categoryNames) {
        List<String> normalizedCategoryNames = normalizeCategoryNames(categoryNames);
        List<CategorySnapshot> categories = ensureCategorySnapshots(normalizedCategoryNames);

        if (categories.size() != normalizedCategoryNames.size()) {
            Set<String> found = categories.stream().map(CategorySnapshot::getCategoryName).collect(Collectors.toSet());
            List<String> missing = normalizedCategoryNames.stream().filter(n -> !found.contains(n)).collect(Collectors.toList());
            throw new ResourceNotFoundException("Không tìm thấy danh mục: " + String.join(", ", missing));
        }

        List<JobCategory> jobCategories = categories.stream()
                .map(cat -> JobCategory.builder()
                        .jobId(job.getId())
                        .categoryId(cat.getId())
                        .build())
                .collect(Collectors.toList());
        jobCategoryRepository.saveAll(jobCategories);
    }

    private List<String> normalizeCategoryNames(List<String> categoryNames) {
        return categoryNames.stream()
                .filter(Objects::nonNull)
                .map(String::trim)
                .filter(name -> !name.isBlank())
                .distinct()
                .collect(Collectors.toList());
    }

    private List<CategorySnapshot> ensureCategorySnapshots(List<String> categoryNames) {
        List<CategorySnapshot> categories = categorySnapshotRepository.findByCategoryNameIn(categoryNames);
        Set<String> foundNames = categories.stream()
                .map(CategorySnapshot::getCategoryName)
                .collect(Collectors.toSet());

        List<String> missingNames = categoryNames.stream()
                .filter(name -> !foundNames.contains(name))
                .collect(Collectors.toList());

        if (!missingNames.isEmpty()) {
            syncMissingCategoriesFromOrganizationService(missingNames);
            categories = categorySnapshotRepository.findByCategoryNameIn(categoryNames);
        }

        return categories;
    }

    private void syncMissingCategoriesFromOrganizationService(List<String> missingNames) {
        Map<String, OrganizationCategoryResponse> organizationCategoriesByName = organizationCategoryClient.getCategories().stream()
                .filter(category -> category.getName() != null && !category.getName().isBlank())
                .collect(Collectors.toMap(
                        category -> category.getName().trim(),
                        category -> category,
                        (left, right) -> left
                ));

        for (String missingName : missingNames) {
            OrganizationCategoryResponse organizationCategory = organizationCategoriesByName.get(missingName);
            if (organizationCategory == null) {
                organizationCategory = createOrganizationCategory(missingName);
            }

            if (organizationCategory != null) {
                upsertCategorySnapshot(organizationCategory);
            }
        }
    }

    private OrganizationCategoryResponse createOrganizationCategory(String categoryName) {
        try {
            return organizationCategoryClient.createCategory(new CreateOrganizationCategoryRequest(categoryName));
        } catch (FeignException.BadRequest exception) {
            log.info("Category '{}' already exists in organization-service or was created concurrently", categoryName);
            return organizationCategoryClient.getCategories().stream()
                    .filter(category -> categoryName.equals(category.getName()))
                    .findFirst()
                    .orElse(null);
        }
    }

    private void upsertCategorySnapshot(OrganizationCategoryResponse organizationCategory) {
        if (organizationCategory.getId() == null || organizationCategory.getName() == null) {
            return;
        }

        UUID categoryId = UUID.fromString(organizationCategory.getId());
        CategorySnapshot snapshot = categorySnapshotRepository.findById(categoryId)
                .orElseGet(CategorySnapshot::new);

        snapshot.setId(categoryId);
        snapshot.setCategoryName(organizationCategory.getName().trim());
        snapshot.setUpdatedAt(
                organizationCategory.getUpdatedAt() != null
                        ? organizationCategory.getUpdatedAt()
                        : LocalDateTime.now()
        );

        categorySnapshotRepository.save(snapshot);
    }

    private void syncJobDescriptions(Job job, List<String> newValues) {
        jobDescriptionRepository.deleteByJobId(job.getId());
        List<JobDescription> descriptions = newValues.stream()
                .map(desc -> JobDescription.builder().description(desc).job(job).build())
                .collect(Collectors.toList());
        jobDescriptionRepository.saveAll(descriptions);
    }

    private void syncJobRequirements(Job job, List<String> newValues) {
        jobRequirementRepository.deleteByJobId(job.getId());
        List<JobRequirement> requirements = newValues.stream()
                .map(req -> JobRequirement.builder().requirement(req).job(job).build())
                .collect(Collectors.toList());
        jobRequirementRepository.saveAll(requirements);
    }

    private void syncJobBenefits(Job job, List<String> newValues) {
        jobBenefitRepository.deleteByJobId(job.getId());
        List<JobBenefit> benefits = newValues.stream()
                .map(ben -> JobBenefit.builder().benefit(ben).job(job).build())
                .collect(Collectors.toList());
        jobBenefitRepository.saveAll(benefits);
    }

    private void syncJobCategories(Job job, List<String> categoryNames) {
        jobCategoryRepository.deleteByJobId(job.getId());
        saveJobCategories(job, categoryNames);
    }

    private List<String> resolveCategoryNames(UUID jobId) {
        List<JobCategory> jobCategories = jobCategoryRepository.findByJobId(jobId);
        if (jobCategories.isEmpty()) {
            return List.of();
        }

        Set<UUID> categoryIds = jobCategories.stream()
                .map(JobCategory::getCategoryId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        Map<UUID, String> categoryNamesById = categorySnapshotRepository.findAllById(categoryIds).stream()
                .collect(Collectors.toMap(CategorySnapshot::getId, CategorySnapshot::getCategoryName));

        return jobCategories.stream()
                .map(jobCategory -> {
                    CategorySnapshot category = jobCategory.getCategory();
                    if (category != null && category.getCategoryName() != null) {
                        return category.getCategoryName();
                    }

                    String fallbackName = categoryNamesById.get(jobCategory.getCategoryId());
                    if (fallbackName == null) {
                        log.warn(
                                "Skipping orphaned job category mapping for jobId={} categoryId={}",
                                jobId,
                                jobCategory.getCategoryId()
                        );
                    }
                    return fallbackName;
                })
                .filter(Objects::nonNull)
                .distinct()
                .collect(Collectors.toList());
    }

    private JobResponse mapToJobResponse(Job job) {
        List<String> categories = resolveCategoryNames(job.getId());

        return JobResponse.builder()
                .id(job.getId().toString())
                .title(job.getTitle())
                .description(job.getDescription())
                .address(job.getAddress())
                .salary(job.getSalary())
                .vacancies(job.getVacancies())
                .type(job.getType())
                .workingTimes(job.getWorkingTimes())
                .status(job.getStatus())
                .postedAt(job.getPostedAt())
                .expiredAt(job.getExpiredAt())
                .level(job.getLevel())
                .recruiterId(job.getRecruiterId().toString())
                .categories(categories)
                .build();
    }

    private JobDetailResponse mapToJobDetailResponse(Job job) {
        List<String> categories = resolveCategoryNames(job.getId());

        List<String> descriptions = jobDescriptionRepository.findByJobId(job.getId()).stream()
                .map(JobDescription::getDescription)
                .collect(Collectors.toList());

        List<String> requirements = jobRequirementRepository.findByJobId(job.getId()).stream()
                .map(JobRequirement::getRequirement)
                .collect(Collectors.toList());

        List<String> benefits = jobBenefitRepository.findByJobId(job.getId()).stream()
                .map(JobBenefit::getBenefit)
                .collect(Collectors.toList());

        return JobDetailResponse.builder()
                .id(job.getId().toString())
                .title(job.getTitle())
                .description(job.getDescription())
                .address(job.getAddress())
                .salary(job.getSalary())
                .vacancies(job.getVacancies())
                .type(job.getType())
                .workingTimes(job.getWorkingTimes())
                .status(job.getStatus())
                .postedAt(job.getPostedAt())
                .expiredAt(job.getExpiredAt())
                .level(job.getLevel())
                .recruiterId(job.getRecruiterId().toString())
                .categories(categories)
                .jobDescriptions(descriptions)
                .jobBenefits(benefits)
                .jobRequirements(requirements)
                .build();
    }

    private LocalDateTime parseDateTime(String dateStr) {
        try {
            return LocalDateTime.parse(dateStr, DateTimeFormatter.ISO_DATE_TIME);
        } catch (Exception e) {
            try {
                return LocalDateTime.parse(dateStr + "T00:00:00", DateTimeFormatter.ISO_DATE_TIME);
            } catch (Exception e2) {
                throw new BadRequestException("Định dạng ngày không hợp lệ: " + dateStr);
            }
        }
    }

    private void incrementMutationMetric(String action, String outcome) {
        meterRegistry.counter(
                "job_mutations_total",
                "action", action,
                "outcome", outcome
        ).increment();
    }

    private long countJobsInRange(LocalDateTime startDate, LocalDateTime endDate) {
        if (startDate != null && endDate != null) {
            return jobRepository.countByPostedAtBetween(startDate, endDate);
        }
        if (startDate != null) {
            return jobRepository.countByPostedAtGreaterThanEqual(startDate);
        }
        if (endDate != null) {
            return jobRepository.countByPostedAtLessThanEqual(endDate);
        }
        return jobRepository.count();
    }

    private long countJobsByStatusInRange(JobStatus status, LocalDateTime startDate, LocalDateTime endDate) {
        if (startDate != null && endDate != null) {
            return jobRepository.countByStatusAndPostedAtBetween(status, startDate, endDate);
        }
        if (startDate != null) {
            return jobRepository.countByStatusAndPostedAtGreaterThanEqual(status, startDate);
        }
        if (endDate != null) {
            return jobRepository.countByStatusAndPostedAtLessThanEqual(status, endDate);
        }
        return jobRepository.countByStatus(status);
    }

    private long countExpiredJobsInRange(LocalDateTime now, LocalDateTime startDate, LocalDateTime endDate) {
        if (startDate != null && endDate != null) {
            return jobRepository.countByExpiredAtLessThanAndPostedAtBetween(now, startDate, endDate);
        }
        if (startDate != null) {
            return jobRepository.countByExpiredAtLessThanAndPostedAtGreaterThanEqual(now, startDate);
        }
        if (endDate != null) {
            return jobRepository.countByExpiredAtLessThanAndPostedAtLessThanEqual(now, endDate);
        }
        return jobRepository.countByExpiredAtLessThan(now);
    }

    private Map<String, Object> createUserNotificationEvent(
            String type,
            String title,
            String userId,
            Map<String, Object> metadata
    ) {
        Map<String, Object> event = new HashMap<>();
        event.put("eventId", UUID.randomUUID().toString());
        event.put("eventType", "NotificationCreated");
        event.put("occurredAt", LocalDateTime.now().toString());
        event.put("type", type);
        event.put("title", title);
        event.put("userId", userId);
        event.put("metadata", metadata);
        return event;
    }

    private Map<String, Object> createRoleNotificationEvent(
            String type,
            String title,
            String recipientRole,
            Map<String, Object> metadata
    ) {
        Map<String, Object> event = createBaseNotificationEvent(type, title, metadata);
        event.put("recipientRole", recipientRole);
        return event;
    }

    private Map<String, Object> createBaseNotificationEvent(
            String type,
            String title,
            Map<String, Object> metadata
    ) {
        Map<String, Object> event = new HashMap<>();
        event.put("eventId", UUID.randomUUID().toString());
        event.put("eventType", "NotificationCreated");
        event.put("occurredAt", LocalDateTime.now().toString());
        event.put("type", type);
        event.put("title", title);
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
