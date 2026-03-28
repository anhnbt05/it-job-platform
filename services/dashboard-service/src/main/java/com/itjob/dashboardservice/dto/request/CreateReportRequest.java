package com.itjob.dashboardservice.dto.request;

import com.itjob.dashboardservice.enums.ReportType;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateReportRequest {
    private String startDate;
    private String endDate;

    @NotNull(message = "Loại báo cáo không được để trống.")
    private ReportType type;
}
