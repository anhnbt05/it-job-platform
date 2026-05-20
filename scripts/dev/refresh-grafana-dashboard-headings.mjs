import fs from "node:fs";

const dashboardConfigs = [
  {
    path: "E:/it-job/it-job-platform/infrastructure/observability/grafana/dashboards/core/microservices.json",
    title: "Backend Overview",
    description:
      "Theo doi luu luong, do tre, loi 5xx va business events cua cum backend trong luc demo nghiep vu.",
    markdown: [
      "## Backend Overview",
      "",
      "Muc dich: theo doi traffic, latency, error va business events cua backend.",
      "",
      "Nguon du lieu: `Prometheus`.",
      "",
      "Dung khi demo: chay nghiep vu hoac load/performance test de xem service nao dang noi bat ve do tre va loi.",
    ].join("\n"),
  },
  {
    path: "E:/it-job/it-job-platform/infrastructure/observability/grafana/dashboards/core/system.json",
    title: "System Health",
    description:
      "Tong quan process health, memory va scrape availability cua he thong observability va backend.",
    markdown: [
      "## System Health",
      "",
      "Muc dich: theo doi suc khoe process, memory va kha nang scrape metric cua toan he thong.",
      "",
      "Nguon du lieu: `Prometheus`.",
      "",
      "Dung khi demo: xac nhan service song, memory on dinh va observability van thu thap du lieu binh thuong.",
    ].join("\n"),
  },
  {
    path: "E:/it-job/it-job-platform/infrastructure/observability/grafana/dashboards/core/service-logs.json",
    title: "Backend Service Logs",
    description:
      "Tap trung vao log HTTP, warning va error cua backend runtime. Dashboard nay co chu y loai bo automation-tests.",
    markdown: [
      "## Backend Service Logs",
      "",
      "Muc dich: xem log runtime cua backend, nhat la request HTTP, warning va error.",
      "",
      "Nguon du lieu: `Loki`.",
      "",
      "Luu y: dashboard nay **khong** hien log `automation-tests`; no chi tap trung vao service backend that.",
    ].join("\n"),
  },
  {
    path: "E:/it-job/it-job-platform/infrastructure/observability/grafana/dashboards/automation/api-automation.json",
    title: "API Automation Test",
    description:
      "Ket qua workflow API automation tren GitHub Actions, duoc ghi vao Loki de phuc vu demo va doi chieu nhanh.",
    markdown: [
      "## API Automation Test",
      "",
      "Muc dich: theo doi ket qua pass/fail cua workflow API automation.",
      "",
      "Nguon du lieu: `Loki` (`automation_test_result`).",
      "",
      "Dung khi demo: chay workflow API test tren GitHub Actions, sau do doi chieu so luot chay, trang thai va log ket qua moi nhat.",
    ].join("\n"),
  },
  {
    path: "E:/it-job/it-job-platform/infrastructure/observability/grafana/dashboards/automation/ui-e2e-automation.json",
    title: "UI E2E Test",
    description:
      "Ket qua workflow UI end-to-end tren GitHub Actions, nham chung minh giao dien va luong nguoi dung chay tu dau den cuoi.",
    markdown: [
      "## UI E2E Test",
      "",
      "Muc dich: theo doi ket qua pass/fail cua workflow UI end-to-end.",
      "",
      "Nguon du lieu: `Loki` (`automation_test_result`).",
      "",
      "Dung khi demo: chay workflow UI E2E, sau do mo dashboard nay de chung minh luong giao dien duoc kiem tra tu dau den cuoi.",
    ].join("\n"),
  },
  {
    path: "E:/it-job/it-job-platform/infrastructure/observability/grafana/dashboards/performance/performance-smoke.json",
    title: "Performance Smoke",
    description:
      "Dashboard danh cho smoke performance run. Doc theo test id de xem run status, latency, traffic va error cua tung service.",
    markdown: [
      "## Performance Smoke",
      "",
      "Muc dich: xem ket qua smoke performance theo tung `Performance Test ID`.",
      "",
      "Nguon du lieu: `Prometheus` (metric k6) va `Loki` (run status).",
      "",
      "Dung khi demo: chon dung `Performance Test ID`, sau do doi chieu run status, p95, traffic va loi theo service.",
    ].join("\n"),
  },
  {
    path: "E:/it-job/it-job-platform/infrastructure/observability/grafana/dashboards/performance/performance-spike.json",
    title: "Performance Spike",
    description:
      "Dashboard danh cho spike performance run. Tap trung vao kha nang hap thu dot bien tai tai o tung service.",
    markdown: [
      "## Performance Spike",
      "",
      "Muc dich: xem he thong ung xu the nao khi tai tang dot bien.",
      "",
      "Nguon du lieu: `Prometheus` (metric k6) va `Loki` (run status).",
      "",
      "Dung khi demo: chon dung `Performance Test ID`, sau do so latency, traffic va error theo service khi peak VUs tang nhanh.",
    ].join("\n"),
  },
  {
    path: "E:/it-job/it-job-platform/infrastructure/observability/grafana/dashboards/performance/performance-stress.json",
    title: "Performance Stress",
    description:
      "Dashboard danh cho stress performance run. Dung de quan sat do tre va su on dinh khi he thong bi ep tai manh hon va lau hon.",
    markdown: [
      "## Performance Stress",
      "",
      "Muc dich: xem he thong giu on dinh ra sao khi bi ep tai manh va keo dai.",
      "",
      "Nguon du lieu: `Prometheus` (metric k6) va `Loki` (run status).",
      "",
      "Dung khi demo: chon dung `Performance Test ID`, sau do xem p95, error, traffic va service nao bat dau tro thanh bottleneck.",
    ].join("\n"),
  },
];

const HEADER_TITLE = "Dashboard Guide";
const HEADER_HEIGHT = 4;

for (const config of dashboardConfigs) {
  const raw = fs.readFileSync(config.path, "utf8");
  const dashboard = JSON.parse(raw);

  dashboard.title = config.title;
  dashboard.description = config.description;

  const hasHeader = Array.isArray(dashboard.panels)
    && dashboard.panels.some(
      (panel) => panel?.type === "text" && panel?.title === HEADER_TITLE,
    );

  if (!hasHeader) {
    for (const panel of dashboard.panels ?? []) {
      if (panel?.gridPos && typeof panel.gridPos.y === "number") {
        panel.gridPos.y += HEADER_HEIGHT;
      }
    }

    const maxId = Math.max(
      0,
      ...(dashboard.panels ?? [])
        .map((panel) => Number(panel?.id) || 0),
    );

    dashboard.panels = [
      {
        id: maxId + 1,
        title: HEADER_TITLE,
        type: "text",
        gridPos: { h: HEADER_HEIGHT, w: 24, x: 0, y: 0 },
        options: {
          mode: "markdown",
          content: config.markdown,
        },
        transparent: true,
      },
      ...(dashboard.panels ?? []),
    ];
  }

  fs.writeFileSync(`${config.path}`, `${JSON.stringify(dashboard, null, 2)}\n`);
}
