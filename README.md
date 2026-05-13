# IT Job Platform Backend

Monorepo backend cho nen tang tim viec lam nganh IT tai Viet Nam. Repo nay di cung frontend tai `../it-job-platform-fe`.

## Muc tieu cua README nay

README nay uu tien mot muc tieu: giup ban dung duoc ban demo local nhanh, on dinh va it do vo nhat.

Neu can runbook ngan gon cho buoi trinh bay, xem them [DEMO.md](./DEMO.md).

## Kien truc nhanh

- `identity-service` (`3001`): auth, user, profile, candidate, recruiter
- `organization-service` (`3002`): company, branch, category
- `notification-service` (`3003`): notification, email
- `job-service` (`8082`): dang tin va quan ly job
- `application-service` (`8083`): workflow ung tuyen
- `dashboard-service` (`8084`): tong hop bao cao
- `gateway/kong` (`8000`): API gateway de frontend goi

## Dieu kien can

- Docker Desktop
- Node.js 20+
- npm 10+
- Java 17
- Maven 3.9+

## Port local mac dinh

- Frontend: `3000`
- Identity service: `3001`
- Organization service: `3002`
- Notification service: `3003`
- Job service: `8082`
- Application service: `8083`
- Dashboard service: `8084`
- Kong proxy: `8000`
- Kafka UI: `8080`
- Prometheus: `9090`
- Grafana: `3005`
- Jaeger: `16686`

## 1. Tao env cho cac service Nest

Copy cac file mau sau thanh `.env`:

- `services/identity-service/.env.example`
- `services/organization-service/.env.example`
- `services/notification-service/.env.example`

Ghi chu:

- 3 service Spring Boot hien da co default trong `application.yml`, khong bat buoc phai co `.env`.
- Frontend co file mau rieng trong repo `it-job-platform-fe/.env.example`.

## 2. Khoi dong ha tang va gateway

Chay trong root `it-job-platform`:

```powershell
docker compose up -d
```

Compose nay bat:

- PostgreSQL / MySQL / MongoDB
- Kafka + Kafka UI
- Redis
- Prometheus / Grafana / Loki / Jaeger
- Kong Gateway

## 3. Seed du lieu demo

Windows PowerShell:

```powershell
.\scripts\db\seed.ps1
```

Bash:

```bash
./scripts/db/seed.sh
```

Script seed se:

- migrate + seed `organization-service`
- migrate + seed `identity-service`
- migrate + seed `notification-service`
- seed `job-service`
- seed `application-service`

Neu chi muon seed lai mot service:

```powershell
.\scripts\db\seed.ps1 identity-service
```

## 4. Chay cac app service

Mo 6 terminal.

Node/Nest:

```powershell
cd services\identity-service
npm run start:dev
```

```powershell
cd services\organization-service
npm run start:dev
```

```powershell
cd services\notification-service
npm run start:dev
```

Spring Boot:

```powershell
cd services\job-service
mvn spring-boot:run
```

```powershell
cd services\application-service
mvn spring-boot:run
```

```powershell
cd services\dashboard-service
mvn spring-boot:run
```

## 5. Kiem tra nhanh backend da san sang demo

- `http://localhost:8000/identity` phan hoi qua Kong
- `http://localhost:8080` mo duoc Kafka UI
- `http://localhost:3005` mo duoc Grafana
- 6 service boot khong crash

## 6. Tai khoan demo da seed san

- Admin: `admin@example.com` / `admin123`
- Recruiter: `recruiter@example.com` / `recruiter123`
- Candidate: `candidate@example.com` / `candidate123`

Frontend login page da co nut dien nhanh 3 tai khoan nay.

## 7. Luong demo de xuat

1. Dang nhap `candidate@example.com` va demo tim viec.
2. Dang nhap `recruiter@example.com` va demo quan ly bai dang.
3. Dang nhap `admin@example.com` va demo dashboard, categories, companies.

## 8. Ngoai pham vi demo co ban

- Tinh nang gui email can cau hinh SMTP thuc te
- Tinh nang upload avatar / resume can cau hinh ImageKit thuc te
- Quan sat metrics/logs da co stack local, nhung khong bat buoc cho demo co ban

## 9. Luu y quan trong

- Kong dang route vao `host.docker.internal`, vi vay app services duoc ky vong chay tren may host.
- Neu dung Windows, `scripts/db/seed.ps1` se tien hon `seed.sh`.
- Neu `mvn` chua co trong PATH, cac Spring services va script seed cho Java se khong chay duoc.
