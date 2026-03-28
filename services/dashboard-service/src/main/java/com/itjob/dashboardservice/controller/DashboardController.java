package com.itjob.dashboardservice.controller;

import com.itjob.dashboardservice.dto.request.CreateReportRequest;
import com.itjob.dashboardservice.dto.response.ApiResponse;
import com.itjob.dashboardservice.dto.response.DashboardSummaryResponse;
import com.itjob.dashboardservice.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/dashboard")
@RequiredArgsConstructor
@Tag(name = "Dashboard", description = "API thống kê và báo cáo")
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/summary")
    @Operation(summary = "Lấy tổng hợp thống kê")
    public ResponseEntity<ApiResponse<DashboardSummaryResponse>> getSummary(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        return ResponseEntity.ok(ApiResponse.ok(dashboardService.getSummary(startDate, endDate)));
    }

    @PostMapping("/reports")
    @Operation(summary = "Tạo báo cáo PDF/Excel")
    public ResponseEntity<byte[]> generateReport(@Valid @RequestBody CreateReportRequest request) {
        byte[] reportData = dashboardService.generateReport(
                request.getType(), request.getStartDate(), request.getEndDate());

        String contentType = dashboardService.getReportContentType(request.getType());
        String extension = dashboardService.getReportFileExtension(request.getType());
        String filename = "report." + extension;

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .body(reportData);
    }
}
