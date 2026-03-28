package com.itjob.dashboardservice.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.Map;

@FeignClient(name = "job-service", url = "${job-service.url}")
public interface JobServiceClient {

    @GetMapping("/jobs/internal/summary")
    Map<String, Object> getJobSummary(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate);
}
