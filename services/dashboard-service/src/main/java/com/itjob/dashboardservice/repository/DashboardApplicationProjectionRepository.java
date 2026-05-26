package com.itjob.dashboardservice.repository;

import com.itjob.dashboardservice.entity.DashboardApplicationProjection;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;

public interface DashboardApplicationProjectionRepository extends JpaRepository<DashboardApplicationProjection, String> {

    long countByStatus(String status);

    long countByAppliedAtBetween(LocalDateTime startDate, LocalDateTime endDate);

    long countByAppliedAtGreaterThanEqual(LocalDateTime startDate);

    long countByAppliedAtLessThanEqual(LocalDateTime endDate);

    long countByStatusAndAppliedAtBetween(String status, LocalDateTime startDate, LocalDateTime endDate);

    long countByStatusAndAppliedAtGreaterThanEqual(String status, LocalDateTime startDate);

    long countByStatusAndAppliedAtLessThanEqual(String status, LocalDateTime endDate);
}
