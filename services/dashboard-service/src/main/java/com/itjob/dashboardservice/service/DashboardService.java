package com.itjob.dashboardservice.service;

import com.itjob.dashboardservice.client.ApplicationServiceClient;
import com.itjob.dashboardservice.client.JobServiceClient;
import com.itjob.dashboardservice.dto.response.DashboardSummaryResponse;
import com.itjob.dashboardservice.enums.ReportType;
import com.itjob.dashboardservice.report.ReportContext;
import com.itjob.dashboardservice.report.ReportStrategy;
import feign.FeignException;
import io.micrometer.core.instrument.MeterRegistry;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.Callable;

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

        Map<String, String> dependencyStatus = new LinkedHashMap<>();
        Map<String, String> dependencyErrors = new LinkedHashMap<>();

        Map<String, Object> jobStats = fetchStatsSafely(
                "job-service",
                () -> jobServiceClient.getJobSummary(startDate, endDate),
                createEmptyJobStats(),
                dependencyStatus,
                dependencyErrors
        );
        Map<String, Object> appStats = fetchStatsSafely(
                "application-service",
                () -> applicationServiceClient.getApplicationSummary(startDate, endDate),
                createEmptyApplicationStats(),
                dependencyStatus,
                dependencyErrors
        );

        boolean degraded = !dependencyErrors.isEmpty();
        incrementDashboardMetric("summary", degraded ? "degraded" : "none");

        return DashboardSummaryResponse.builder()
                .jobStats(jobStats)
                .applicationStats(appStats)
                .degraded(degraded)
                .dependencyStatus(dependencyStatus)
                .dependencyErrors(dependencyErrors)
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

    private Map<String, Object> fetchStatsSafely(
            String dependency,
            Callable<Map<String, Object>> callback,
            Map<String, Object> fallbackStats,
            Map<String, String> dependencyStatus,
            Map<String, String> dependencyErrors
    ) {
        try {
            Map<String, Object> stats = callback.call();
            dependencyStatus.put(dependency, "ok");
            return stats != null ? stats : fallbackStats;
        } catch (Exception exception) {
            dependencyStatus.put(dependency, "unavailable");
            dependencyErrors.put(
                    dependency,
                    "Không thể lấy dữ liệu từ " + dependency + ". Dashboard đang hiển thị dữ liệu thay thế."
            );
            incrementDependencyFailureMetric(dependency);

            log.warn(
                    "Dashboard degraded because dependency {} is unavailable: {}",
                    dependency,
                    describeDependencyError(exception)
            );

            return fallbackStats;
        }
    }

    private void incrementDependencyFailureMetric(String dependency) {
        meterRegistry.counter(
                "dashboard_dependency_failures_total",
                "dependency", dependency
        ).increment();
    }

    private String describeDependencyError(Exception exception) {
        if (exception instanceof FeignException feignException) {
            return "HTTP " + feignException.status() + " - " + feignException.getMessage();
        }

        return exception.getMessage() != null ? exception.getMessage() : exception.getClass().getSimpleName();
    }

    private Map<String, Object> createEmptyJobStats() {
        Map<String, Object> jobStats = new HashMap<>();
        jobStats.put("total", 0);
        jobStats.put("open", 0);
        jobStats.put("pending", 0);
        jobStats.put("closed", 0);
        jobStats.put("rejected", 0);
        jobStats.put("expired", 0);
        return jobStats;
    }

    private Map<String, Object> createEmptyApplicationStats() {
        Map<String, Object> applicationStats = new HashMap<>();
        applicationStats.put("total", 0);
        applicationStats.put("pending", 0);
        applicationStats.put("accepted", 0);
        applicationStats.put("rejected", 0);
        return applicationStats;
    }
}
