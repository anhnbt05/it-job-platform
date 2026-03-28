package com.itjob.dashboardservice.report;

import com.itjob.dashboardservice.enums.ReportType;

import java.util.Map;

public interface ReportStrategy {
    byte[] generate(Map<String, Object> data, ReportType type, String startDate, String endDate);
    String getContentType();
    String getFileExtension();
}
