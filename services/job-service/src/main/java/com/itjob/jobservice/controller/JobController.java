package com.itjob.jobservice.controller;

import com.itjob.jobservice.dto.request.*;
import com.itjob.jobservice.dto.response.ApiResponse;
import com.itjob.jobservice.dto.response.JobDetailResponse;
import com.itjob.jobservice.dto.response.JobResponse;
import com.itjob.jobservice.dto.response.JobSummaryResponse;
import com.itjob.jobservice.enums.Level;
import com.itjob.jobservice.service.JobService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/jobs")
@RequiredArgsConstructor
@Tag(name = "Jobs", description = "API quản lý công việc")
public class JobController {

    private final JobService jobService;

    @GetMapping
    @Operation(summary = "Lấy danh sách công việc")
    public ResponseEntity<ApiResponse<List<JobResponse>>> getJobs(
            @RequestHeader("X-User-Id") String userId,
            @RequestHeader("X-User-Role") String role,
            @ModelAttribute SearchJobQuery searchQuery) {
        return ResponseEntity.ok(ApiResponse.ok(jobService.getJobs(userId, role, searchQuery)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Lấy chi tiết công việc")
    public ResponseEntity<ApiResponse<JobDetailResponse>> getJob(
            @PathVariable String id,
            @RequestHeader("X-User-Id") String userId,
            @RequestHeader("X-User-Role") String role) {
        return ResponseEntity.ok(ApiResponse.ok(jobService.getJob(id, userId, role)));
    }

    @PostMapping
    @Operation(summary = "Tạo công việc mới (Recruiter)")
    public ResponseEntity<ApiResponse<JobDetailResponse>> createJob(
            @Valid @RequestBody CreateJobRequest request,
            @RequestHeader("X-User-Id") String recruiterId) {
        return ResponseEntity.ok(ApiResponse.ok("Tạo công việc thành công.", jobService.createJob(request, recruiterId)));
    }

    @PatchMapping("/{id}")
    @Operation(summary = "Cập nhật công việc (Recruiter)")
    public ResponseEntity<ApiResponse<JobDetailResponse>> updateJob(
            @PathVariable String id,
            @RequestBody UpdateJobRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Cập nhật công việc thành công.", jobService.updateJob(id, request)));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Xóa mềm công việc")
    public ResponseEntity<ApiResponse<Void>> deleteJob(
            @PathVariable String id,
            @RequestHeader("X-User-Id") String userId,
            @RequestHeader("X-User-Role") String role) {
        jobService.deleteJob(id, userId, role);
        return ResponseEntity.ok(ApiResponse.ok("Xóa công việc thành công.", null));
    }

    @PatchMapping("/process/status")
    @Operation(summary = "Admin duyệt/từ chối công việc")
    public ResponseEntity<ApiResponse<Void>> processJobStatus(
            @Valid @RequestBody ProcessJobStatusRequest request,
            @RequestHeader("X-User-Id") String userId) {
        jobService.processJobStatus(request, userId);
        return ResponseEntity.ok(ApiResponse.ok("Xử lý trạng thái công việc thành công.", null));
    }

    @GetMapping("/candidates/{candidateId}/recommended")
    @Operation(summary = "Lấy danh sách công việc gợi ý cho ứng viên")
    public ResponseEntity<ApiResponse<List<JobDetailResponse>>> getRecommendedJobs(
            @PathVariable String candidateId,
            @RequestParam Level level) {
        return ResponseEntity.ok(ApiResponse.ok(jobService.getRecommendedJobs(candidateId, level)));
    }

    // Internal API cho Dashboard Service
    @GetMapping("/internal/summary")
    @Operation(summary = "Thống kê công việc (Internal API)")
    public ResponseEntity<JobSummaryResponse> getJobSummary(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        LocalDateTime start = startDate != null ? LocalDateTime.parse(startDate + "T00:00:00") : null;
        LocalDateTime end = endDate != null ? LocalDateTime.parse(endDate + "T23:59:59") : null;
        return ResponseEntity.ok(jobService.getJobSummary(start, end));
    }

    // Internal API cho kịch bản graceful degradation bằng snapshot
    @GetMapping("/internal/snapshot-status")
    @Operation(summary = "Trạng thái snapshot phục vụ graceful degradation (Internal API)")
    public ResponseEntity<Map<String, Object>> getSnapshotStatus() {
        return ResponseEntity.ok(jobService.getSnapshotStatus());
    }
}
