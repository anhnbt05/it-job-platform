import fs from "node:fs";

const commonPerformancePanelDescriptions = {
  "Run Status": "Trạng thái pass hoặc fail của đúng lần chạy đang được chọn theo Performance Test ID.",
  "Peak VUs": "Số lượng Virtual Users cao nhất đạt được trong lần chạy này.",
  "Worst P95": "Độ trễ P95 tệ nhất ghi nhận trong toàn bộ lần chạy đang chọn.",
  "Error Rate": "Tỷ lệ request lỗi trên tổng request của lần chạy đang chọn.",
  "Request Trend": "Diễn biến lưu lượng request theo thời gian, tách theo từng service.",
  "P95 Trend": "Diễn biến độ trễ P95 theo thời gian, tách theo từng service.",
  "Error Trend": "Diễn biến số request lỗi theo thời gian, tách theo từng service.",
  "Traffic by Service": "Tổng lưu lượng request theo từng service trong lần chạy đang chọn.",
  "P95 by Service": "Độ trễ P95 cao nhất của từng service trong lần chạy đang chọn.",
  "Failed Requests by Service": "Tổng số request lỗi của từng service trong lần chạy đang chọn.",
  "Slowest Operations": "Các operation chậm nhất để xác định bottleneck chính của hệ thống.",
};

