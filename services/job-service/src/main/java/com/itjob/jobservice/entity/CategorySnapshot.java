package com.itjob.jobservice.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "category_snapshots")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CategorySnapshot {

    @Id
    @Column(updatable = false, nullable = false)
    private UUID id;

    @Column(name = "category_name", nullable = false)
    private String categoryName;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @OneToMany(mappedBy = "category", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<JobCategory> jobCategories = new ArrayList<>();
}
