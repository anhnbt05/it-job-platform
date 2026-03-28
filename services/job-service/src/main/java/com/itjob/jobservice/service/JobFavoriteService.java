package com.itjob.jobservice.service;

import com.itjob.jobservice.dto.request.CreateJobFavoritesRequest;
import com.itjob.jobservice.dto.request.DeleteJobFavoritesRequest;
import com.itjob.jobservice.dto.response.JobDetailResponse;
import com.itjob.jobservice.dto.response.JobFavoriteResponse;
import com.itjob.jobservice.entity.Job;
import com.itjob.jobservice.entity.JobFavorite;
import com.itjob.jobservice.exception.ResourceNotFoundException;
import com.itjob.jobservice.repository.JobFavoriteRepository;
import com.itjob.jobservice.repository.JobRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class JobFavoriteService {

    private final JobFavoriteRepository jobFavoriteRepository;
    private final JobRepository jobRepository;
    private final JobService jobService;

    public List<JobFavoriteResponse> getFavorites(String candidateId) {
        UUID canId = UUID.fromString(candidateId);
        List<JobFavorite> favorites = jobFavoriteRepository.findByCandidateIdAndDeletedAtIsNull(canId);

        return favorites.stream()
                .map(fav -> {
                    Job job = fav.getJob();
                    JobDetailResponse jobDetail = jobService.getJob(
                            job.getId().toString(), candidateId, "candidate");

                    return JobFavoriteResponse.builder()
                            .id(fav.getId().toString())
                            .savedAt(fav.getSavedAt())
                            .job(jobDetail)
                            .build();
                })
                .collect(Collectors.toList());
    }

    @Transactional
    public void addFavorites(String candidateId, CreateJobFavoritesRequest request) {
        UUID canId = UUID.fromString(candidateId);

        for (String jobIdStr : request.getJobIds()) {
            UUID jobId = UUID.fromString(jobIdStr);

            Job job = jobRepository.findById(jobId)
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Không tìm thấy công việc có id '" + jobIdStr + "'."));

            // Upsert: check existing
            var existing = jobFavoriteRepository.findByCandidateIdAndJobId(canId, jobId);
            if (existing.isPresent()) {
                JobFavorite fav = existing.get();
                if (fav.getDeletedAt() != null) {
                    fav.setDeletedAt(null);
                    fav.setSavedAt(LocalDateTime.now());
                    jobFavoriteRepository.save(fav);
                }
                continue;
            }

            JobFavorite favorite = JobFavorite.builder()
                    .candidateId(canId)
                    .job(job)
                    .savedAt(LocalDateTime.now())
                    .build();
            jobFavoriteRepository.save(favorite);
        }
    }

    @Transactional
    public void removeFavorites(String candidateId, DeleteJobFavoritesRequest request) {
        UUID canId = UUID.fromString(candidateId);
        List<UUID> jobIds = request.getJobIds().stream()
                .map(UUID::fromString)
                .collect(Collectors.toList());

        jobFavoriteRepository.deleteByCandidateIdAndJobIdIn(canId, jobIds);
    }
}
