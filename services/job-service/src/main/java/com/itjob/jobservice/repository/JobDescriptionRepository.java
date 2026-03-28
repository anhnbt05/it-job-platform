package com.itjob.jobservice.repository;

import com.itjob.jobservice.entity.JobDescription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface JobDescriptionRepository extends JpaRepository<JobDescription, UUID> {
    List<JobDescription> findByJobId(UUID jobId);
    void deleteByJobId(UUID jobId);
}
