package com.itjob.jobservice.controller;

import com.itjob.jobservice.dto.request.CreateJobFavoritesRequest;
import com.itjob.jobservice.dto.request.DeleteJobFavoritesRequest;
import com.itjob.jobservice.dto.response.ApiResponse;
import com.itjob.jobservice.dto.response.JobFavoriteResponse;
import com.itjob.jobservice.service.JobFavoriteService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/jobs/favorites")
@RequiredArgsConstructor
@Tag(name = "Job Favorites", description = "API quản lý công việc yêu thích")
public class JobFavoriteController {

    private final JobFavoriteService jobFavoriteService;

    @GetMapping
    @Operation(summary = "Lấy danh sách công việc yêu thích")
    public ResponseEntity<ApiResponse<List<JobFavoriteResponse>>> getFavorites(
            @RequestHeader("X-User-Id") String candidateId) {
        return ResponseEntity.ok(ApiResponse.ok(jobFavoriteService.getFavorites(candidateId)));
    }

    @PostMapping
    @Operation(summary = "Thêm công việc yêu thích")
    public ResponseEntity<ApiResponse<Void>> addFavorites(
            @RequestHeader("X-User-Id") String candidateId,
            @Valid @RequestBody CreateJobFavoritesRequest request) {
        jobFavoriteService.addFavorites(candidateId, request);
        return ResponseEntity.ok(ApiResponse.ok("Đã lưu công việc yêu thích thành công.", null));
    }

    @DeleteMapping
    @Operation(summary = "Xóa công việc yêu thích")
    public ResponseEntity<ApiResponse<Void>> removeFavorites(
            @RequestHeader("X-User-Id") String candidateId,
            @Valid @RequestBody DeleteJobFavoritesRequest request) {
        jobFavoriteService.removeFavorites(candidateId, request);
        return ResponseEntity.ok(ApiResponse.ok("Đã xóa công việc yêu thích.", null));
    }
}
