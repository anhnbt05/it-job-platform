package com.itjob.dashboardservice.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.Map;

@Data
@Builder
public class DashboardSummaryResponse {
    private Map<String, Object> jobStats;
    private Map<String, Object> applicationStats;
}
