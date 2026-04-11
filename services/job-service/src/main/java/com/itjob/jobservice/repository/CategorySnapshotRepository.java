package com.itjob.jobservice.repository;

import com.itjob.jobservice.entity.CategorySnapshot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CategorySnapshotRepository extends JpaRepository<CategorySnapshot, UUID> {
    Optional<CategorySnapshot> findByCategoryName(String categoryName);
    List<CategorySnapshot> findByCategoryNameIn(List<String> categoryNames);
}