const dashboardConfigs = [
  {
    path: "E:/it-job/it-job-platform/infrastructure/observability/grafana/dashboards/core/microservices.json",
    title: "Backend Overview",
    description:
      "Theo dõi lưu lượng, độ trễ, lỗi 5xx và business events của cụm backend trong lúc demo nghiệp vụ.",
    markdown: [
      "## Backend Overview",
      "",
      "Mục đích: theo dõi traffic, latency, error và business events của backend.",
      "",
      "Nguồn dữ liệu: `Prometheus`.",
      "",
      "Dùng khi demo: chạy nghiệp vụ hoặc load/performance test để xem service nào đang nổi bật về độ trễ và lỗi.",
    ].join("\n"),
    panelDescriptions: {
      "Request Rate By Service": "Tốc độ request hiện tại của từng service backend.",
      "P95 Latency By Service": "Độ trễ P95 của từng service để nhận diện service phản hồi chậm.",
      "5xx Error Rate": "Tần suất lỗi 5xx theo từng service trong thời gian gần đây.",
      "Nest Business Events (1h)": "Các business event phát ra từ nhóm service NestJS trong 1 giờ gần nhất.",
      "Spring Business Events (1h)": "Các business event phát ra từ nhóm service Spring trong 1 giờ gần nhất.",
      "Target Health": "Trạng thái scrape metric của các target backend chính.",
    },
  },
  {
    path: "E:/it-job/it-job-platform/infrastructure/observability/grafana/dashboards/core/system.json",
    title: "System Health",
    description:
      "Tổng quan process health, memory và scrape availability của hệ thống observability và backend.",
    markdown: [
      "## System Health",
      "",
      "Mục đích: theo dõi sức khỏe process, memory và khả năng scrape metric của toàn hệ thống.",
      "",
      "Nguồn dữ liệu: `Prometheus`.",
      "",
      "Dùng khi demo: xác nhận service sống, memory ổn định và observability vẫn thu thập dữ liệu bình thường.",
    ].join("\n"),
    panelDescriptions: {
      "Nest RSS Memory": "Dung lượng bộ nhớ RSS của các service NestJS theo thời gian.",
      "Spring JVM Heap Used": "Dung lượng heap đang dùng của các service Spring Boot.",
      "Spring Process Uptime": "Thời gian uptime của các process Spring để phát hiện restart bất thường.",
      "Scrape Target Availability": "Khả năng Prometheus scrape thành công từng target trong hệ thống.",
    },
  },
  {
    path: "E:/it-job/it-job-platform/infrastructure/observability/grafana/dashboards/core/service-logs.json",
    title: "Backend Service Logs",
    description:
      "Tập trung vào log HTTP, warning và error của backend runtime. Dashboard này có chủ ý loại bỏ automation-tests.",
    markdown: [
      "## Backend Service Logs",
      "",
      "Mục đích: xem log runtime của backend, nhất là request HTTP, warning và error.",
      "",
      "Nguồn dữ liệu: `Loki`.",
      "",
      "Lưu ý: dashboard này **không** hiện log `automation-tests`; nó chỉ tập trung vào service backend thật.",
    ].join("\n"),
    panelDescriptions: {
      "Errors In Last Hour": "Tổng số log mức error hoặc fatal trong 1 giờ gần nhất.",
      "5xx Request Logs In Last Hour": "Tổng số request log có mã 5xx trong 1 giờ gần nhất.",
      "HTTP Log Lines In Last 15m": "Số dòng log HTTP được ghi trong 15 phút gần nhất.",
      "HTTP Request Logs": "Danh sách log request HTTP gần đây để soi chi tiết từng request.",
      "Warning And Error Logs": "Danh sách log warning, error và fatal để theo dõi bất thường.",
    },
  },
  {
    path: "E:/it-job/it-job-platform/infrastructure/observability/grafana/dashboards/automation/api-automation.json",
    title: "API Automation Test",
    description:
      "Kết quả workflow API automation trên GitHub Actions, được ghi vào Loki để phục vụ demo và đối chiếu nhanh.",
    markdown: [
      "## API Automation Test",
      "",
      "Mục đích: theo dõi kết quả pass/fail của workflow API automation.",
      "",
      "Nguồn dữ liệu: `Loki` (`automation_test_result`).",
      "",
      "Dùng khi demo: chạy workflow API test trên GitHub Actions, sau đó đối chiếu số lượt chạy, trạng thái và log kết quả mới nhất.",
    ].join("\n"),
    panelDescriptions: {
      "Latest Run Status": "Trạng thái pass hoặc fail của lần chạy API automation gần nhất.",
      "Total Runs 24h": "Tổng số lần chạy API automation trong 24 giờ gần nhất.",
      "Passed 24h": "Tổng số lần chạy API automation thành công trong 24 giờ gần nhất.",
      "Failed 24h": "Tổng số lần chạy API automation thất bại trong 24 giờ gần nhất.",
      "Runs By Status": "Diễn biến số lần chạy pass/fail theo thời gian.",
      "Latest Results": "Log kết quả gần nhất của các lần chạy API automation.",
    },
  },
  {
    path: "E:/it-job/it-job-platform/infrastructure/observability/grafana/dashboards/automation/ui-e2e-automation.json",
    title: "UI E2E Test",
    description:
      "Kết quả workflow UI end-to-end trên GitHub Actions, nhằm chứng minh giao diện và luồng người dùng chạy từ đầu đến cuối.",
    markdown: [
      "## UI E2E Test",
      "",
      "Mục đích: theo dõi kết quả pass/fail của workflow UI end-to-end.",
      "",
      "Nguồn dữ liệu: `Loki` (`automation_test_result`).",
      "",
      "Dùng khi demo: chạy workflow UI E2E, sau đó mở dashboard này để chứng minh luồng giao diện được kiểm tra từ đầu đến cuối.",
    ].join("\n"),
    panelDescriptions: {
      "Latest Run Status": "Trạng thái pass hoặc fail của lần chạy UI E2E gần nhất.",
      "Total Runs 24h": "Tổng số lần chạy UI E2E trong 24 giờ gần nhất.",
      "Passed 24h": "Tổng số lần chạy UI E2E thành công trong 24 giờ gần nhất.",
      "Failed 24h": "Tổng số lần chạy UI E2E thất bại trong 24 giờ gần nhất.",
      "Runs By Status": "Diễn biến số lần chạy pass/fail theo thời gian.",
      "Latest Results": "Log kết quả gần nhất của các lần chạy UI E2E.",
    },
  },
  {
    path: "E:/it-job/it-job-platform/infrastructure/observability/grafana/dashboards/performance/performance-smoke.json",
    title: "Performance Smoke",
    description:
      "Dashboard dành cho smoke performance run. Đọc theo test id để xem run status, latency, traffic và error của từng service.",
    markdown: [
      "## Performance Smoke",
      "",
      "Mục đích: xem kết quả smoke performance theo từng `Performance Test ID`.",
      "",
      "Nguồn dữ liệu: `Prometheus` (metric k6) và `Loki` (run status).",
      "",
      "Dùng khi demo: chọn đúng `Performance Test ID`, sau đó đối chiếu run status, p95, traffic và lỗi theo service.",
    ].join("\n"),
    panelDescriptions: commonPerformancePanelDescriptions,
  },
  {
    path: "E:/it-job/it-job-platform/infrastructure/observability/grafana/dashboards/performance/performance-spike.json",
    title: "Performance Spike",
    description:
      "Dashboard dành cho spike performance run. Tập trung vào khả năng hấp thụ đột biến tải ở từng service.",
    markdown: [
      "## Performance Spike",
      "",
      "Mục đích: xem hệ thống ứng xử thế nào khi tải tăng đột biến.",
      "",
      "Nguồn dữ liệu: `Prometheus` (metric k6) và `Loki` (run status).",
      "",
      "Dùng khi demo: chọn đúng `Performance Test ID`, sau đó so latency, traffic và error theo service khi peak VUs tăng nhanh.",
    ].join("\n"),
    panelDescriptions: commonPerformancePanelDescriptions,
  },
  {
    path: "E:/it-job/it-job-platform/infrastructure/observability/grafana/dashboards/performance/performance-stress.json",
    title: "Performance Stress",
    description:
      "Dashboard dành cho stress performance run. Dùng để quan sát độ trễ và sự ổn định khi hệ thống bị ép tải mạnh hơn và lâu hơn.",
    markdown: [
      "## Performance Stress",
      "",
      "Mục đích: xem hệ thống giữ ổn định ra sao khi bị ép tải mạnh và kéo dài.",
      "",
      "Nguồn dữ liệu: `Prometheus` (metric k6) và `Loki` (run status).",
      "",
      "Dùng khi demo: chọn đúng `Performance Test ID`, sau đó xem p95, error, traffic và service nào bắt đầu trở thành bottleneck.",
    ].join("\n"),
    panelDescriptions: commonPerformancePanelDescriptions,
  },
];

const HEADER_TITLE = "Hướng dẫn";
const HEADER_HEIGHT = 4;

for (const config of dashboardConfigs) {
  const raw = fs.readFileSync(config.path, "utf8");
  const dashboard = JSON.parse(raw);

  dashboard.title = config.title;
  dashboard.description = config.description;

  const headerPanel = Array.isArray(dashboard.panels)
    ? dashboard.panels.find((panel) => panel?.type === "text")
    : null;

  if (!headerPanel) {
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
  } else {
    headerPanel.title = HEADER_TITLE;
    headerPanel.options = {
      mode: "markdown",
      content: config.markdown,
    };
    headerPanel.transparent = true;
    headerPanel.gridPos = { h: HEADER_HEIGHT, w: 24, x: 0, y: 0 };
  }

  for (const panel of dashboard.panels ?? []) {
    if (panel?.type === "text") {
      continue;
    }

    const description = config.panelDescriptions?.[panel?.title];
    if (description) {
      panel.description = description;
    }
  }

  fs.writeFileSync(`${config.path}`, `${JSON.stringify(dashboard, null, 2)}\n`);
}
