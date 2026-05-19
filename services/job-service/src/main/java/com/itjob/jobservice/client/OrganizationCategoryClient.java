package com.itjob.jobservice.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.List;

@FeignClient(
        name = "organizationCategoryClient",
        url = "${organization-service.url:http://localhost:3002}",
        path = "/categories"
)
public interface OrganizationCategoryClient {

    @GetMapping
    List<OrganizationCategoryResponse> getCategories();

    @PostMapping
    OrganizationCategoryResponse createCategory(
            @RequestBody CreateOrganizationCategoryRequest request
    );
}
