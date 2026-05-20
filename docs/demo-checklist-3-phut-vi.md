# Checklist demo 3 phút: Automation Test + Observability

## Mục tiêu

Trong 3 phút, cần chứng minh 3 ý:

1. Hệ thống đang chạy thật.
2. Observability đang thu metric và log thật.
3. Automation test tạo traffic thật và được phản ánh ngay trên dashboard.

## Chuẩn bị trước khi demo

- Frontend: `http://103.153.74.191:3000`
- Grafana: `http://103.153.74.191:3005`
- Prometheus: `http://103.153.74.191:9090`
- Jaeger: `http://103.153.74.191:16686`

Time range trong Grafana:

- `Last 15 minutes`

Test ID nên dùng để demo dữ liệu đã có sẵn:

- `demo-observability-003`

## Kịch bản nói

### 1. Mở đầu 30 giây

Mở `Grafana` và nói:

- đây là stack observability của hệ thống
- metrics đi qua `Prometheus`
- logs đi qua `Loki`
- traces có thể xem ở `Jaeger`

### 2. Chứng minh hệ thống đang sống 30 giây

Mở dashboard `Runtime Health`.

Chỉ vào:

- các service chính đều `UP`
- có đầy đủ `identity`, `organization`, `notification`, `job`, `application`, `dashboard`

Nếu cần chắc hơn:

- mở `Prometheus -> Status -> Targets`

### 3. Chứng minh có log thật 30 giây

Mở dashboard `Service Logs`.

Lọc theo:

- `service = identity-service`
- hoặc `service = organization-service`

Nói:

- đây là log HTTP thật
- có label `service`, `event`, `method`, `status`
- có thể dùng để truy vết request lỗi hoặc request chậm

### 4. Chứng minh automation test đã tạo traffic thật 45 giây

Mở dashboard `Performance Test`.

Chọn:

- `testid = demo-observability-003`

Chỉ vào:

- `Checks Pass Rate = 100%`
- `Error Rate = 0%`
- `P95`, `P99`
- bảng theo `service` và `operation`

Điểm nên nói:

- đây không phải test giả
- smoke đã đi qua login, organization, job, application, dashboard report

### 5. Chứng minh metric tổng hệ thống thay đổi theo test 45 giây

Mở `Microservices Overview`.

Chỉ vào:

- request rate tăng theo lần test
- latency của các service có khác nhau
- có thể nhìn ra service nào là bottleneck nếu xảy ra sự cố

### 6. Kết luận 30 giây

Chốt bằng 3 ý:

- hệ thống có automation test thật
- observability không chỉ để trang trí, vì nhìn thấy được cả metric lẫn log
- khi có lỗi, dashboard và logs chỉ ra được service gặp vấn đề

## Nếu muốn chạy lại live ngay trước mặt giảng viên

```bash
cd /opt/it-job/it-job-platform
PREPARE_DEMO_DATA=false bash ./scripts/dev/run-smoke-vps.sh smoke demo-live-001
```

Sau đó vào lại `Performance Test` và chọn:

- `testid = demo-live-001`

## Lưu ý quan trọng

- Nếu vừa mới restart service, đợi `job-service` ổn định hẳn rồi mới chạy smoke.
- Nếu dashboard `Performance Test` chưa hiện ngay, refresh sau vài giây.
- Nếu `Service Logs` ít dữ liệu, thu hẹp time range vào đúng lúc vừa chạy smoke.
