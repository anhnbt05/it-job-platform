package com.itjob.applicationservice.controller;

import com.itjob.applicationservice.dto.request.CreateApplicationRequest;
import com.itjob.applicationservice.dto.request.ProcessApplicationsRequest;
import com.itjob.applicationservice.dto.response.ApiResponse;
import com.itjob.applicationservice.dto.response.ApplicationResponse;
import com.itjob.applicationservice.dto.response.ApplicationSummaryResponse;
import com.itjob.applicationservice.service.ApplicationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/applications")
@RequiredArgsConstructor
@Tag(name = "Applications", description = "API quản lý đơn ứng tuyển")
public class ApplicationController {

    private final ApplicationService applicationService;

    @GetMapping
    @Operation(summary = "Lấy danh sách đơn ứng tuyển của ứng viên")
    public ResponseEntity<ApiResponse<List<ApplicationResponse>>> getApplications(
            @RequestHeader("X-User-Id") String candidateId) {
        return ResponseEntity.ok(ApiResponse.ok(applicationService.getApplications(candidateId)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Lấy chi tiết đơn ứng tuyển")
    public ResponseEntity<ApiResponse<ApplicationResponse>> getApplication(
            @PathVariable String id,
            @RequestHeader("X-User-Id") String candidateId) {
        return ResponseEntity.ok(ApiResponse.ok(applicationService.getApplication(id, candidateId)));
    }

    @PostMapping
    @Operation(summary = "Tạo đơn ứng tuyển mới")
    public ResponseEntity<ApiResponse<ApplicationResponse>> createApplication(
            @Valid @RequestBody CreateApplicationRequest request,
            @RequestHeader("X-User-Id") String candidateId,
            @RequestHeader(value = "X-User-Name", defaultValue = "") String candidateName,
            @RequestHeader(value = "X-Job-Title", defaultValue = "") String jobTitle,
            @RequestHeader(value = "X-Recruiter-Id", defaultValue = "") String recruiterId) {
        return ResponseEntity.ok(ApiResponse.ok("Tạo đơn ứng tuyển thành công.",
                applicationService.createApplication(request, candidateId, candidateName, jobTitle, recruiterId)));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Xóa đơn ứng tuyển")
    public ResponseEntity<ApiResponse<Void>> deleteApplication(
            @PathVariable String id,
            @RequestHeader("X-User-Id") String candidateId) {
        applicationService.deleteApplication(id, candidateId);
        return ResponseEntity.ok(ApiResponse.ok("Xóa đơn ứng tuyển thành công.", null));
    }

    @PatchMapping("/process")
    @Operation(summary = "Recruiter xử lý đơn ứng tuyển (duyệt/từ chối)")
    public ResponseEntity<ApiResponse<Void>> processApplications(
            @Valid @RequestBody ProcessApplicationsRequest request,
            @RequestHeader("X-User-Id") String recruiterId) {
        applicationService.processApplications(request, recruiterId);
        return ResponseEntity.ok(ApiResponse.ok("Xử lý đơn ứng tuyển thành công.", null));
    }

    // Internal API cho Job Service
    @GetMapping("/internal/by-job/{jobId}")
    @Operation(summary = "Lấy đơn ứng tuyển theo jobId (Internal)")
    public ResponseEntity<List<ApplicationResponse>> getByJobId(@PathVariable String jobId) {
        return ResponseEntity.ok(applicationService.getApplicationsByJobId(jobId));
    }

    // Internal API cho Dashboard Service
    @GetMapping("/internal/summary")
    @Operation(summary = "Thống kê đơn ứng tuyển (Internal)")
    public ResponseEntity<ApplicationSummaryResponse> getSummary(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        LocalDateTime start = startDate != null ? LocalDateTime.parse(startDate + "T00:00:00") : null;
        LocalDateTime end = endDate != null ? LocalDateTime.parse(endDate + "T23:59:59") : null;
        return ResponseEntity.ok(applicationService.getSummary(start, end));
    }
}
