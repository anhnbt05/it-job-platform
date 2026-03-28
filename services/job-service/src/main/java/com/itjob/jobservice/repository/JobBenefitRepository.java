package com.itjob.jobservice.repository;

import com.itjob.jobservice.entity.JobBenefit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface JobBenefitRepository extends JpaRepository<JobBenefit, UUID> {
    List<JobBenefit> findByJobId(UUID jobId);
    void deleteByJobId(UUID jobId);
}
