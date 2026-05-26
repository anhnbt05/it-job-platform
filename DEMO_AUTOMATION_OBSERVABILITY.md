# Kich Ban Demo He Thong + Automation Test + Observability

Tai lieu nay la kich ban demo day du tren VPS, theo dung thu tu:

1. mo dau bang tinh nang nghiep vu that
2. chuyen sang automation test
3. chot bang observability
4. ket thuc bang man failure + recovery

Muc tieu cua man demo:

- cho nguoi xem thay he thong dang giai quyet bai toan gi
- cho thay cac luong chinh dang chay that
- cho thay sau moi lan deploy co the smoke test tu dong
- cho thay khi mot service hong, he thong quan sat phat hien va khoanh vung duoc ngay

## 1. Chuan bi truoc buoi demo

Mo san 5 tab:

- Frontend: `http://<vps-domain-hoac-ip>`
- GitHub Actions: workflow `Smoke Test VPS`
- Grafana: `http://<vps-ip>:3005`
- Jaeger: `http://<vps-ip>:16686`
- Kafka UI: `http://<vps-ip>:8080`

Dang nhap Grafana:

- username: `admin`
- password: `admin`

Mo san 4 dashboard trong Grafana:

- `Automation Tests`
- `Microservices Overview`
- `Runtime Health`
- `Service Logs`

Tai khoan demo:

- Candidate: `candidate@example.com` / `candidate123`
- Recruiter: `recruiter@example.com` / `recruiter123`
- Admin: `admin@example.com` / `admin123`

Neu can chuan bi terminal VPS de chay tay:

```bash
cd /opt/it-job/it-job-platform
```

## 2. Mo dau: gioi thieu bai toan he thong

Noi ngan:

- Day la mot nen tang ho tro quy trinh tuyen dung cho candidate, recruiter va admin.
- He thong duoc tach thanh nhieu service nho, di qua gateway, va co monitoring de theo doi van hanh.
- Em se demo 2 lop:
  - lop nghiep vu nguoi dung thay duoc
  - lop van hanh giup he thong on dinh sau deploy

Khong nen noi qua sau ve kien truc ngay tu dau. Muc tieu la de nguoi xem hieu san pham truoc.

## 3. Phan 1: Demo tinh nang nghiep vu

### 3.1. Candidate flow

Mo frontend va noi:

- Dau tien em demo luong cua ung vien.
- Day la nhom nguoi dung tim viec, xem viec va theo doi don ung tuyen.

Thao tac de xuat:

1. vao trang dang ky
2. demo form dang ky nhanh
3. neu muon chac an, dang nhap bang `candidate@example.com`
4. vao trang danh sach viec lam
5. mo chi tiet 1 job
6. vao profile hoac trang applications neu co du lieu

Cau noi mau:

- Phan nay di qua `identity-service` de xac thuc.
- Sau khi dang nhap, candidate co the xem job, xem chi tiet job va theo doi du lieu lien quan den qua trinh ung tuyen.

### 3.2. Recruiter flow

Noi ngan:

- Tiep theo la luong recruiter, tuc la doanh nghiep dang bai va quan ly du lieu tuyen dung.

Thao tac de xuat:

1. dang xuat candidate
2. dang nhap `recruiter@example.com`
3. vao trang company hoac branch
4. vao trang job management
5. neu co san dashboard recruiter thi mo nhanh

Cau noi mau:

- Recruiter co the xem du lieu cong ty, chi nhanh va bai dang.
- Day la nhom chuc nang ma sau nay smoke test se di qua de kiem tra xem he thong co con phuc vu duoc luong nghiep vu chinh hay khong.

### 3.3. Admin flow

Noi ngan:

- Cuoi cung la luong admin.
- Nhom nay dung de quan ly tong quan he thong va theo doi cac thanh phan du lieu chung.

Thao tac de xuat:

1. dang xuat recruiter
2. dang nhap `admin@example.com`
3. vao dashboard tong quan
4. vao categories hoac companies neu can minh hoa du lieu nen

Cau noi mau:

- Admin la nhom nguoi dung phu hop de xem tong quan he thong.
- O phan sau, em se cho thay khong chi co dashboard nghiep vu, ma con co dashboard van hanh va quan sat.

### 3.4. Cau chot de chuyen pha

Noi ro:

