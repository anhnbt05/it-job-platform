package com.itjob.jobservice.repository;

import com.itjob.jobservice.entity.JobRequirement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface JobRequirementRepository extends JpaRepository<JobRequirement, UUID> {
    List<JobRequirement> findByJobId(UUID jobId);
    void deleteByJobId(UUID jobId);
}
