package com.itjob.dashboardservice.service;

import com.itjob.dashboardservice.client.ApplicationServiceClient;
import com.itjob.dashboardservice.client.JobServiceClient;
import com.itjob.dashboardservice.dto.response.DashboardSummaryResponse;
import com.itjob.dashboardservice.enums.ReportType;
import com.itjob.dashboardservice.report.ReportContext;
import com.itjob.dashboardservice.report.ReportStrategy;
import io.micrometer.core.instrument.MeterRegistry;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class DashboardService {

    private final JobServiceClient jobServiceClient;
    private final ApplicationServiceClient applicationServiceClient;
    private final ReportContext reportContext;
    private final MeterRegistry meterRegistry;

    /**
     * Lấy tổng hợp thống kê
     */
    public DashboardSummaryResponse getSummary(String startDate, String endDate) {
        log.info("Đang lấy thống kê dashboard...");

        Map<String, Object> jobStats = jobServiceClient.getJobSummary(startDate, endDate);
        Map<String, Object> appStats = applicationServiceClient.getApplicationSummary(startDate, endDate);
        incrementDashboardMetric("summary", "none");

        return DashboardSummaryResponse.builder()
                .jobStats(jobStats)
                .applicationStats(appStats)
                .build();
    }

    /**
     * Tạo báo cáo (PDF/Excel) với Strategy Pattern
     */
    public byte[] generateReport(ReportType type, String startDate, String endDate) {
        log.info("Đang tạo báo cáo {}...", type);

        Map<String, Object> jobStats = jobServiceClient.getJobSummary(startDate, endDate);
        Map<String, Object> appStats = applicationServiceClient.getApplicationSummary(startDate, endDate);

        Map<String, Object> data = new HashMap<>();
        data.put("jobStats", jobStats);
        data.put("applicationStats", appStats);

        ReportStrategy strategy = reportContext.getStrategy(type);
        byte[] report = strategy.generate(data, type, startDate, endDate);
        incrementDashboardMetric("report", type.name().toLowerCase());
        return report;
    }

    /**
     * Lấy content type cho report
     */
    public String getReportContentType(ReportType type) {
        return reportContext.getStrategy(type).getContentType();
    }

    /**
     * Lấy file extension cho report
     */
    public String getReportFileExtension(ReportType type) {
        return reportContext.getStrategy(type).getFileExtension();
    }

    private void incrementDashboardMetric(String action, String format) {
        meterRegistry.counter(
                "dashboard_operations_total",
                "action", action,
                "format", format
        ).increment();
    }
}
