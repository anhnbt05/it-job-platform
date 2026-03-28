package com.itjob.jobservice.repository;

import com.itjob.jobservice.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CategoryRepository extends JpaRepository<Category, UUID> {
    Optional<Category> findByCategoryName(String categoryName);
    List<Category> findByCategoryNameIn(List<String> categoryNames);
    List<Category> findByDeletedAtIsNull();
}
