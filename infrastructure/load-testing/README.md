# Load Testing

Thư mục này dùng bộ kịch bản performance test để chạy smoke, spike và stress test dựa trên endpoint thật trong source code.

## Flows hiện có

- `smoke`
  - đăng nhập bằng 3 user seed: `candidate`, `recruiter`, `admin`
  - gọi các read flow chính của `identity`, `organization`, `job`, `application`, `dashboard`
  - tạo 1 report dashboard dạng `pdf`
- `spike`
  - tăng đột biến số lượng VU trong thời gian ngắn
  - mix candidate/recruiter/admin journeys
- `stress`
  - tăng tải dần rồi giữ tải lâu hơn
  - mix candidate/recruiter/admin journeys

## Seed data mặc định

Các giá trị mặc định lấy từ source code seed hiện có:

- `admin@example.com` / `admin123`
- `candidate@example.com` / `candidate123`
- `recruiter@example.com` / `recruiter123`
- company id: `11111111-1111-1111-1111-111111111111`
- branch id: `22222222-2222-2222-2222-222222222222`
- candidate user id: `44444444-4444-4444-4444-444444444444`
- recruiter user id: `66666666-6666-6666-6666-666666666666`
- open job id: `90000000-0000-0000-0000-000000000001`

## Base URLs

Mặc định bộ performance test sẽ gọi service nội bộ qua Docker network:

- `identity-service` và `organization-service` đi qua Kong:
  - `http://kong-gateway:8000/identity`
  - `http://kong-gateway:8000/organization`
- `job-service`, `application-service`, `dashboard-service` gọi trực tiếp:
  - `http://job-service:8082/api`
  - `http://application-service:8083/api`
  - `http://dashboard-service:8084/api`

Nếu muốn chạy từ môi trường khác, bạn chỉ cần override các biến `*_BASE_URL`.

## Cách chạy

Chạy smoke:

```bash
cd infrastructure/load-testing
TEST_ID=smoke-local ./run.sh smoke
```

Chạy smoke trên VPS stack đang chạy sẵn:

```bash
cd /opt/it-job/it-job-platform
bash ./scripts/dev/run-k6-vps.sh smoke demo-smoke-001
```

Mặc định script này sẽ dùng luôn dữ liệu đang có trên VPS và không seed lại.
Nếu bạn muốn chủ động bootstrap lại demo data trước khi chạy:

```bash
cd /opt/it-job/it-job-platform
PREPARE_DEMO_DATA=true bash ./scripts/dev/run-k6-vps.sh smoke demo-smoke-001
```

Chạy spike:

```bash
SCENARIO=spike TEST_ID=spike-local PEAK_VUS=30 docker compose up --abort-on-container-exit --exit-code-from k6
```

Chạy stress:

```bash
SCENARIO=stress TEST_ID=stress-local PEAK_VUS=25 docker compose up --abort-on-container-exit --exit-code-from k6
```

## Biến môi trường hay dùng

- `SCENARIO`
- `TEST_ID`
- `PEAK_VUS`
- `GATEWAY_BASE_URL`
- `IDENTITY_BASE_URL`
- `ORGANIZATION_BASE_URL`
- `JOB_BASE_URL`
- `APPLICATION_BASE_URL`
- `DASHBOARD_BASE_URL`
- `ADMIN_EMAIL`, `ADMIN_PASSWORD`
- `CANDIDATE_EMAIL`, `CANDIDATE_PASSWORD`
- `RECRUITER_EMAIL`, `RECRUITER_PASSWORD`
- `FAIL_FAST=true`
- `K6_PROMETHEUS_RW_TREND_STATS`

## Lưu ý

- Bộ performance test đang dùng output `experimental-prometheus-rw`, nên Prometheus cần bật remote write receiver.
- Mỗi run sẽ được gắn tag `testid=<TEST_ID>` và `suite=<SCENARIO>` để lọc trên dashboard Grafana.
- Với `spike` và `stress`, có thể override tải đỉnh bằng `PEAK_VUS`; để trống thì dùng default trong scenario.
- Dashboard Grafana cho performance test nằm trong folder `Automation Tests`, ví dụ `infrastructure/observability/grafana/dashboards/automation/performance-smoke.json`.
- Load test giả định các service target đã được chạy local và có seed data tương ứng.
- Trên VPS, `run-k6-vps.sh` sẽ dùng network nội bộ `it-job-network` và `observability`.
- Workflow `Performance Test VPS` mặc định không seed lại; chỉ khi bật input `prepare_demo_data` thì mới migrate/seed trước khi chạy.
