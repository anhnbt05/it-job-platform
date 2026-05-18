package com.itjob.jobservice.seed;

import com.itjob.jobservice.entity.CategorySnapshot;
import com.itjob.jobservice.entity.Job;
import com.itjob.jobservice.entity.JobBenefit;
import com.itjob.jobservice.entity.JobCategory;
import com.itjob.jobservice.entity.JobDescription;
import com.itjob.jobservice.entity.JobFavorite;
import com.itjob.jobservice.entity.JobRequirement;
import com.itjob.jobservice.enums.JobStatus;
import com.itjob.jobservice.enums.JobType;
import com.itjob.jobservice.enums.Level;
import com.itjob.jobservice.repository.CategorySnapshotRepository;
import com.itjob.jobservice.repository.JobBenefitRepository;
import com.itjob.jobservice.repository.JobCategoryRepository;
import com.itjob.jobservice.repository.JobDescriptionRepository;
import com.itjob.jobservice.repository.JobFavoriteRepository;
import com.itjob.jobservice.repository.JobRepository;
import com.itjob.jobservice.repository.JobRequirementRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.function.Supplier;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
@Slf4j
@ConditionalOnProperty(name = "app.seed", havingValue = "true")
public class JobDataSeeder implements ApplicationRunner {

    private static final UUID CANDIDATE_USER_ID = UUID.fromString("44444444-4444-4444-4444-444444444444");
    private static final UUID RECRUITER_USER_ID = UUID.fromString("66666666-6666-6666-6666-666666666666");

    private static final UUID BACKEND_JOB_ID = UUID.fromString("90000000-0000-0000-0000-000000000001");
    private static final UUID DEVOPS_JOB_ID = UUID.fromString("90000000-0000-0000-0000-000000000002");
    private static final UUID FRONTEND_JOB_ID = UUID.fromString("90000000-0000-0000-0000-000000000003");
    private static final UUID QA_JOB_ID = UUID.fromString("90000000-0000-0000-0000-000000000004");
    private static final UUID FULLSTACK_JOB_ID = UUID.fromString("90000000-0000-0000-0000-000000000005");

    private static final List<CategorySeed> CATEGORY_SEEDS = List.of(
            new CategorySeed(UUID.fromString("10000000-0000-0000-0000-000000000001"), "Software Development"),
            new CategorySeed(UUID.fromString("10000000-0000-0000-0000-000000000002"), "Frontend Development"),
            new CategorySeed(UUID.fromString("10000000-0000-0000-0000-000000000003"), "Backend Development"),
            new CategorySeed(UUID.fromString("10000000-0000-0000-0000-000000000004"), "Full Stack Development"),
            new CategorySeed(UUID.fromString("10000000-0000-0000-0000-000000000005"), "Mobile Development"),
            new CategorySeed(UUID.fromString("10000000-0000-0000-0000-000000000006"), "DevOps & Cloud"),
            new CategorySeed(UUID.fromString("10000000-0000-0000-0000-000000000007"), "Data Engineering"),
            new CategorySeed(UUID.fromString("10000000-0000-0000-0000-000000000008"), "Data Science & AI/ML"),
            new CategorySeed(UUID.fromString("10000000-0000-0000-0000-000000000009"), "Cybersecurity"),
            new CategorySeed(UUID.fromString("10000000-0000-0000-0000-000000000010"), "QA & Testing"),
            new CategorySeed(UUID.fromString("10000000-0000-0000-0000-000000000011"), "UI/UX Design"),
            new CategorySeed(UUID.fromString("10000000-0000-0000-0000-000000000012"), "System & Network Administration"),
            new CategorySeed(UUID.fromString("10000000-0000-0000-0000-000000000013"), "Database Administration"),
            new CategorySeed(UUID.fromString("10000000-0000-0000-0000-000000000014"), "Embedded & IoT"),
            new CategorySeed(UUID.fromString("10000000-0000-0000-0000-000000000015"), "Blockchain"),
            new CategorySeed(UUID.fromString("10000000-0000-0000-0000-000000000016"), "Game Development"),
            new CategorySeed(UUID.fromString("10000000-0000-0000-0000-000000000017"), "IT Project Management"),
            new CategorySeed(UUID.fromString("10000000-0000-0000-0000-000000000018"), "IT Support & Helpdesk")
    );

