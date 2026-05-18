package com.itjob.applicationservice.seed;

import com.itjob.applicationservice.document.Application;
import com.itjob.applicationservice.enums.ApplicationStatus;
import com.itjob.applicationservice.repository.ApplicationRepository;
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

@Component
@RequiredArgsConstructor
@Slf4j
@ConditionalOnProperty(name = "app.seed", havingValue = "true")
public class ApplicationDataSeeder implements ApplicationRunner {

    private static final String CANDIDATE_ID = "44444444-4444-4444-4444-444444444444";
    private static final String CANDIDATE_NAME = "Ngoc Anh Candidate";
    private static final String RECRUITER_ID = "66666666-6666-6666-6666-666666666666";

    private static final List<ApplicationSeed> APPLICATION_SEEDS = List.of(
            new ApplicationSeed(
                    "seed-application-backend",
                    "90000000-0000-0000-0000-000000000001",
                    "Backend Developer (NestJS)",
                    "https://cdn.example.com/resumes/ngoc-anh-backend.pdf",
                    ApplicationStatus.pending,
                    3
            ),
            new ApplicationSeed(
                    "seed-application-devops",
                    "90000000-0000-0000-0000-000000000002",
                    "DevOps Engineer",
                    "https://cdn.example.com/resumes/ngoc-anh-devops.pdf",
                    ApplicationStatus.accepted,
                    6
            ),
            new ApplicationSeed(
                    "seed-application-qa",
                    "90000000-0000-0000-0000-000000000004",
                    "QA Automation Engineer",
                    "https://cdn.example.com/resumes/ngoc-anh-qa.pdf",
                    ApplicationStatus.rejected,
                    8
            )
    );

    private final ApplicationRepository applicationRepository;
    private final ConfigurableApplicationContext applicationContext;

    @Override
    public void run(ApplicationArguments args) {
        int exitCode = 0;

        try {
            seedApplications();
            log.info("Application service seed completed.");
        } catch (Exception exception) {
            exitCode = 1;
            log.error("Application service seed failed.", exception);
        }

        final int finalExitCode = exitCode;
        System.exit(SpringApplication.exit(applicationContext, () -> finalExitCode));
    }

    private void seedApplications() {
        for (ApplicationSeed seed : APPLICATION_SEEDS) {
            Application application = applicationRepository
                    .findByCandidateIdAndJobId(CANDIDATE_ID, seed.jobId())
                    .orElseGet(Application::new);

            if (application.getId() == null) {
                application.setId(seed.id());
            }

            application.setCandidateId(CANDIDATE_ID);
            application.setCandidateName(CANDIDATE_NAME);
            application.setJobId(seed.jobId());
            application.setJobTitle(seed.jobTitle());
            application.setRecruiterId(RECRUITER_ID);
            application.setResumeUrl(seed.resumeUrl());
            application.setStatus(seed.status());
            application.setAppliedAt(LocalDateTime.now().minusDays(seed.appliedDaysAgo()));
            application.setDeletedAt(null);

            applicationRepository.save(application);
        }
    }

    private record ApplicationSeed(
            String id,
            String jobId,
            String jobTitle,
            String resumeUrl,
            ApplicationStatus status,
            int appliedDaysAgo
    ) {
    }
}
