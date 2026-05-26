package com.itjob.dashboardservice.repository;

import com.itjob.dashboardservice.entity.DashboardJobProjection;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;

public interface DashboardJobProjectionRepository extends JpaRepository<DashboardJobProjection, String> {

    long countByStatus(String status);

    long countByExpiredAtLessThan(LocalDateTime now);

    long countByPostedAtBetween(LocalDateTime startDate, LocalDateTime endDate);

    long countByPostedAtGreaterThanEqual(LocalDateTime startDate);

    long countByPostedAtLessThanEqual(LocalDateTime endDate);

    long countByStatusAndPostedAtBetween(String status, LocalDateTime startDate, LocalDateTime endDate);

    long countByStatusAndPostedAtGreaterThanEqual(String status, LocalDateTime startDate);

    long countByStatusAndPostedAtLessThanEqual(String status, LocalDateTime endDate);

    long countByExpiredAtLessThanAndPostedAtBetween(LocalDateTime now, LocalDateTime startDate, LocalDateTime endDate);

    long countByExpiredAtLessThanAndPostedAtGreaterThanEqual(LocalDateTime now, LocalDateTime startDate);

    long countByExpiredAtLessThanAndPostedAtLessThanEqual(LocalDateTime now, LocalDateTime endDate);
}
