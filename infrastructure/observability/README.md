# Observability Stack

Stack local trong thư mục này gồm:

- `prometheus`: scrape metrics từ Nest và Spring services
- `grafana`: tự động load dashboards từ `grafana/dashboards`
- `loki` + `promtail`: thu thập và truy vấn log
- `jaeger`: sẵn cổng cho tracing nếu bật sau
- `runtime-logs/`: thư mục log dùng chung để promtail scrape khi app chạy local trên host

## Dashboards đã provision

- `Microservices Overview`
  - request rate, p95 latency, 5xx rate
  - business counters cho Nest và Spring services
- `Runtime Health`
  - RSS memory cho Nest
  - JVM heap/uptime cho Spring
  - tình trạng scrape target
- `Service Logs`
  - HTTP request logs
  - warning/error logs
  - bộ đếm lỗi trong 1 giờ gần nhất
- `Automation Test`
  - tổng hợp cả 3 suite `api-automation`, `ui-e2e`, `k6-load-testing`
  - phần Loki: pass/fail, failure rate, duration trend, log chi tiết từng lần chạy
  - phần Prometheus/k6: p95 latency, error rate, checks pass rate, request rate
  - lọc theo `suite`, `testid`, `scenario`, `service`

## Log parsing

`promtail` hiện parse JSON log line và đẩy một số field thành label:

- `service`
- `level`
- `event`
- `method`
- `path`
- `status`
- `suite`
- `kind`
- `source`

Các field này khớp với logger JSON của Nest services và request logging filter của Spring services.

## Host log ingestion

- Nest services tự động ghi JSON logs vào `runtime-logs/<service>.log`.
- Spring services tự động ghi HTTP request logs vào `runtime-logs/<service>.log`.
- `promtail` mount thư mục `runtime-logs` vào container và scrape job `host-app`.
- Trên VPS, `promtail` ưu tiên ingest log từ `runtime-logs` của stack IT Job để tránh quét toàn bộ Docker logs và làm Loki quá tải.

## Lưu ý runtime

- Metrics hoạt động ngay cả khi app services chạy local ngoài Docker, vì Prometheus scrape qua `host.docker.internal`.
- Log panels của Loki giờ đọc được cả Docker container logs lẫn log files trong `runtime-logs`.
