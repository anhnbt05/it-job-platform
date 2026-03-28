package com.itjob.dashboardservice.report;

import com.itjob.dashboardservice.enums.ReportType;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Component;

import java.io.ByteArrayOutputStream;
import java.util.Map;

@Component
public class ExcelReportStrategy implements ReportStrategy {

    @Override
    public byte[] generate(Map<String, Object> data, ReportType type, String startDate, String endDate) {
        try (XSSFWorkbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Tổng Quan");

            // Date range header
            String dateRange = buildDateRangeText(startDate, endDate);
            Row dateRow = sheet.createRow(0);
            Cell dateCell = dateRow.createCell(0);
            dateCell.setCellValue(dateRange);
            sheet.addMergedRegion(new CellRangeAddress(0, 0, 0, 5));

            // Empty row
            sheet.createRow(1);

            // Headers
            Row headerRow = sheet.createRow(2);
            CellStyle headerStyle = workbook.createCellStyle();
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerStyle.setFont(headerFont);

            String[] headers = {"Thống kê", "Tổng", "Đang mở/Chờ duyệt", "Đã đóng/Đã chấp nhận", "Từ chối", "Hết hạn"};
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
                sheet.setColumnWidth(i, 6000);
            }

            // Job stats
            Map<String, Object> jobStats = (Map<String, Object>) data.get("jobStats");
            if (jobStats != null) {
                Row jobRow = sheet.createRow(3);
                jobRow.createCell(0).setCellValue("Công việc");
                jobRow.createCell(1).setCellValue(toNumber(jobStats.get("total")));
                jobRow.createCell(2).setCellValue(toNumber(jobStats.get("open")));
                jobRow.createCell(3).setCellValue(toNumber(jobStats.get("closed")));
                jobRow.createCell(4).setCellValue(toNumber(jobStats.get("rejected")));
                jobRow.createCell(5).setCellValue(toNumber(jobStats.get("expired")));
            }

            // Application stats
            Map<String, Object> appStats = (Map<String, Object>) data.get("applicationStats");
            if (appStats != null) {
                Row appRow = sheet.createRow(4);
                appRow.createCell(0).setCellValue("Đơn ứng tuyển");
                appRow.createCell(1).setCellValue(toNumber(appStats.get("total")));
                appRow.createCell(2).setCellValue(toNumber(appStats.get("pending")));
                appRow.createCell(3).setCellValue(toNumber(appStats.get("accepted")));
                appRow.createCell(4).setCellValue(toNumber(appStats.get("rejected")));
            }

            ByteArrayOutputStream out = new ByteArrayOutputStream();
            workbook.write(out);
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi tạo báo cáo Excel: " + e.getMessage(), e);
        }
    }

    @Override
    public String getContentType() {
        return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    }

    @Override
    public String getFileExtension() {
        return "xlsx";
    }

    private String buildDateRangeText(String startDate, String endDate) {
        if (startDate != null && endDate != null) {
            return "Thời gian báo cáo từ ngày " + startDate + " đến " + endDate;
        } else if (startDate != null) {
            return "Thời gian báo cáo từ ngày " + startDate + " đến hiện tại";
        } else if (endDate != null) {
            return "Thời gian báo cáo đến ngày " + endDate;
        }
        return "Thời gian báo cáo: toàn bộ dữ liệu đến thời điểm hiện tại";
    }

    private double toNumber(Object value) {
        if (value == null) return 0;
        if (value instanceof Number) return ((Number) value).doubleValue();
        return Double.parseDouble(value.toString());
    }
}
