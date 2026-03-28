package com.itjob.dashboardservice.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.Map;

@FeignClient(name = "application-service", url = "${application-service.url}")
public interface ApplicationServiceClient {

    @GetMapping("/applications/internal/summary")
    Map<String, Object> getApplicationSummary(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate);
}
