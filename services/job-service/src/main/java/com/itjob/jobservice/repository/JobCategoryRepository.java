package com.itjob.jobservice.repository;

import com.itjob.jobservice.entity.JobCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface JobCategoryRepository extends JpaRepository<JobCategory, JobCategory.JobCategoryId> {
    List<JobCategory> findByJobId(UUID jobId);
    void deleteByJobId(UUID jobId);
    void deleteByJobIdAndCategoryIdIn(UUID jobId, List<UUID> categoryIds);
}
