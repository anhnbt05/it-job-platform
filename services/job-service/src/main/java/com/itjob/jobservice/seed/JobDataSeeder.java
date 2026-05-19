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
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;

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
    private static final UUID NOVA_RECRUITER_USER_ID = UUID.fromString("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa");
    private static final UUID CLOUD_RECRUITER_USER_ID = UUID.fromString("72727272-8181-9191-a2a2-b3b3b3b3b3b3");
    private static final UUID PRODUCT_RECRUITER_USER_ID = UUID.fromString("93939393-a4a4-b5b5-c6c6-d7d7d7d7d7d7");
    private static final UUID HORIZON_RECRUITER_USER_ID = UUID.fromString("b1b1b1b1-c2c2-d3d3-e4e4-f5f5f5f5f5f5");
    private static final UUID GREEN_RECRUITER_USER_ID = UUID.fromString("c1c1c1c1-d2d2-e3e3-f4f4-a5a5a5a5a5a5");

    private static final UUID BACKEND_JOB_ID = UUID.fromString("90000000-0000-0000-0000-000000000001");
    private static final UUID DEVOPS_JOB_ID = UUID.fromString("90000000-0000-0000-0000-000000000002");
    private static final UUID FRONTEND_JOB_ID = UUID.fromString("90000000-0000-0000-0000-000000000003");
    private static final UUID QA_JOB_ID = UUID.fromString("90000000-0000-0000-0000-000000000004");
    private static final UUID FULLSTACK_JOB_ID = UUID.fromString("90000000-0000-0000-0000-000000000005");
    private static final UUID DATA_ENGINEER_JOB_ID = UUID.fromString("90000000-0000-0000-0000-000000000006");
    private static final UUID AI_ENGINEER_JOB_ID = UUID.fromString("90000000-0000-0000-0000-000000000007");
    private static final UUID MOBILE_JOB_ID = UUID.fromString("90000000-0000-0000-0000-000000000008");
    private static final UUID SECURITY_JOB_ID = UUID.fromString("90000000-0000-0000-0000-000000000009");
    private static final UUID UIUX_JOB_ID = UUID.fromString("90000000-0000-0000-0000-000000000010");
    private static final UUID DBA_JOB_ID = UUID.fromString("90000000-0000-0000-0000-000000000011");
    private static final UUID PM_JOB_ID = UUID.fromString("90000000-0000-0000-0000-000000000012");
    private static final UUID SUPPORT_JOB_ID = UUID.fromString("90000000-0000-0000-0000-000000000013");
    private static final UUID BLOCKCHAIN_JOB_ID = UUID.fromString("90000000-0000-0000-0000-000000000014");
    private static final UUID GAME_JOB_ID = UUID.fromString("90000000-0000-0000-0000-000000000015");
    private static final UUID SRE_JOB_ID = UUID.fromString("90000000-0000-0000-0000-000000000016");
    private static final UUID BA_JOB_ID = UUID.fromString("90000000-0000-0000-0000-000000000017");
    private static final UUID IOT_JOB_ID = UUID.fromString("90000000-0000-0000-0000-000000000018");
    private static final UUID ARCHITECT_JOB_ID = UUID.fromString("90000000-0000-0000-0000-000000000019");
    private static final UUID DATA_ANALYST_JOB_ID = UUID.fromString("90000000-0000-0000-0000-000000000020");
    private static final UUID CUSTOMER_SUCCESS_JOB_ID = UUID.fromString("90000000-0000-0000-0000-000000000021");
    private static final UUID AI_PM_JOB_ID = UUID.fromString("90000000-0000-0000-0000-000000000022");
    private static final UUID CLOUD_SECURITY_JOB_ID = UUID.fromString("90000000-0000-0000-0000-000000000023");

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
            ),
            new JobSeed(
                    DATA_ENGINEER_JOB_ID,
                    "Data Engineer",
                    "Thiết kế data pipeline phục vụ dashboard tuyển dụng và báo cáo vận hành.",
                    "Tan Binh District, Ho Chi Minh City",
                    "2200 - 3200 USD",
                    2,
                    JobType.full_time,
                    "Mon - Fri, 09:00 - 18:00",
                    JobStatus.open,
                    14,
                    30,
                    Level.senior,
                    List.of("Data Engineering", "Database Administration"),
                    List.of(
                            "Xây dựng pipeline ETL đồng bộ job, ứng tuyển và analytics event.",
                            "Thiết kế mô hình dữ liệu phục vụ dashboard thời gian thực và báo cáo định kỳ."
                    ),
                    List.of(
                            "Thưởng dự án theo quý và hỗ trợ chứng chỉ dữ liệu.",
                            "Ngân sách cloud sandbox riêng cho team data."
                    ),
                    List.of(
                            "Có kinh nghiệm với SQL nâng cao, Airflow hoặc workflow orchestration.",
                            "Hiểu về data warehouse, modeling và monitoring dữ liệu."
                    )
            ),
            new JobSeed(
                    AI_ENGINEER_JOB_ID,
                    "AI Engineer (RAG Platform)",
                    "Phát triển hệ thống tìm kiếm và gợi ý công việc bằng LLM, embeddings và RAG.",
                    "Thu Duc City, Ho Chi Minh City",
                    "2400 - 3400 USD",
                    1,
                    JobType.remote,
                    "Flexible, overlap 4h with GMT+7",
                    JobStatus.open,
                    6,
                    24,
                    Level.mid,
                    List.of("Data Science & AI/ML", "Backend Development"),
                    List.of(
                            "Xây dựng API phục vụ semantic search và ranking job.",
                            "Thử nghiệm prompt, retrieval strategy và theo dõi chất lượng kết quả."
                    ),
                    List.of(
                            "Remote-first và hỗ trợ ngân sách GPU/cloud hằng tháng.",
                            "Budget hội thảo AI và khóa học chuyên sâu."
                    ),
                    List.of(
                            "Có kinh nghiệm với Python, vector database hoặc LLM app.",
                            "Biết đánh giá chất lượng retrieval, ranking hoặc recommendation."
                    )
            ),
            new JobSeed(
                    MOBILE_JOB_ID,
                    "Mobile Developer (Flutter)",
                    "Xây dựng ứng dụng ứng viên giúp tìm việc, lưu job và theo dõi trạng thái ứng tuyển.",
                    "District 2, Ho Chi Minh City",
                    "1300 - 1900 USD",
                    2,
                    JobType.full_time,
                    "Mon - Fri, 08:30 - 17:30",
                    JobStatus.open,
                    4,
                    26,
                    Level.junior,
                    List.of("Mobile Development", "Software Development"),
                    List.of(
                            "Phát triển màn hình tìm kiếm việc làm, profile ứng viên và thông báo.",
                            "Tối ưu hiệu năng, trải nghiệm người dùng và tracking analytics trên mobile."
                    ),
                    List.of(
                            "MacBook hoặc laptop Windows cấu hình cao theo nhu cầu.",
                            "Trợ cấp điện thoại và ngân sách test thiết bị thật."
                    ),
                    List.of(
                            "Có kinh nghiệm với Flutter hoặc ứng dụng mobile cross-platform.",
                            "Biết làm việc với REST API, state management và release flow."
                    )
            ),
            new JobSeed(
                    SECURITY_JOB_ID,
                    "Cybersecurity Analyst",
                    "Tăng cường bảo mật cho gateway, auth flow và hạ tầng cloud của nền tảng.",
                    "Remote - Vietnam",
                    "2000 - 2800 USD",
                    1,
                    JobType.remote,
                    "Mon - Fri, flexible",
                    JobStatus.pending,
                    2,
                    18,
                    Level.mid,
                    List.of("Cybersecurity", "System & Network Administration"),
                    List.of(
                            "Rà soát rủi ro xác thực, secret handling và phân quyền trong hệ thống.",
                            "Thiết lập baseline kiểm tra bảo mật cho CI/CD và cloud runtime."
                    ),
                    List.of(
                            "Hỗ trợ thi chứng chỉ bảo mật và phòng lab nội bộ.",
                            "Làm việc sát với DevOps và backend để xử lý security debt."
                    ),
                    List.of(
                            "Có kinh nghiệm với web security, IAM hoặc container security.",
                            "Biết đọc log, điều tra sự cố và đề xuất biện pháp giảm thiểu."
                    )
            ),
            new JobSeed(
                    UIUX_JOB_ID,
                    "Product Designer (UI/UX)",
                    "Thiết kế trải nghiệm recruiter dashboard và candidate journey nhất quán hơn.",
                    "District 1, Ho Chi Minh City",
                    "1400 - 2100 USD",
                    1,
                    JobType.full_time,
                    "Mon - Fri, 09:00 - 18:00",
                    JobStatus.closed,
                    25,
                    -5,
                    Level.mid,
                    List.of("UI/UX Design", "Frontend Development"),
                    List.of(
                            "Thiết kế luồng onboarding recruiter, dashboard summary và trang chi tiết job.",
                            "Tạo design system cơ bản để đồng bộ giữa admin, recruiter và candidate portal."
                    ),
                    List.of(
                            "Review thiết kế hàng tuần với PM và frontend lead.",
                            "Hỗ trợ license Figma chuyên nghiệp và thư viện component."
                    ),
                    List.of(
                            "Có portfolio về web app dashboard hoặc sản phẩm B2B.",
                            "Biết tổ chức user flow, information architecture và prototype."
                    )
            ),
            new JobSeed(
                    DBA_JOB_ID,
                    "Database Administrator",
                    "Tối ưu PostgreSQL, backup strategy và truy vấn tổng hợp cho nền tảng tuyển dụng.",
                    "District 7, Ho Chi Minh City",
                    "1900 - 2700 USD",
                    1,
                    JobType.full_time,
                    "Mon - Fri, 09:00 - 18:00",
                    JobStatus.open,
                    11,
                    22,
                    Level.mid,
                    List.of("Database Administration", "Backend Development"),
                    List.of(
                            "Theo dõi hiệu năng truy vấn, index và growth của dữ liệu nghiệp vụ.",
                            "Thiết kế chính sách backup/restore và kiểm tra khôi phục định kỳ."
                    ),
                    List.of(
                            "Phụ cấp trực on-call và thưởng reliability.",
                            "Môi trường có nhiều bài toán tối ưu dữ liệu thực tế."
                    ),
                    List.of(
                            "Có kinh nghiệm với PostgreSQL vận hành thực tế.",
                            "Hiểu về replication, indexing, vacuum và tuning."
                    )
            ),
            new JobSeed(
                    PM_JOB_ID,
                    "IT Project Manager",
                    "Điều phối roadmap sản phẩm tuyển dụng và kết nối giữa business với engineering.",
                    "District 4, Ho Chi Minh City",
                    "2500 - 3300 USD",
                    1,
                    JobType.full_time,
                    "Mon - Fri, 09:00 - 18:00",
                    JobStatus.open,
                    9,
                    28,
                    Level.senior,
                    List.of("IT Project Management", "Software Development"),
                    List.of(
                            "Quản lý scope, timeline và quality gate cho các mốc ra mắt tính năng.",
                            "Làm việc với stakeholder để cân bằng giữa tốc độ triển khai và độ ổn định."
                    ),
                    List.of(
                            "Thưởng theo mốc dự án và chỉ số delivery.",
                            "Làm việc trực tiếp với leadership và product owner."
                    ),
                    List.of(
                            "Có kinh nghiệm quản lý dự án phần mềm nhiều team.",
                            "Biết đọc hiểu technical trade-off và điều phối release."
                    )
            ),
            new JobSeed(
                    SUPPORT_JOB_ID,
                    "IT Support & Helpdesk",
                    "Hỗ trợ nội bộ về tài khoản, thiết bị và các sự cố vận hành văn phòng.",
                    "Go Vap District, Ho Chi Minh City",
                    "700 - 950 USD",
                    2,
                    JobType.part_time,
                    "Shift rotation, Mon - Sat",
                    JobStatus.closed,
                    18,
                    -1,
                    Level.fresher,
                    List.of("IT Support & Helpdesk", "System & Network Administration"),
                    List.of(
                            "Hỗ trợ người dùng nội bộ xử lý sự cố tài khoản, thiết bị và mạng cơ bản.",
                            "Theo dõi ticket, cập nhật tài sản CNTT và phối hợp vendor khi cần."
                    ),
                    List.of(
                            "Phụ cấp ca trực và đào tạo bài bản cho nhân sự mới.",
                            "Cơ hội chuyển hướng lên system admin sau 1-2 năm."
                    ),
                    List.of(
                            "Kỹ năng giao tiếp tốt và xử lý sự cố cơ bản.",
                            "Biết về Windows, Google Workspace hoặc M365 là lợi thế."
                    )
            ),
            new JobSeed(
                    BLOCKCHAIN_JOB_ID,
                    "Blockchain Engineer",
                    "Nghiên cứu mô hình xác thực chứng chỉ ứng viên và hồ sơ số bằng blockchain.",
                    "Remote - APAC",
                    "2600 - 3800 USD",
                    1,
                    JobType.free_lance,
                    "Project-based, 20h/week",
                    JobStatus.rejected,
                    16,
                    -3,
                    Level.senior,
                    List.of("Blockchain", "Backend Development"),
                    List.of(
                            "Đánh giá khả năng áp dụng smart contract cho chứng chỉ kỹ năng và portfolio.",
                            "Thiết kế proof of concept tích hợp với hệ thống hồ sơ ứng viên."
                    ),
                    List.of(
                            "Thanh toán theo milestone và thưởng nếu PoC đạt KPI.",
                            "Linh hoạt múi giờ, tập trung theo deliverable."
                    ),
                    List.of(
                            "Có kinh nghiệm với EVM, smart contract hoặc signing workflow.",
                            "Có thể tự đề xuất kiến trúc PoC và phân tích rủi ro."
                    )
            ),
            new JobSeed(
                    GAME_JOB_ID,
                    "Game Developer Intern",
                    "Xây dựng mini game thương hiệu phục vụ chiến dịch tuyển dụng sinh viên.",
                    "District 10, Ho Chi Minh City",
                    "300 - 500 USD",
                    2,
                    JobType.part_time,
                    "Mon - Fri, flexible for students",
                    JobStatus.pending,
                    1,
                    12,
                    Level.intern,
                    List.of("Game Development", "Frontend Development"),
                    List.of(
                            "Phát triển mini game đơn giản dùng cho landing page tuyển dụng campus.",
                            "Phối hợp với designer để tối ưu trải nghiệm chơi và tracking conversion."
                    ),
                    List.of(
                            "Linh hoạt lịch làm cho sinh viên và có mentor review hằng tuần.",
                            "Có ngân sách cho game jam nội bộ và hoạt động community."
                    ),
                    List.of(
                            "Biết Unity, C# hoặc web game là lợi thế.",
                            "Chủ động học nhanh, thích sản phẩm tương tác."
                    )
            ),
            new JobSeed(
                    SRE_JOB_ID,
                    "Site Reliability Engineer",
                    "Xây dựng nền tảng reliability cho các microservice và hệ thống quan sát vận hành.",
                    "District 1, Ho Chi Minh City",
                    "2300 - 3200 USD",
                    1,
                    JobType.remote,
                    "Mon - Fri, overlap 4h with GMT+7",
                    JobStatus.open,
                    5,
                    35,
                    Level.senior,
                    List.of("DevOps & Cloud", "System & Network Administration"),
                    List.of(
                            "Thiết kế SLI/SLO, incident runbook và capacity planning cho nền tảng.",
                            "Tối ưu logging, tracing, alerting và release safety cho môi trường production."
                    ),
                    List.of(
                            "On-call allowance, ngân sách hội thảo cloud và lab sandbox riêng.",
                            "Làm việc sát với backend, platform và security team."
                    ),
                    List.of(
                            "Có kinh nghiệm với Kubernetes, observability stack và incident response.",
                            "Biết viết automation cho rollout, rollback và recovery."
                    )
            ),
            new JobSeed(
                    BA_JOB_ID,
                    "Business Analyst (Digital Platform)",
                    "Phân tích bài toán tuyển dụng số và chuyển hóa thành luồng nghiệp vụ rõ ràng cho product team.",
                    "District 3, Ho Chi Minh City",
                    "1200 - 1800 USD",
                    1,
                    JobType.full_time,
                    "Mon - Fri, 08:30 - 17:30",
                    JobStatus.pending,
                    2,
                    16,
                    Level.mid,
                    List.of("IT Project Management", "Software Development"),
                    List.of(
                            "Làm việc với recruiter, admin và candidate để đặc tả user flow chính.",
                            "Theo dõi backlog, acceptance criteria và dữ liệu sau release."
                    ),
                    List.of(
                            "Hỗ trợ khóa học BA/PO và phụ cấp chứng chỉ chuyên môn.",
                            "Môi trường phù hợp với BA thiên về sản phẩm B2B."
                    ),
                    List.of(
                            "Có khả năng viết tài liệu nghiệp vụ và user story rõ ràng.",
                            "Biết phối hợp giữa business, design và engineering."
                    )
            ),
            new JobSeed(
                    IOT_JOB_ID,
                    "Embedded IoT Engineer",
                    "Phát triển thiết bị chấm công và đồng bộ dữ liệu vào nền tảng nhân sự nội bộ.",
                    "Hanoi, Vietnam",
                    "1800 - 2500 USD",
                    2,
                    JobType.full_time,
                    "Mon - Fri, 09:00 - 18:00",
                    JobStatus.open,
                    12,
                    27,
                    Level.mid,
                    List.of("Embedded & IoT", "Software Development"),
                    List.of(
                            "Thiết kế firmware giao tiếp với backend qua MQTT hoặc HTTP.",
                            "Làm việc với team cloud để đồng bộ telemetries và provisioning thiết bị."
                    ),
                    List.of(
                            "Phụ cấp phòng lab và ngân sách mua kit thiết bị.",
                            "Có cơ hội làm từ thiết bị tới cloud integration."
                    ),
                    List.of(
                            "Có kinh nghiệm với C/C++, ESP32 hoặc Linux embedded.",
                            "Hiểu về kết nối thiết bị, telemetry và reliability."
                    )
            ),
            new JobSeed(
                    ARCHITECT_JOB_ID,
                    "Solutions Architect",
                    "Định hình kiến trúc tích hợp cho các khách hàng enterprise sử dụng nền tảng tuyển dụng.",
                    "Remote - Vietnam",
                    "3200 - 4200 USD",
                    1,
                    JobType.remote,
                    "Mon - Fri, flexible",
                    JobStatus.closed,
                    28,
                    -7,
                    Level.senior,
                    List.of("Backend Development", "DevOps & Cloud"),
                    List.of(
                            "Tư vấn kiến trúc kết nối SSO, data export và event streaming cho khách hàng lớn.",
                            "Làm việc với engineering để xác định ranh giới mở rộng của hệ thống."
                    ),
                    List.of(
                            "Bonus theo dự án presales và ngân sách đào tạo kiến trúc cloud.",
                            "Làm việc trực tiếp với khách hàng enterprise và leadership."
                    ),
                    List.of(
                            "Có kinh nghiệm microservices, integration pattern và API governance.",
                            "Giao tiếp tốt với cả technical lẫn non-technical stakeholder."
                    )
            ),
            new JobSeed(
                    DATA_ANALYST_JOB_ID,
                    "Product Data Analyst",
                    "Phân tích hành vi ứng tuyển, hiệu quả tin tuyển dụng và funnel chuyển đổi trong nền tảng.",
                    "Da Nang, Vietnam",
                    "1300 - 1900 USD",
                    1,
                    JobType.full_time,
                    "Mon - Fri, 09:00 - 18:00",
                    JobStatus.rejected,
                    9,
                    12,
                    Level.junior,
                    List.of("Data Engineering", "Data Science & AI/ML"),
                    List.of(
                            "Xây dựng dashboard về nguồn ứng viên, tỷ lệ apply và conversion theo nhóm job.",
                            "Phối hợp product team để đánh giá hiệu quả từng release."
                    ),
                    List.of(
                            "Có mentor từ team data và ngân sách học SQL/BI.",
                            "Làm việc gần với dashboard vận hành thật của sản phẩm."
                    ),
                    List.of(
                            "Biết SQL, spreadsheet hoặc BI tool là lợi thế.",
                            "Có tư duy phân tích, cẩn thận với số liệu và giả thuyết."
                    )
            ),
            new JobSeed(
                    CUSTOMER_SUCCESS_JOB_ID,
                    "Customer Success Engineer",
                    "Hỗ trợ khách hàng triển khai, xử lý sự cố tích hợp và tối ưu trải nghiệm dùng sản phẩm.",
                    "Ho Chi Minh City, Vietnam",
                    "1100 - 1700 USD",
                    2,
                    JobType.full_time,
                    "Mon - Sat, luân phiên ca trực nhẹ",
                    JobStatus.open,
                    4,
                    21,
                    Level.mid,
                    List.of("IT Support & Helpdesk", "Software Development"),
                    List.of(
                            "Hỗ trợ khách hàng triển khai webhook, import dữ liệu và xử lý lỗi tích hợp cơ bản.",
                            "Đóng vai trò cầu nối giữa support, product và backend team."
                    ),
                    List.of(
                            "Phụ cấp trực khách hàng và bonus theo mức độ hài lòng.",
                            "Lộ trình chuyển hướng lên solutions engineer hoặc product ops."
                    ),
                    List.of(
                            "Có khả năng đọc log, phân tích API và giao tiếp tốt với khách hàng.",
                            "Biết về SQL, Postman hoặc basic scripting là lợi thế."
                    )
            ),
            new JobSeed(
                    AI_PM_JOB_ID,
                    "AI Product Manager",
                    "Dẫn dắt roadmap cho các tính năng gợi ý việc làm, matching và semantic search.",
                    "Thu Duc City, Ho Chi Minh City",
                    "2600 - 3600 USD",
                    1,
                    JobType.full_time,
                    "Mon - Fri, 09:00 - 18:00",
                    JobStatus.pending,
                    1,
                    29,
                    Level.senior,
                    List.of("IT Project Management", "Data Science & AI/ML"),
                    List.of(
                            "Xác định KPI cho recommendation, search quality và mức độ tương tác của candidate.",
                            "Làm việc với data, AI và engineering để triển khai các vòng thử nghiệm nhanh."
                    ),
                    List.of(
                            "Ngân sách hội thảo AI, sản phẩm và mentoring với leadership.",
                            "Được quyền ưu tiên backlog cho nhóm AI initiative."
                    ),
                    List.of(
                            "Có kinh nghiệm product discovery với dữ liệu hoặc AI feature.",
                            "Biết cân bằng giữa tính mới, độ ổn định và chi phí vận hành."
                    )
            ),
            new JobSeed(
                    CLOUD_SECURITY_JOB_ID,
                    "Cloud Security Engineer",
                    "Gia cố hạ tầng cloud, secret management và baseline bảo mật cho pipeline triển khai.",
                    "Remote - APAC",
                    "2400 - 3300 USD",
                    1,
                    JobType.remote,
                    "Mon - Fri, flexible",
                    JobStatus.open,
                    6,
                    19,
                    Level.senior,
                    List.of("Cybersecurity", "DevOps & Cloud"),
                    List.of(
                            "Thiết lập policy scan, secret rotation và hardening cho môi trường Docker/Kubernetes.",
                            "Phối hợp với team platform để xử lý security finding theo mức độ ưu tiên."
                    ),
                    List.of(
                            "Budget lab bảo mật riêng, hỗ trợ chứng chỉ cloud security.",
                            "Làm việc với nhiều team và có ảnh hưởng trực tiếp đến production safety."
                    ),
                    List.of(
                            "Có kinh nghiệm với CSPM, container security hoặc IAM cloud.",
                            "Biết viết policy, rule hoặc automation để giảm manual review."
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
    private final PlatformTransactionManager transactionManager;

    @Override
    public void run(ApplicationArguments args) {
        int exitCode = 0;

        try {
            TransactionTemplate transactionTemplate = new TransactionTemplate(transactionManager);
            transactionTemplate.executeWithoutResult(status -> {
                seedCategorySnapshots();
                seedJobs();
                seedFavorites();
            });
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
            LocalDateTime postedAt = now.minusDays(resolvePostedDaysAgo(seed.id(), seed.postedDaysAgo()));
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
            job.setPostedAt(postedAt);
            job.setExpiredAt(postedAt.plusDays(resolveExpirationWindowDays(seed.id(), seed.expiresInDays())));
            job.setLevel(seed.level());
            job.setRecruiterId(resolveRecruiterId(seed.id()));
            job.setDeletedAt(null);

            Job savedJob = jobRepository.save(job);

            replaceChildren(savedJob, seed.descriptions(), seed.requirements(), seed.benefits(), seed.categories());
        }
    }

    private void seedFavorites() {
        upsertFavorite(BACKEND_JOB_ID, () -> LocalDateTime.now().minusDays(4));
        upsertFavorite(DEVOPS_JOB_ID, () -> LocalDateTime.now().minusDays(2));
        upsertFavorite(AI_ENGINEER_JOB_ID, () -> LocalDateTime.now().minusDays(1));
        upsertFavorite(MOBILE_JOB_ID, () -> LocalDateTime.now().minusDays(6));
        upsertFavorite(PM_JOB_ID, () -> LocalDateTime.now().minusDays(3));
        upsertFavorite(SRE_JOB_ID, () -> LocalDateTime.now().minusDays(2));
        upsertFavorite(CLOUD_SECURITY_JOB_ID, () -> LocalDateTime.now().minusHours(18));
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

    private UUID resolveRecruiterId(UUID jobId) {
        if (List.of(BACKEND_JOB_ID, DEVOPS_JOB_ID, QA_JOB_ID, FULLSTACK_JOB_ID, DBA_JOB_ID).contains(jobId)) {
            return RECRUITER_USER_ID;
        }

        if (List.of(FRONTEND_JOB_ID, MOBILE_JOB_ID, DATA_ANALYST_JOB_ID).contains(jobId)) {
            return NOVA_RECRUITER_USER_ID;
        }

        if (List.of(DATA_ENGINEER_JOB_ID, SECURITY_JOB_ID, SRE_JOB_ID, IOT_JOB_ID).contains(jobId)) {
            return CLOUD_RECRUITER_USER_ID;
        }

        if (List.of(AI_ENGINEER_JOB_ID, UIUX_JOB_ID, PM_JOB_ID, GAME_JOB_ID, BLOCKCHAIN_JOB_ID, AI_PM_JOB_ID).contains(jobId)) {
            return PRODUCT_RECRUITER_USER_ID;
        }

        if (List.of(BA_JOB_ID, CUSTOMER_SUCCESS_JOB_ID).contains(jobId)) {
            return HORIZON_RECRUITER_USER_ID;
        }

        if (List.of(SUPPORT_JOB_ID, CLOUD_SECURITY_JOB_ID).contains(jobId)) {
            return GREEN_RECRUITER_USER_ID;
        }

        return RECRUITER_USER_ID;
    }

    private int resolvePostedDaysAgo(UUID jobId, int fallbackDaysAgo) {
        return switch (jobId.toString()) {
            case "90000000-0000-0000-0000-000000000001" -> 6;
            case "90000000-0000-0000-0000-000000000002" -> 14;
            case "90000000-0000-0000-0000-000000000003" -> 9;
            case "90000000-0000-0000-0000-000000000004" -> 48;
            case "90000000-0000-0000-0000-000000000005" -> 78;
            case "90000000-0000-0000-0000-000000000006" -> 18;
            case "90000000-0000-0000-0000-000000000007" -> 12;
            case "90000000-0000-0000-0000-000000000008" -> 24;
            case "90000000-0000-0000-0000-000000000009" -> 33;
            case "90000000-0000-0000-0000-000000000010" -> 96;
            case "90000000-0000-0000-0000-000000000011" -> 27;
            case "90000000-0000-0000-0000-000000000012" -> 16;
            case "90000000-0000-0000-0000-000000000013" -> 120;
            case "90000000-0000-0000-0000-000000000014" -> 145;
            case "90000000-0000-0000-0000-000000000015" -> 29;
            case "90000000-0000-0000-0000-000000000016" -> 5;
            case "90000000-0000-0000-0000-000000000017" -> 21;
            case "90000000-0000-0000-0000-000000000018" -> 39;
            case "90000000-0000-0000-0000-000000000019" -> 132;
            case "90000000-0000-0000-0000-000000000020" -> 87;
            case "90000000-0000-0000-0000-000000000021" -> 8;
            case "90000000-0000-0000-0000-000000000022" -> 11;
            case "90000000-0000-0000-0000-000000000023" -> 4;
            default -> fallbackDaysAgo;
        };
    }

    private int resolveExpirationWindowDays(UUID jobId, int fallbackWindowDays) {
        return switch (jobId.toString()) {
            case "90000000-0000-0000-0000-000000000001" -> 45;
            case "90000000-0000-0000-0000-000000000002" -> 60;
            case "90000000-0000-0000-0000-000000000003" -> 35;
            case "90000000-0000-0000-0000-000000000004" -> 21;
            case "90000000-0000-0000-0000-000000000005" -> 30;
            case "90000000-0000-0000-0000-000000000006" -> 75;
            case "90000000-0000-0000-0000-000000000007" -> 50;
            case "90000000-0000-0000-0000-000000000008" -> 60;
            case "90000000-0000-0000-0000-000000000009" -> 50;
            case "90000000-0000-0000-0000-000000000010" -> 40;
            case "90000000-0000-0000-0000-000000000011" -> 55;
            case "90000000-0000-0000-0000-000000000012" -> 45;
            case "90000000-0000-0000-0000-000000000013" -> 32;
            case "90000000-0000-0000-0000-000000000014" -> 28;
            case "90000000-0000-0000-0000-000000000015" -> 40;
            case "90000000-0000-0000-0000-000000000016" -> 60;
            case "90000000-0000-0000-0000-000000000017" -> 45;
            case "90000000-0000-0000-0000-000000000018" -> 80;
            case "90000000-0000-0000-0000-000000000019" -> 35;
            case "90000000-0000-0000-0000-000000000020" -> 26;
            case "90000000-0000-0000-0000-000000000021" -> 42;
            case "90000000-0000-0000-0000-000000000022" -> 48;
            case "90000000-0000-0000-0000-000000000023" -> 52;
            default -> fallbackWindowDays;
        };
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


