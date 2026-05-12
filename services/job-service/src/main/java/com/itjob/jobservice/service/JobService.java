package com.itjob.jobservice.service;

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

    private final JobRepository jobRepository;
    private final JobDescriptionRepository jobDescriptionRepository;
    private final JobRequirementRepository jobRequirementRepository;
    private final JobBenefitRepository jobBenefitRepository;
    private final CategorySnapshotRepository categorySnapshotRepository;
    private final JobCategoryRepository jobCategoryRepository;
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
        event.put("jobId", savedJob.getId().toString());
        event.put("jobTitle", savedJob.getTitle());
        event.put("recruiterId", recruiterId);
        event.put("status", "pending");
        jobEventProducer.sendJobCreated(event);
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
            job.setStatus(JobStatus.pending);
            Map<String, Object> event = new HashMap<>();
            event.put("jobId", job.getId().toString());
            event.put("jobTitle", job.getTitle());
            event.put("recruiterId", job.getRecruiterId().toString());
            event.put("status", "pending");
            jobEventProducer.sendJobCreated(event);
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
        job.setStatus(JobStatus.closed);
        jobRepository.save(job);
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

                job.setStatus(JobStatus.open);
                jobRepository.save(job);

                Map<String, Object> event = new HashMap<>();
                event.put("jobId", jobIdStr);
                event.put("jobTitle", job.getTitle());
                event.put("recruiterId", job.getRecruiterId().toString());
                event.put("status", "approved");
                jobEventProducer.sendJobStatusChanged(event);
                incrementMutationMetric("process", "approved");
            }
        }

        if (request.getRejectedJobs() != null) {
            for (ProcessJobStatusRequest.RejectedJob rj : request.getRejectedJobs()) {
                UUID jobId = UUID.fromString(rj.getJobId());
                Job job = jobRepository.findById(jobId)
                        .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy công việc có id '" + rj.getJobId() + "'."));

                job.setStatus(JobStatus.rejected);
                jobRepository.save(job);

                Map<String, Object> event = new HashMap<>();
                event.put("jobId", rj.getJobId());
                event.put("jobTitle", job.getTitle());
                event.put("recruiterId", job.getRecruiterId().toString());
                event.put("status", "rejected");
                event.put("reason", rj.getReason() != null ? rj.getReason() : "");
                jobEventProducer.sendJobStatusChanged(event);
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
        long total = jobRepository.countByDateRange(startDate, endDate);
        long open = jobRepository.countByStatusAndDateRange(JobStatus.open, startDate, endDate);
        long pending = jobRepository.countByStatusAndDateRange(JobStatus.pending, startDate, endDate);
        long closed = jobRepository.countByStatusAndDateRange(JobStatus.closed, startDate, endDate);
        long rejected = jobRepository.countByStatusAndDateRange(JobStatus.rejected, startDate, endDate);
        long expired = jobRepository.countExpiredByDateRange(LocalDateTime.now(), startDate, endDate);

        return JobSummaryResponse.builder()
                .total(total)
                .open(open)
                .pending(pending)
                .closed(closed)
                .rejected(rejected)
                .expired(expired)
                .build();
    }

    // ========== Helper methods ==========

    private void saveJobCategories(Job job, List<String> categoryNames) {
        List<CategorySnapshot> categories = categorySnapshotRepository.findByCategoryNameIn(categoryNames);
        if (categories.size() != categoryNames.size()) {
            Set<String> found = categories.stream().map(CategorySnapshot::getCategoryName).collect(Collectors.toSet());
            List<String> missing = categoryNames.stream().filter(n -> !found.contains(n)).collect(Collectors.toList());
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

    private JobResponse mapToJobResponse(Job job) {
        List<String> categories = jobCategoryRepository.findByJobId(job.getId()).stream()
                .map(jc -> jc.getCategory().getCategoryName())
                .collect(Collectors.toList());

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
        List<String> categories = jobCategoryRepository.findByJobId(job.getId()).stream()
                .map(jc -> jc.getCategory().getCategoryName())
                .collect(Collectors.toList());

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
}
