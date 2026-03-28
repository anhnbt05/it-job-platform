package com.itjob.dashboardservice.report;

import com.itjob.dashboardservice.enums.ReportType;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

@Component
public class ReportContext {

    private final Map<ReportType, ReportStrategy> strategies = new HashMap<>();

    public ReportContext(PdfReportStrategy pdfStrategy, ExcelReportStrategy excelStrategy) {
        strategies.put(ReportType.pdf, pdfStrategy);
        strategies.put(ReportType.xlsx, excelStrategy);
    }

    public ReportStrategy getStrategy(ReportType type) {
        ReportStrategy strategy = strategies.get(type);
        if (strategy == null) {
            throw new IllegalArgumentException("Loại báo cáo '" + type + "' chưa được hỗ trợ.");
        }
        return strategy;
    }
}
