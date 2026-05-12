# Notification Service

NestJS service xử lý email và thông báo người dùng.

## Trách nhiệm chính

- Nhận event `email.send` từ Kafka và đưa vào queue job
- Gửi email qua Nodemailer + strategy theo loại email
- Nhận event `notification.create` và lưu thông báo người dùng
- Cung cấp API đọc/xóa/đánh dấu đã đọc thông báo

## Port mặc định

- HTTP: `3003`
- Kafka consumer: dùng cùng process
- Metrics: `/metrics`

## Phụ thuộc hạ tầng

- PostgreSQL cho notification store
- Kafka cho event intake
- Graphile Worker cho background job gửi email
- Jaeger/Prometheus nếu bật observability stack

## Biến môi trường chính

Xem `.env.example`.

- `DATABASE_URL`
- `KAFKA_CLIENT_ID`
- `KAFKA_GROUP_ID`
- `KAFKA_BROKERS`
- `MAIL_HOST`
- `MAIL_PORT`
- `MAIL_USER`
- `MAIL_PASS`
- `MAIL_FROM`
- `FRONTEND_LOGIN_URL`

## Chạy local

```bash
npm install
npm run start:dev
```

## Thành phần chính

- `src/modules/emails`
- `src/modules/jobs`
- `src/modules/notifications`
- `src/modules/databases`