    private static final List<JobSeed> JOB_SEEDS = List.of(
            new JobSeed(
                    BACKEND_JOB_ID,
                    "Backend Developer (NestJS)",
                    "Xây dựng hệ thống tuyển dụng theo hướng microservices với NestJS.",
                    "District 1, Ho Chi Minh City",
                    "1500 - 2200 USD",
                    2,
                    JobType.full_time,
                    "Mon - Fri, 09:00 - 18:00",
                    JobStatus.open,
                    10,
                    20,
                    Level.junior,
                    List.of("Backend Development", "Software Development"),
                    List.of(
                            "Thiết kế và phát triển REST API cho nền tảng tuyển dụng.",
                            "Làm việc với PostgreSQL, Kafka và Redis trong kiến trúc service-based."
                    ),
                    List.of(
                            "Lương tháng 13 và review hiệu suất 2 lần/năm.",
                            "Hybrid 3 ngày/tuần, hỗ trợ thiết bị làm việc."
                    ),
                    List.of(
                            "Có kinh nghiệm với NestJS hoặc Node.js từ 1 năm trở lên.",
                            "Nắm tốt SQL, message queue và tư duy clean architecture."
                    )
            ),
            new JobSeed(
                    DEVOPS_JOB_ID,
                    "DevOps Engineer",
                    "Vận hành CI/CD, hạ tầng container và tối ưu hệ thống cloud.",
                    "Thu Duc City, Ho Chi Minh City",
                    "1800 - 2600 USD",
                    1,
                    JobType.remote,
                    "Flexible, overlap 4h with GMT+7",
                    JobStatus.open,
                    7,
                    18,
                    Level.mid,
                    List.of("DevOps & Cloud", "System & Network Administration"),
                    List.of(
                            "Xây dựng pipeline CI/CD cho nhiều service backend và frontend.",
                            "Theo dõi logging, metrics, alerting và cải thiện reliability."
                    ),
                    List.of(
                            "Remote-first, budget học tập hằng năm.",
                            "Thưởng theo hiệu suất và hỗ trợ chứng chỉ cloud."
                    ),
                    List.of(
                            "Kinh nghiệm với Docker, GitHub Actions hoặc Jenkins.",
                            "Có kiến thức về AWS/GCP, monitoring và Linux."
                    )
            ),
            new JobSeed(
                    FRONTEND_JOB_ID,
                    "Frontend React Engineer",
                    "Phát triển giao diện dashboard và candidate portal bằng React/Next.js.",
                    "District 3, Ho Chi Minh City",
                    "1400 - 2000 USD",
                    1,
                    JobType.full_time,
                    "Mon - Fri, 08:30 - 17:30",
                    JobStatus.pending,
                    3,
                    25,
                    Level.mid,
                    List.of("Frontend Development", "UI/UX Design"),
                    List.of(
                            "Xây dựng các luồng UI cho candidate, recruiter và admin.",
                            "Phối hợp với backend để tích hợp API và tối ưu trải nghiệm người dùng."
                    ),
                    List.of(
                            "MacBook và màn hình phụ cấp sẵn.",
                            "Phụ cấp ăn trưa, gửi xe và team bonding hằng quý."
                    ),
                    List.of(
                            "Thành thạo React, Next.js và TypeScript.",
                            "Có kinh nghiệm xử lý state management và data fetching."
                    )
            ),
            new JobSeed(
                    QA_JOB_ID,
                    "QA Automation Engineer",
                    "Thiết lập chiến lược test automation cho các service chính.",
                    "District 7, Ho Chi Minh City",
                    "1200 - 1800 USD",
                    1,
                    JobType.full_time,
                    "Mon - Fri, 09:00 - 18:00",
                    JobStatus.rejected,
                    5,
                    15,
                    Level.junior,
                    List.of("QA & Testing", "Software Development"),
                    List.of(
                            "Viết test automation cho API và UI regression flows.",
                            "Phối hợp với dev để phân tích root cause và cải thiện quality gate."
                    ),
                    List.of(
                            "Bảo hiểm sức khỏe và khám tổng quát định kỳ.",
                            "Môi trường mentor sát cho QA chuyển hướng automation."
                    ),
                    List.of(
                            "Biết Selenium/Cypress/Playwright là lợi thế.",
                            "Có nền tảng test case design và tư duy chi tiết."
                    )
            ),
            new JobSeed(
                    FULLSTACK_JOB_ID,
                    "Full Stack Developer",
                    "Tham gia cả backend lẫn frontend cho sản phẩm tuyển dụng nội bộ.",
                    "Binh Thanh District, Ho Chi Minh City",
                    "2000 - 2800 USD",
                    1,
                    JobType.full_time,
                    "Mon - Fri, 09:00 - 18:00",
                    JobStatus.closed,
                    20,
                    -2,
                    Level.senior,
                    List.of("Full Stack Development", "Software Development"),
                    List.of(
                            "Thiết kế flow end-to-end từ database tới web app.",
                            "Tối ưu hiệu năng và maintainability cho các tính năng chính."
                    ),
                    List.of(
                            "ESOP cho nhân sự gắn bó dài hạn.",
                            "12 ngày phép và chính sách workation linh hoạt."
                    ),
                    List.of(
                            "Thành thạo cả Node.js/NestJS và React/Next.js.",
                            "Có kinh nghiệm làm việc với kiến trúc microservices."
                    )
            )
    );

    private final CategorySnapshotRepository categorySnapshotRepository;
    private final JobRepository jobRepository;
    private final JobDescriptionRepository jobDescriptionRepository;
    private final JobRequirementRepository jobRequirementRepository;
    private final JobBenefitRepository jobBenefitRepository;
    private final JobCategoryRepository jobCategoryRepository;
    private final JobFavoriteRepository jobFavoriteRepository;
    private final ConfigurableApplicationContext applicationContext;

