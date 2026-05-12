# IT Job Platform

Monorepo cho nền tảng tuyển dụng IT theo hướng microservices.

## Service map

- `identity-service` (`3001`): auth, user profile, candidate data
- `organization-service` (`3002`): companies, branches, categories
- `notification-service` (`3003`): emails, notifications
- `job-service` (`8082`): job posting và thống kê jobs
- `application-service` (`8083`): application workflow trên MongoDB
- `dashboard-service` (`8084`): tổng hợp báo cáo từ job/application services
- `gateway/kong` (`8000`): API gateway cho toàn bộ service

## Hạ tầng local

Root `docker-compose.yml` dùng để chạy các thành phần hạ tầng và gateway:

- Kafka + Kafka UI
- PostgreSQL / MySQL / MongoDB
- Redis
- Prometheus / Grafana / Loki / Jaeger
- Kong Gateway

Lưu ý: compose ở root hiện tập trung vào **infrastructure + gateway**. App services được kỳ vọng chạy local từ từng thư mục service.

## Khởi động nhanh

```bash
docker compose up -d
```

Sau đó chạy từng service từ thư mục tương ứng.

Thứ tự khuyến nghị để local end-to-end ổn định:

1. `docker compose up -d` ở root để bật database, Kafka, Redis, observability, Kong.
2. Chạy 3 Nest services:
   - `services/identity-service`
   - `services/organization-service`
   - `services/notification-service`
3. Chạy 3 Spring services:
   - `services/job-service`
   - `services/application-service`
   - `services/dashboard-service`
4. Mở Kong/Grafana/Kafka UI để kiểm tra routing, metrics, logs.

Node/Nest services:

```bash
npm install
npm run start:dev
```

Spring services:

```bash
mvn spring-boot:run
```

## CI coverage

Mỗi service hiện đã có `Jenkinsfile` riêng trong chính thư mục service:

- `identity-service`: Node/Nest pipeline với `npm ci`, test, build, Docker image
- `organization-service`: Node/Nest pipeline với `npm ci`, test, build, Docker image
- `notification-service`: Node/Nest pipeline với `npm ci`, test, build, Docker image
- `job-service`: Maven test, package, Docker image
- `application-service`: Maven test, package, Docker image
- `dashboard-service`: Maven test, package, Docker image

Giả định hiện tại:

- Jenkins agent chạy Linux
- agent có sẵn `docker`
- Node services cần `npm`
- Spring services cần `mvn`

## Hạ tầng và port mặc định

- Kong proxy: `8000`
- Kong admin: `8001`
- Kafka UI: `8080`
- Prometheus: `9090`
- Grafana: `3005`
- Jaeger: `16686`
- Identity DB: `5432`
- Job DB: `5433`
- Notification DB: `5434`
- Application Mongo: `27018`
- Organization MySQL: `3306`
- Redis: `6379`

## Ghi chú

- `dashboard-service` hiện là stateless aggregator, không cần database riêng.
- `infrastructure/databases/dasboard-db` được giữ lại để tránh làm gãy tham chiếu cũ trong repo history, nhưng không còn là DB active.
- `infrastructure/redis` đã có sẵn cho các use case cache/queue trong tương lai, hiện chưa có service runtime phụ thuộc trực tiếp.
- Observability dashboards được provision sẵn trong `infrastructure/observability`; xem thêm `infrastructure/observability/README.md`.

## Done Locally Checklist

Có thể xem local stack là "khá hoàn chỉnh" khi các mục sau đều pass:

- `docker compose up -d` ở root chạy sạch, không container infra nào crash loop
- cả 6 service boot thành công với env local hiện tại
- Kong route được ít nhất `identity` và `organization`
- Prometheus scrape đủ 6 target app
- Grafana xem được dashboard metrics và log panels
- Kafka topic được tạo và consumer/producer chính hoạt động
- k6 smoke test trong `infrastructure/load-testing` chạy qua các flow chính
- 6 `Jenkinsfile` đều build được trên Linux agent có Docker