- Tren day la cac luong nguoi dung chinh ma he thong dang phuc vu that.
- Van de cua team backend khong chi la viet tinh nang, ma con la dam bao moi lan deploy xong cac luong nay van song.
- Vi vay em chuyen sang phan automation test.

## 4. Phan 2: Demo automation test

### 4.1. Muc tieu

Noi ngan:

- Thay vi test tay tung man hinh sau moi lan deploy, em dung smoke test chay end-to-end tren stack that.
- Smoke test nay khong mock he thong, no goi qua gateway va cac service dang chay tren VPS.

### 4.2. Cach chay baseline

Neu demo bang terminal tren VPS:

```bash
cd /opt/it-job/it-job-platform
bash ./scripts/dev/demo-failure-vps.sh baseline
```

Neu demo bang GitHub Actions:

- mo workflow `Smoke Test VPS`
- chon:
  - `scenario = smoke`
  - `test_id = demo-ok-001`
  - `fail_fast = true`

Luc nay noi:

- Smoke test se tu bootstrap demo data can thiet truoc khi chay.
- Em dang kiem tra mot tap flow chinh cua candidate, recruiter va admin.
- Moi lan chay se co `test_id` rieng de doi chieu tren Grafana.

### 4.3. Can show gi khi smoke pass

Show:

- terminal hoac GitHub Actions bao pass
- frontend van login duoc bang candidate demo
- test id dang dung la `demo-ok-001`

Cau noi mau:

- Dieu em muon nhan manh la smoke test nay dang bao ve dung cac flow ma minh vua demo bang tay.

## 5. Phan 3: Demo observability stack

### 5.1. Grafana: Automation Tests

Vao folder dashboard `Automation Tests`.

Filter theo:

- `testid = demo-ok-001`

Show:

- request rate
- p95 latency
- error rate
- check pass / fail

Cau noi mau:

- Sau moi lan smoke test, em khong chi nhin pass hay fail.
- Em con thay duoc toc do request, do tre va ti le loi cua tung dot chay.

### 5.2. Grafana: Microservices Overview

Vao dashboard `Microservices Overview`.

Show:

- luong request tang khi smoke dang chay
- metric cua `identity-service`, `organization-service`, `job-service`, `application-service`, `dashboard-service`

Cau noi mau:

- Day la tang metric de xem service nao dang bi anh huong, service nao dang nhan tai.

### 5.3. Grafana: Runtime Health

Vao dashboard `Runtime Health`.

Show:

- cac health endpoint
- service nao dang `up`

Cau noi mau:

- Tang nay giup em nhin nhanh service nao con song truoc khi di sau vao log hay trace.

### 5.4. Grafana: Service Logs

Vao dashboard `Service Logs`.

Filter:

- `identity-service`
- `organization-service`

Show:

- log request, response, error neu co

Cau noi mau:

- Khi smoke fail, em co the di tu metric sang log de khoanh nguyen nhan rat nhanh.

### 5.5. Jaeger

Mo Jaeger.

Tim trace theo service:

- `identity-service`
- `organization-service`

Show:

- trace login
- trace goi categories hoac company

Cau noi mau:

- Trace cho em biet mot request da di qua nhung buoc nao, service nao, va nghen o dau.

### 5.6. Cau chot de chuyen sang man loi co chu dich

Noi ro:

- Den day em da cho thay khi he thong binh thuong thi automation test va observability hoat dong nhu the nao.
- Phan quan trong hon la khi mot service hong, he thong co phat hien va khoanh vung duoc khong.

## 6. Phan 4: Failure demo

Day la man thuyet phuc nhat.

### 6.1. Inject loi

Neu chay tay tren VPS:

```bash
cd /opt/it-job/it-job-platform
bash ./scripts/dev/demo-failure-vps.sh inject-failure
```

Lenh nay se stop `organization-service`.

Noi ngan:

- Em co tinh tao mot su co that bang cach tat `organization-service`.
- Muc tieu la xem automation test va observability co phat hien ngay khong.

### 6.2. Chay smoke fail co chu dich

```bash
cd /opt/it-job/it-job-platform
bash ./scripts/dev/demo-failure-vps.sh run-fail
```

Neu chay bang GitHub Actions thay cho terminal:

- chay workflow `Smoke Test VPS`
- dat `test_id = demo-fail-001`

### 6.3. Can show gi khi loi xay ra

1. terminal hoac GitHub Actions fail that
2. Grafana `Automation Tests`
   - filter `testid = demo-fail-001`
   - show error rate tang
