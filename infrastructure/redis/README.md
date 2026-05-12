# Redis Status

Redis đã được đưa vào local infrastructure stack tại `docker-compose.yml` ở root, nhưng hiện chưa có service runtime nào trong repo phụ thuộc trực tiếp vào Redis.

Stack này được giữ sẵn cho các nhu cầu như:

- cache đọc nhiều
- rate limiting
- distributed lock
- queue/pub-sub bổ sung

Hiện tại có thể bật Redis để phục vụ phát triển hạ tầng, nhưng không phải dependency bắt buộc để các flow nghiệp vụ chính hoạt động.
