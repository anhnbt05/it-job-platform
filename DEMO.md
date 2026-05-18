# Demo Runbook

Tai lieu demo automation test + observability tren VPS nam o [DEMO_AUTOMATION_OBSERVABILITY.md](/E:/it-job/it-job-platform/DEMO_AUTOMATION_OBSERVABILITY.md).
File nay da gom day du kich ban bang tieng Viet: mo dau bang tinh nang he thong, sau do sang automation test, observability, failure demo va recovery.

Tai lieu nay danh cho luc can dung nhanh ban demo local.

## 1. Truoc buoi demo

- Docker Desktop dang chay
- Node.js 20+
- Java 17
- Maven 3.9+
- Da copy cac file `.env.example` thanh `.env` cho:
  - `services/identity-service`
  - `services/organization-service`
  - `services/notification-service`
  - `../it-job-platform-fe`

## 2. Khoi dong backend

Trong `it-job-platform`:

```powershell
docker compose up -d
.\scripts\db\seed.ps1
```

Mo 6 terminal va chay:

```powershell
cd services\identity-service; npm run start:dev
cd services\organization-service; npm run start:dev
cd services\notification-service; npm run start:dev
cd services\job-service; mvn spring-boot:run
cd services\application-service; mvn spring-boot:run
cd services\dashboard-service; mvn spring-boot:run
```

## 3. Khoi dong frontend

Trong `it-job-platform-fe`:

```powershell
npm run dev
```

Frontend: [http://localhost:3000](http://localhost:3000)

## 4. Tai khoan demo

- Admin: `admin@example.com` / `admin123`
- Recruiter: `recruiter@example.com` / `recruiter123`
- Candidate: `candidate@example.com` / `candidate123`

Login page da co san nut dien nhanh 3 tai khoan nay.

## 5. Thu tu demo de it rui ro

1. Dang nhap `candidate@example.com`, vao `Tim kiem viec lam`.
2. Dang nhap `recruiter@example.com`, vao `Quan ly bai dang`.
3. Dang nhap `admin@example.com`, vao `Bang dieu khien he thong`.

## 6. Neu co van de

- Frontend khong goi duoc API:
  - Kiem tra `NEXT_PUBLIC_API_URL=http://localhost:8000`
  - Kiem tra Kong dang chay o port `8000`
- Login fail:
  - Chay lai seed: `.\scripts\db\seed.ps1 identity-service`
- Recruiter/Admin khong co du lieu:
  - Chay lai seed:
    - `.\scripts\db\seed.ps1 job-service`
    - `.\scripts\db\seed.ps1 application-service`

## 7. Ngoai pham vi demo co ban

- Tinh nang gui email can cau hinh SMTP thuc te
- Tinh nang upload avatar / resume can cau hinh ImageKit thuc te
