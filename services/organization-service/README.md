# Organization Service

NestJS service quản lý công ty, chi nhánh và danh mục ngành nghề.

## Trách nhiệm chính

- CRUD công ty
- CRUD chi nhánh
- CRUD category
- Publish snapshot event sang Kafka để các service khác đồng bộ dữ liệu tham chiếu

## Port mặc định

- HTTP: `3002`
- Kafka client/microservice: dùng cùng process
- Metrics: `/metrics`

## Phụ thuộc hạ tầng

- MySQL cho dữ liệu tổ chức
- Kafka cho snapshot event
- Jaeger/Prometheus nếu bật observability stack

## Biến môi trường chính

Xem `.env.example`.

- `DATABASE_URL`
- `JWT_SECRET`
- `JWT_REFRESH_SECRET`
- `KAFKA_CLIENT_ID`
- `KAFKA_GROUP_ID`
- `KAFKA_BROKERS`

## Chạy local

```bash
npm install
npm run start:dev
```

## Thành phần chính

- `src/modules/companies`
- `src/modules/branches`
- `src/modules/categories`
- `src/modules/kafka`

## Kiến trúc module mới

Ba module domain chính `companies`, `branches`, `categories` hiện dùng cùng một shape DDD để dễ bảo trì và refactor tiếp:

- `domain/`
  - aggregate root và repository port
- `application/use-cases/`
  - từng use case riêng cho create/get/list/update/delete hay query chuyên biệt
- `application/ports/`
  - outbound port cho metrics và Kafka publisher
- `infrastructure/persistence/`
  - TypeORM repository implementation và mapper giữa ORM entity với domain model
- `infrastructure/publishers/`
  - adapter publish snapshot event
- `infrastructure/metrics/`
  - adapter ghi Prometheus counter
- `*.service.ts`
  - facade tương thích ngược cho controller hiện tại

Nguyên tắc hiện tại:

- controller chỉ gọi facade service
- facade service chỉ orchestration qua use case
- use case chỉ phụ thuộc repository/publisher/tracker port
- TypeORM entity được giữ ở `entities/` để không làm gãy schema hay contract runtime hiện có
