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

    private static final String RECRUITER_ID = "66666666-6666-6666-6666-666666666666";

    private static final List<ApplicationSeed> APPLICATION_SEEDS = List.of(
            new ApplicationSeed(
                    "seed-application-backend",
                    "44444444-4444-4444-4444-444444444444",
                    "Ngoc Anh Candidate",
                    "90000000-0000-0000-0000-000000000001",
                    "Backend Developer (NestJS)",
                    "https://cdn.example.com/resumes/ngoc-anh-backend.pdf",
                    ApplicationStatus.pending,
                    3
            ),
            new ApplicationSeed(
                    "seed-application-devops",
                    "44444444-4444-4444-4444-444444444444",
                    "Ngoc Anh Candidate",
                    "90000000-0000-0000-0000-000000000002",
                    "DevOps Engineer",
                    "https://cdn.example.com/resumes/ngoc-anh-devops.pdf",
                    ApplicationStatus.accepted,
                    6
            ),
            new ApplicationSeed(
                    "seed-application-qa",
                    "44444444-4444-4444-4444-444444444444",
                    "Ngoc Anh Candidate",
                    "90000000-0000-0000-0000-000000000004",
                    "QA Automation Engineer",
                    "https://cdn.example.com/resumes/ngoc-anh-qa.pdf",
                    ApplicationStatus.rejected,
                    8
            ),
            new ApplicationSeed(
                    "seed-application-data-01",
                    "77777777-7777-7777-7777-777777777771",
                    "Tran Minh Data",
                    "90000000-0000-0000-0000-000000000006",
                    "Data Engineer",
                    "https://cdn.example.com/resumes/tran-minh-data.pdf",
                    ApplicationStatus.accepted,
                    4
            ),
            new ApplicationSeed(
                    "seed-application-data-02",
                    "77777777-7777-7777-7777-777777777772",
                    "Le Bao Analyst",
                    "90000000-0000-0000-0000-000000000006",
                    "Data Engineer",
                    "https://cdn.example.com/resumes/le-bao-analyst.pdf",
                    ApplicationStatus.pending,
                    2
            ),
            new ApplicationSeed(
                    "seed-application-ai-01",
                    "77777777-7777-7777-7777-777777777773",
                    "Pham Quynh AI",
                    "90000000-0000-0000-0000-000000000007",
                    "AI Engineer (RAG Platform)",
                    "https://cdn.example.com/resumes/pham-quynh-ai.pdf",
                    ApplicationStatus.pending,
                    1
            ),
            new ApplicationSeed(
                    "seed-application-ai-02",
                    "77777777-7777-7777-7777-777777777774",
                    "Nguyen Duc ML",
                    "90000000-0000-0000-0000-000000000007",
                    "AI Engineer (RAG Platform)",
                    "https://cdn.example.com/resumes/nguyen-duc-ml.pdf",
                    ApplicationStatus.rejected,
                    5
            ),
            new ApplicationSeed(
                    "seed-application-mobile-01",
                    "77777777-7777-7777-7777-777777777775",
                    "Hoang Linh Mobile",
                    "90000000-0000-0000-0000-000000000008",
                    "Mobile Developer (Flutter)",
                    "https://cdn.example.com/resumes/hoang-linh-mobile.pdf",
                    ApplicationStatus.accepted,
                    7
            ),
            new ApplicationSeed(
                    "seed-application-security-01",
                    "77777777-7777-7777-7777-777777777776",
                    "Doan Kiet Security",
                    "90000000-0000-0000-0000-000000000009",
                    "Cybersecurity Analyst",
                    "https://cdn.example.com/resumes/doan-kiet-security.pdf",
                    ApplicationStatus.pending,
                    3
            ),
            new ApplicationSeed(
                    "seed-application-uiux-01",
                    "77777777-7777-7777-7777-777777777777",
                    "Bui Ha Designer",
                    "90000000-0000-0000-0000-000000000010",
                    "Product Designer (UI/UX)",
                    "https://cdn.example.com/resumes/bui-ha-designer.pdf",
                    ApplicationStatus.accepted,
                    20
            ),
            new ApplicationSeed(
                    "seed-application-dba-01",
                    "88888888-8888-8888-8888-888888888881",
                    "Vu Tam DBA",
                    "90000000-0000-0000-0000-000000000011",
                    "Database Administrator",
                    "https://cdn.example.com/resumes/vu-tam-dba.pdf",
                    ApplicationStatus.pending,
                    6
            ),
            new ApplicationSeed(
                    "seed-application-pm-01",
                    "88888888-8888-8888-8888-888888888882",
                    "Mai Anh PM",
                    "90000000-0000-0000-0000-000000000012",
                    "IT Project Manager",
                    "https://cdn.example.com/resumes/mai-anh-pm.pdf",
                    ApplicationStatus.accepted,
                    9
            ),
            new ApplicationSeed(
                    "seed-application-pm-02",
                    "88888888-8888-8888-8888-888888888883",
                    "Ngoc Lan Scrum",
                    "90000000-0000-0000-0000-000000000012",
                    "IT Project Manager",
                    "https://cdn.example.com/resumes/ngoc-lan-scrum.pdf",
                    ApplicationStatus.rejected,
                    12
            ),
            new ApplicationSeed(
                    "seed-application-support-01",
                    "88888888-8888-8888-8888-888888888884",
                    "Tran Gia Support",
                    "90000000-0000-0000-0000-000000000013",
                    "IT Support & Helpdesk",
                    "https://cdn.example.com/resumes/tran-gia-support.pdf",
                    ApplicationStatus.accepted,
                    16
            ),
            new ApplicationSeed(
                    "seed-application-blockchain-01",
                    "88888888-8888-8888-8888-888888888885",
                    "Phan Huy Chain",
                    "90000000-0000-0000-0000-000000000014",
                    "Blockchain Engineer",
                    "https://cdn.example.com/resumes/phan-huy-chain.pdf",
                    ApplicationStatus.rejected,
                    13
            ),
            new ApplicationSeed(
                    "seed-application-game-01",
                    "88888888-8888-8888-8888-888888888886",
                    "Vo Bao Game",
                    "90000000-0000-0000-0000-000000000015",
                    "Game Developer Intern",
                    "https://cdn.example.com/resumes/vo-bao-game.pdf",
                    ApplicationStatus.pending,
                    2
            ),
            new ApplicationSeed(
                    "seed-application-fullstack-01",
                    "99999999-9999-9999-9999-999999999991",
                    "Le Thanh Fullstack",
                    "90000000-0000-0000-0000-000000000005",
                    "Full Stack Developer",
                    "https://cdn.example.com/resumes/le-thanh-fullstack.pdf",
                    ApplicationStatus.accepted,
                    24
            ),
            new ApplicationSeed(
                    "seed-application-frontend-01",
                    "99999999-9999-9999-9999-999999999992",
                    "Nguyen Thao Frontend",
                    "90000000-0000-0000-0000-000000000003",
                    "Frontend React Engineer",
                    "https://cdn.example.com/resumes/nguyen-thao-frontend.pdf",
                    ApplicationStatus.pending,
                    2
            ),
            new ApplicationSeed(
                    "seed-application-frontend-02",
                    "99999999-9999-9999-9999-999999999993",
                    "Truong Nhi UX",
                    "90000000-0000-0000-0000-000000000003",
                    "Frontend React Engineer",
                    "https://cdn.example.com/resumes/truong-nhi-ux.pdf",
                    ApplicationStatus.rejected,
                    4
            ),
            new ApplicationSeed(
                    "seed-application-sre-01",
                    "12121212-3434-5656-7878-909090909090",
                    "Tran Minh Data",
                    "90000000-0000-0000-0000-000000000016",
                    "Site Reliability Engineer",
                    "https://cdn.example.com/resumes/tran-minh-sre.pdf",
                    ApplicationStatus.accepted,
                    1
            ),
            new ApplicationSeed(
                    "seed-application-sre-02",
                    "99999999-9999-9999-9999-999999999994",
                    "Le Quoc Ops",
                    "90000000-0000-0000-0000-000000000016",
                    "Site Reliability Engineer",
                    "https://cdn.example.com/resumes/le-quoc-ops.pdf",
                    ApplicationStatus.pending,
                    3
            ),
            new ApplicationSeed(
                    "seed-application-ba-01",
                    "99999999-9999-9999-9999-999999999995",
                    "Pham Y Nhi BA",
                    "90000000-0000-0000-0000-000000000017",
                    "Business Analyst (Digital Platform)",
                    "https://cdn.example.com/resumes/pham-y-nhi-ba.pdf",
                    ApplicationStatus.pending,
                    2
            ),
            new ApplicationSeed(
                    "seed-application-iot-01",
                    "99999999-9999-9999-9999-999999999996",
                    "Nguyen Khoa IoT",
                    "90000000-0000-0000-0000-000000000018",
                    "Embedded IoT Engineer",
                    "https://cdn.example.com/resumes/nguyen-khoa-iot.pdf",
                    ApplicationStatus.accepted,
                    5
            ),
            new ApplicationSeed(
                    "seed-application-architect-01",
                    "99999999-9999-9999-9999-999999999997",
                    "Hoang Tuan Architect",
                    "90000000-0000-0000-0000-000000000019",
                    "Solutions Architect",
                    "https://cdn.example.com/resumes/hoang-tuan-architect.pdf",
                    ApplicationStatus.rejected,
                    21
            ),
            new ApplicationSeed(
                    "seed-application-data-analyst-01",
                    "99999999-9999-9999-9999-999999999998",
                    "Do Ha Analyst",
                    "90000000-0000-0000-0000-000000000020",
                    "Product Data Analyst",
                    "https://cdn.example.com/resumes/do-ha-analyst.pdf",
                    ApplicationStatus.pending,
                    4
            ),
            new ApplicationSeed(
                    "seed-application-cs-01",
                    "99999999-9999-9999-9999-999999999999",
                    "Vu Hien Support",
                    "90000000-0000-0000-0000-000000000021",
                    "Customer Success Engineer",
                    "https://cdn.example.com/resumes/vu-hien-support.pdf",
                    ApplicationStatus.accepted,
                    6
            ),
            new ApplicationSeed(
                    "seed-application-ai-pm-01",
                    "51515151-6262-7373-8484-959595959595",
                    "Khanh Linh Designer",
                    "90000000-0000-0000-0000-000000000022",
                    "AI Product Manager",
                    "https://cdn.example.com/resumes/khanh-linh-ai-pm.pdf",
                    ApplicationStatus.pending,
                    2
            ),
            new ApplicationSeed(
                    "seed-application-ai-pm-02",
                    "88888888-8888-8888-8888-888888888887",
                    "Trinh Mai Product",
                    "90000000-0000-0000-0000-000000000022",
                    "AI Product Manager",
                    "https://cdn.example.com/resumes/trinh-mai-product.pdf",
                    ApplicationStatus.accepted,
                    7
            ),
            new ApplicationSeed(
                    "seed-application-cloud-security-01",
                    "88888888-8888-8888-8888-888888888888",
                    "Ngo Minh Shield",
                    "90000000-0000-0000-0000-000000000023",
                    "Cloud Security Engineer",
                    "https://cdn.example.com/resumes/ngo-minh-shield.pdf",
                    ApplicationStatus.pending,
                    1
            ),
            new ApplicationSeed(
                    "seed-application-cloud-security-02",
                    "88888888-8888-8888-8888-888888888889",
                    "Le Thai Secure",
                    "90000000-0000-0000-0000-000000000023",
                    "Cloud Security Engineer",
                    "https://cdn.example.com/resumes/le-thai-secure.pdf",
                    ApplicationStatus.rejected,
                    9
            ),
            new ApplicationSeed(
                    "seed-application-backend-02",
                    "31313131-4242-5353-6464-757575757575",
                    "Hoang Linh Mobile",
                    "90000000-0000-0000-0000-000000000001",
                    "Backend Developer (NestJS)",
                    "https://cdn.example.com/resumes/hoang-linh-backend-switch.pdf",
                    ApplicationStatus.pending,
                    8
            ),
            new ApplicationSeed(
                    "seed-application-devops-02",
                    "12121212-3434-5656-7878-909090909090",
                    "Tran Minh Data",
                    "90000000-0000-0000-0000-000000000002",
                    "DevOps Engineer",
                    "https://cdn.example.com/resumes/tran-minh-devops.pdf",
                    ApplicationStatus.accepted,
                    11
            ),
            new ApplicationSeed(
                    "seed-application-mobile-02",
                    "31313131-4242-5353-6464-757575757575",
                    "Hoang Linh Mobile",
                    "90000000-0000-0000-0000-000000000008",
                    "Mobile Developer (Flutter)",
                    "https://cdn.example.com/resumes/hoang-linh-mobile-2.pdf",
                    ApplicationStatus.accepted,
                    3
            ),
            new ApplicationSeed(
                    "seed-application-uiux-02",
                    "51515151-6262-7373-8484-959595959595",
                    "Khanh Linh Designer",
                    "90000000-0000-0000-0000-000000000010",
                    "Product Designer (UI/UX)",
                    "https://cdn.example.com/resumes/khanh-linh-designer.pdf",
                    ApplicationStatus.accepted,
                    5
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
                    .findByCandidateIdAndJobId(seed.candidateId(), seed.jobId())
                    .orElseGet(Application::new);

            if (application.getId() == null) {
                application.setId(seed.id());
            }

            application.setCandidateId(seed.candidateId());
            application.setCandidateName(seed.candidateName());
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
            String candidateId,
            String candidateName,
            String jobId,
            String jobTitle,
            String resumeUrl,
            ApplicationStatus status,
            int appliedDaysAgo
    ) {
    }
}
