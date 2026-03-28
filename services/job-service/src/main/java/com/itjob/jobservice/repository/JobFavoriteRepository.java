package com.itjob.jobservice.repository;

import com.itjob.jobservice.entity.JobFavorite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface JobFavoriteRepository extends JpaRepository<JobFavorite, UUID> {
    List<JobFavorite> findByCandidateIdAndDeletedAtIsNull(UUID candidateId);
    Optional<JobFavorite> findByCandidateIdAndJobId(UUID candidateId, UUID jobId);
    void deleteByCandidateIdAndJobIdIn(UUID candidateId, List<UUID> jobIds);
}
