package com.itjob.jobservice.repository;

import com.itjob.jobservice.entity.Job;
import com.itjob.jobservice.enums.JobStatus;
import com.itjob.jobservice.enums.Level;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface JobRepository extends JpaRepository<Job, UUID> {

    List<Job> findByStatusAndDeletedAtIsNull(JobStatus status);

    List<Job> findByRecruiterIdAndDeletedAtIsNull(UUID recruiterId);

    @Query("SELECT j FROM Job j WHERE j.recruiterId = :recruiterId AND j.title = :title AND j.status IN ('open', 'pending') AND j.deletedAt IS NULL")
    List<Job> findDuplicateJob(@Param("recruiterId") UUID recruiterId, @Param("title") String title);

    @Query("SELECT j FROM Job j WHERE j.level = :level AND j.status = 'open' AND j.deletedAt IS NULL ORDER BY j.postedAt DESC")
    List<Job> findRecommendedJobs(@Param("level") Level level);

    @Query("SELECT j FROM Job j WHERE j.expiredAt <= :now AND j.status != 'closed'")
    List<Job> findExpiredJobs(@Param("now") LocalDateTime now);

    @Query("SELECT j FROM Job j WHERE j.expiredAt > :now AND j.expiredAt <= :soonDate AND j.status = 'open'")
    List<Job> findExpiringSoonJobs(@Param("now") LocalDateTime now, @Param("soonDate") LocalDateTime soonDate);

    @Query("SELECT COUNT(j) FROM Job j WHERE j.status = :status AND (:startDate IS NULL OR j.postedAt >= :startDate) AND (:endDate IS NULL OR j.postedAt <= :endDate)")
    long countByStatusAndDateRange(@Param("status") JobStatus status, @Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    @Query("SELECT COUNT(j) FROM Job j WHERE (:startDate IS NULL OR j.postedAt >= :startDate) AND (:endDate IS NULL OR j.postedAt <= :endDate)")
    long countByDateRange(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    @Query("SELECT COUNT(j) FROM Job j WHERE j.expiredAt < :now AND (:startDate IS NULL OR j.postedAt >= :startDate) AND (:endDate IS NULL OR j.postedAt <= :endDate)")
    long countExpiredByDateRange(@Param("now") LocalDateTime now, @Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
}
