package com.itjob.applicationservice.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;

import java.util.Map;

@FeignClient(name = "job-service", url = "${job-service.url}")
public interface JobServiceClient {

    @GetMapping("/jobs/{id}")
    Map<String, Object> getJob(
            @PathVariable("id") String jobId,
            @RequestHeader("X-User-Id") String userId,
            @RequestHeader("X-User-Role") String role);
}
