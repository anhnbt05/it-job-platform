# Kịch bản demo Automation Test + Observability

## Mục tiêu

Demo theo đúng thứ tự:

1. Mở Grafana trước để cho thấy hệ thống đang chạy ổn và có dữ liệu nền.
2. Chạy automation test (smoke test) trên stack thật.
3. Quay lại Grafana để quan sát metrics, logs và dấu vết của lần test vừa chạy.

## Thành phần đã sẵn sàng trong repo

- Observability stack:
  - `Prometheus`
  - `Grafana`
  - `Loki`
  - `Promtail`
  - `Jaeger`
- Dashboard Grafana đã provision sẵn:
  - `Microservices Overview`
  - `Runtime Health`
  - `Service Logs`
  - `K6 Load Testing`
- Automation test:
  - script VPS: `scripts/dev/run-smoke-vps.sh`
  - GitHub Actions: `.github/workflows/smoke-test.yml`

## URL nên mở trước khi demo

- Frontend: `http://103.153.74.191:3000`
- Kong gateway: `http://103.153.74.191:8000`
- Grafana: `http://103.153.74.191:3005`
- Prometheus: `http://103.153.74.191:9090`
- Jaeger: `http://103.153.74.191:16686`

## Bước 1: mở observability và xem baseline

Vào Grafana, mở time range `Last 15 minutes`.

Mở lần lượt:

1. `Runtime Health`
2. `Microservices Overview`
3. `Service Logs`
4. `K6 Load Testing`

### Khi chưa chạy test, bạn nên nói gì

- Các service đang `up`.
- Request rate thấp hoặc gần như yên nếu chưa có ai thao tác.
- 5xx rate phải thấp hoặc bằng 0.
- Log vẫn có dữ liệu nền từ các request health check hoặc thao tác đăng nhập trước đó.
- Dashboard `K6 Load Testing` gần như trống hoặc chỉ có dữ liệu từ các lần test cũ.

## Bước 2: chạy smoke test

SSH vào VPS:

```bash
cd /opt/it-job/it-job-platform
bash ./scripts/dev/run-smoke-vps.sh smoke demo-smoke-001
```

Nếu bạn đã seed sẵn và không muốn script chuẩn bị lại demo data:

```bash
cd /opt/it-job/it-job-platform
PREPARE_DEMO_DATA=false bash ./scripts/dev/run-smoke-vps.sh smoke demo-smoke-001
```

Smoke test hiện tại sẽ chạy các flow chính:

- đăng nhập `admin`, `candidate`, `recruiter`
- gọi `identity`, `organization`, `job`, `application`, `dashboard`
- tạo report dashboard dạng `pdf`

## Bước 3: quay lại Grafana để quan sát sau test

### Dashboard `K6 Load Testing`

Chọn:

- `testid = demo-smoke-001`
- `scenario = smoke`

Bạn nên chỉ vào:

- `p95` và `p99` latency
- `request rate`
- `error rate`
- `checks pass rate`
- breakdown theo `service` và `operation`

Điểm quan trọng là dashboard này không chỉ cho biết test có chạy, mà còn cho biết service nào chậm hơn hoặc lỗi hơn.

### Dashboard `Microservices Overview`

Quan sát:

- request rate tăng lên ở `job-service`, `application-service`, `dashboard-service`
- latency tăng nhẹ theo tải
- 5xx rate vẫn phải giữ thấp hoặc bằng 0
- business counter của dashboard/report có thể tăng do smoke test có gọi tạo report

### Dashboard `Runtime Health`

Quan sát:

- các target vẫn `up`
- memory/uptime ổn định
- không có service nào rớt scrape target sau khi chạy test

### Dashboard `Service Logs`

Lọc theo:

- `service`
- `level`
- `status`
- hoặc thu hẹp time range vào đúng lúc chạy test

Bạn nên cho thấy:

- log đăng nhập thành công
- log request tới các API chính
- nếu có lỗi thì log sẽ hiện rất rõ theo service

## Bước 4: nếu muốn demo thuyết phục hơn

Có thể chạy thêm màn failure demo:

```bash
cd /opt/it-job/it-job-platform
bash ./scripts/dev/demo-failure-vps.sh baseline
bash ./scripts/dev/demo-failure-vps.sh inject-failure
bash ./scripts/dev/demo-failure-vps.sh run-fail
bash ./scripts/dev/demo-failure-vps.sh recover
bash ./scripts/dev/demo-failure-vps.sh rerun
```

Ý nghĩa:

- `baseline`: chụp trạng thái bình thường
- `inject-failure`: cố tình làm một service lỗi
- `run-fail`: chạy lại smoke để tạo lỗi thật
- `recover`: khôi phục service
- `rerun`: chạy lại smoke để chứng minh hệ thống hồi phục

Đây là phần rất mạnh khi demo vì nó chứng minh monitoring không phải chỉ để trang trí.

## Nếu muốn chạy từ GitHub Actions

Workflow có sẵn:

- `.github/workflows/smoke-test.yml`

Thông số nên dùng:

- `scenario = smoke`
- `test_id = demo-smoke-001`
- `fail_fast = true`

Sau khi workflow chạy xong, quay lại dashboard `K6 Load Testing` và lọc đúng `testid`.

## Kỳ vọng để coi là “ổn”

- Grafana mở được và thấy đủ 4 dashboard chính.
- Prometheus có scrape data từ toàn bộ service.
- Loki thấy log của các service.
- Chạy `run-smoke-vps.sh` xong không fail.
- Dashboard `K6 Load Testing` hiện rõ dữ liệu theo `testid`.
- `Microservices Overview` và `Service Logs` phản ánh ngay ảnh hưởng của lần test vừa chạy.

## Kết luận hiện tại

Theo cấu hình trong repo, phần `automation test + observability` hiện đã nối với nhau đúng hướng:

- k6 đẩy metric vào Prometheus bằng remote write
- Grafana đã có dashboard riêng để đọc metric test
- Promtail/Loki đã có pipeline đọc log service
- smoke test có đủ flow để tạo ra traffic có ý nghĩa

Rủi ro chính không còn nằm ở wiring, mà nằm ở runtime trên VPS:

- service nào đó đang lỗi DB hoặc env
- stack observability chưa được start đầy đủ
- dữ liệu seed trên VPS thiếu hoặc lệch

Vì vậy khi demo thật, nên luôn làm theo thứ tự:

1. Mở Grafana xem baseline
2. Chạy smoke với `test_id` mới
3. Quay lại Grafana đối chiếu ngay theo `test_id`
