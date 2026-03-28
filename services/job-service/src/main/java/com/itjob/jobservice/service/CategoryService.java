package com.itjob.jobservice.service;

import com.itjob.jobservice.dto.response.CategoryResponse;
import com.itjob.jobservice.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public List<CategoryResponse> getCategories() {
        return categoryRepository.findByDeletedAtIsNull().stream()
                .map(cat -> CategoryResponse.builder()
                        .id(cat.getId().toString())
                        .categoryName(cat.getCategoryName())
                        .build())
                .collect(Collectors.toList());
    }
}
