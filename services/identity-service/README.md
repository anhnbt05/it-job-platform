# Identity Service

NestJS service cho xác thực, hồ sơ người dùng và dữ liệu ứng viên.

## Trách nhiệm chính

- Đăng ký, đăng nhập, refresh token, quên mật khẩu, OTP
- Hồ sơ người dùng và cập nhật trạng thái tài khoản
- Upload avatar/CV qua ImageKit
- Kinh nghiệm làm việc của ứng viên
- Đồng bộ `company/branch snapshot` từ Kafka để phục vụ dữ liệu tham chiếu cục bộ

## Port mặc định

- HTTP: `3001`
- Kafka consumer: dùng cùng process qua Nest microservice
- Metrics: `/metrics`

## Phụ thuộc hạ tầng

- PostgreSQL cho dữ liệu chính
- Kafka cho event-driven sync
- Jaeger/Prometheus nếu bật observability stack

## Biến môi trường chính

Xem `.env.example`.

- `DATABASE_URL`
- `JWT_SECRET`
- `JWT_REFRESH_SECRET`
- `KAFKA_CLIENT_ID`
- `KAFKA_GROUP_ID`
- `KAFKA_BROKERS`
- `IMAGEKIT_PUBLIC_KEY`
- `IMAGEKIT_PRIVATE_KEY`
- `IMAGEKIT_URL_ENDPOINT`

## Chạy local

```bash
npm install
npm run start:dev
```

## Thành phần chính

- `src/modules/auth`
- `src/modules/users`
- `src/modules/uploads`
- `src/modules/work-experiences`
- `src/modules/companies`
- `src/modules/kafka`