    @Override
    public void run(ApplicationArguments args) {
        int exitCode = 0;

        try {
            seedCategorySnapshots();
            seedJobs();
            seedFavorites();
            log.info("Job service seed completed.");
        } catch (Exception exception) {
            exitCode = 1;
            log.error("Job service seed failed.", exception);
        }

        final int finalExitCode = exitCode;
        System.exit(SpringApplication.exit(applicationContext, () -> finalExitCode));
    }

    private void seedCategorySnapshots() {
        LocalDateTime now = LocalDateTime.now();

        for (CategorySeed seed : CATEGORY_SEEDS) {
            CategorySnapshot snapshot = categorySnapshotRepository.findById(seed.id())
                    .orElseGet(CategorySnapshot::new);

            snapshot.setId(seed.id());
            snapshot.setCategoryName(seed.name());
            snapshot.setUpdatedAt(now);

            categorySnapshotRepository.save(snapshot);
        }
    }

    private void seedJobs() {
        LocalDateTime now = LocalDateTime.now();

        for (JobSeed seed : JOB_SEEDS) {
            Job job = jobRepository.findById(seed.id()).orElseGet(Job::new);
            job.setId(seed.id());
            job.setTitle(seed.title());
            job.setDescription(seed.overview());
            job.setAddress(seed.address());
            job.setSalary(seed.salary());
            job.setVacancies(seed.vacancies());
            job.setType(seed.type());
            job.setWorkingTimes(seed.workingTimes());
            job.setStatus(seed.status());
            job.setPostedAt(now.minusDays(seed.postedDaysAgo()));
            job.setExpiredAt(now.plusDays(seed.expiresInDays()));
            job.setLevel(seed.level());
            job.setRecruiterId(RECRUITER_USER_ID);
            job.setDeletedAt(null);

            Job savedJob = jobRepository.save(job);

            replaceChildren(savedJob, seed.descriptions(), seed.requirements(), seed.benefits(), seed.categories());
        }
    }

    private void seedFavorites() {
        upsertFavorite(BACKEND_JOB_ID, () -> LocalDateTime.now().minusDays(4));
        upsertFavorite(DEVOPS_JOB_ID, () -> LocalDateTime.now().minusDays(2));
    }

    private void replaceChildren(
            Job job,
            List<String> descriptions,
            List<String> requirements,
            List<String> benefits,
            List<String> categoryNames
    ) {
        UUID jobId = job.getId();

        jobDescriptionRepository.deleteByJobId(jobId);
        jobRequirementRepository.deleteByJobId(jobId);
        jobBenefitRepository.deleteByJobId(jobId);
        jobCategoryRepository.deleteByJobId(jobId);

        jobDescriptionRepository.saveAll(
                descriptions.stream()
                        .map(value -> JobDescription.builder().description(value).job(job).build())
                        .toList()
        );

        jobRequirementRepository.saveAll(
                requirements.stream()
                        .map(value -> JobRequirement.builder().requirement(value).job(job).build())
                        .toList()
        );

        jobBenefitRepository.saveAll(
                benefits.stream()
                        .map(value -> JobBenefit.builder().benefit(value).job(job).build())
                        .toList()
        );

        Map<String, UUID> categoryIdByName = categorySnapshotRepository.findByCategoryNameIn(categoryNames).stream()
                .collect(Collectors.toMap(CategorySnapshot::getCategoryName, CategorySnapshot::getId));

        if (categoryIdByName.size() != categoryNames.size()) {
            throw new IllegalStateException("Missing category snapshots for job seed: " + String.join(", ", categoryNames));
        }

        List<JobCategory> jobCategories = categoryNames.stream()
                .map(categoryName -> JobCategory.builder()
                        .jobId(jobId)
                        .categoryId(categoryIdByName.get(categoryName))
                        .build())
                .toList();

        jobCategoryRepository.saveAll(jobCategories);
    }
    private void upsertFavorite(UUID jobId, Supplier<LocalDateTime> savedAtSupplier) {
        Job job = jobRepository.findById(jobId).orElseThrow();
        JobFavorite favorite = jobFavoriteRepository.findByCandidateIdAndJobId(CANDIDATE_USER_ID, jobId)
                .orElseGet(() -> JobFavorite.builder()
                        .candidateId(CANDIDATE_USER_ID)
                        .job(job)
                        .build());

        favorite.setJob(job);
        favorite.setCandidateId(CANDIDATE_USER_ID);
        favorite.setDeletedAt(null);
        favorite.setSavedAt(savedAtSupplier.get());

        jobFavoriteRepository.save(favorite);
    }

    private record CategorySeed(UUID id, String name) {
    }

    private record JobSeed(
            UUID id,
            String title,
            String overview,
            String address,
            String salary,
            int vacancies,
            JobType type,
            String workingTimes,
            JobStatus status,
            int postedDaysAgo,
            int expiresInDays,
            Level level,
            List<String> categories,
            List<String> descriptions,
            List<String> benefits,
            List<String> requirements
    ) {
    }
}