3. Grafana `Runtime Health`
   - service health mat di hoac request fail
4. Grafana `Service Logs`
   - filter `organization-service`
   - show service down, 5xx hoac loi request
5. Jaeger
   - trace flow `organization` bi fail
   - hoac thieu trace binh thuong

Cau noi mau:

- Luc nay em khong can cho nguoi dung than phien moi biet he thong co van de.
- Smoke test phat hien ngay.
- Metric cho em biet co loi.
- Log cho em biet service nao dang gap van de.
- Trace cho em thay request hong o dau.

## 7. Phan 5: Recovery demo

### 7.1. Khoi phuc service

```bash
cd /opt/it-job/it-job-platform
bash ./scripts/dev/demo-failure-vps.sh recover
```

Lenh nay se:

- start lai `organization-service`
- doi health endpoint len lai
- doi Kong route phuc hoi

### 7.2. Chay lai smoke

```bash
cd /opt/it-job/it-job-platform
bash ./scripts/dev/demo-failure-vps.sh rerun
```

Neu chay bang GitHub Actions:

- chay workflow `Smoke Test VPS`
- dat `test_id = demo-recover-001`

### 7.3. Can show gi khi recover

Show:

- smoke pass lai
- Grafana `Automation Tests`: filter `testid = demo-recover-001`
- Grafana `Runtime Health`: service tro lai binh thuong
- `Microservices Overview`: request va latency on dinh lai

Cau noi mau:

- Sau khi recover, em chay lai dung bo smoke test cu.
- Ket qua pass lai cho thay he thong da quay ve trang thai phuc vu on dinh.

## 8. Neu muon chay mot mach

Neu khong muon bam tung buoc, co the chay:

```bash
cd /opt/it-job/it-job-platform
bash ./scripts/dev/demo-failure-vps.sh full
```

Lenh nay se tu dong chay:

1. baseline pass
2. stop `organization-service`
3. smoke fail co chu dich
4. start lai service
5. smoke pass lai

Khuyet diem cua cach nay la it thoi gian dung lai de giai thich tren Grafana va Jaeger. Vi vay khi demo truoc hoi dong, nen bam tung buoc rieng de de dieu tiet.

## 9. Cau chot de ket thuc bai demo

Co the ket bang 4 y:

- He thong co tinh nang nghiep vu that cho candidate, recruiter va admin.
- Sau deploy, co smoke test end-to-end de bao ve cac flow chinh.
- He thong co du metrics, logs va traces de quan sat van hanh.
- Khi mot service hong, co the phat hien nhanh, khoanh vung nhanh va xac nhan recover bang test that.

## 10. Kich ban noi mau trong 2-3 phut cuoi

Co the noi nhu sau:

- Ban dau em demo cac luong nghiep vu de cho thay he thong dang phuc vu bai toan that.
- Sau do em chuyen sang smoke test de chung minh rang sau moi lan deploy, cac luong quan trong van duoc kiem tra tu dong.
- Tiep theo em mo Grafana va Jaeger de cho thay pass/fail khong phai chi la mot dong log, ma minh con quan sat duoc metric, log va trace.
- Cuoi cung em co tinh tat mot service, chay lai smoke test va cho thay he thong phat hien ngay, sau do recover va xac nhan he thong on dinh tro lai.

## 11. Fallback neu co su co trong luc demo

- Neu frontend bi xoay lau:
  - refresh trang
  - dang nhap lai bang tai khoan seed
- Neu smoke fail ngay o baseline:
  - chay lai:

```bash
cd /opt/it-job/it-job-platform
bash ./scripts/dev/run-smoke-vps.sh smoke demo-ok-001
```

- Neu `run-fail` lai pass:
  - kiem tra xem `organization-service` da thuc su stop chua:

```bash
docker ps --filter name=organization-service
```

- Neu Grafana khong thay metric moi:
  - doi them vai chuc giay
  - kiem tra dashboard co dang filter dung `testid` khong

## 12. Thu tu de it rui ro nhat

Neu muon bai demo gon ma van rat thuyet phuc, thu tu khuyen nghi la:

1. candidate flow
2. recruiter flow
3. admin flow
4. smoke baseline pass
5. Grafana + Jaeger
6. inject failure
7. smoke fail
8. recover
9. smoke pass lai

Day la thu tu de nguoi xem di tu "he thong nay lam duoc gi" sang "he thong nay van hanh vung nhu the nao".
