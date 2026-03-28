package com.itjob.applicationservice.repository;

import com.itjob.applicationservice.document.Application;
import com.itjob.applicationservice.enums.ApplicationStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ApplicationRepository extends MongoRepository<Application, String> {

    List<Application> findByCandidateIdAndDeletedAtIsNull(String candidateId);

    Optional<Application> findByCandidateIdAndJobId(String candidateId, String jobId);

    List<Application> findByJobIdAndDeletedAtIsNull(String jobId);

    long countByStatus(ApplicationStatus status);

    long countByStatusAndAppliedAtBetween(ApplicationStatus status, LocalDateTime start, LocalDateTime end);

    long countByAppliedAtBetween(LocalDateTime start, LocalDateTime end);

    List<Application> findByJobIdAndStatusAndIdNot(String jobId, ApplicationStatus status, String excludeId);

    long countByJobIdAndStatus(String jobId, ApplicationStatus status);
}
