package com.itjob.dashboardservice.report;

import com.itjob.dashboardservice.enums.ReportType;
import com.lowagie.text.*;
import com.lowagie.text.Font;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import org.springframework.stereotype.Component;

import java.awt.*;
import java.io.ByteArrayOutputStream;
import java.util.Map;

@Component
public class PdfReportStrategy implements ReportStrategy {

    @Override
    public byte[] generate(Map<String, Object> data, ReportType type, String startDate, String endDate) {
        try {
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            Document document = new Document(PageSize.A4);
            PdfWriter.getInstance(document, out);

            document.open();

            // Title
            Font titleFont = new Font(Font.HELVETICA, 18, Font.BOLD, Color.BLACK);
            Paragraph title = new Paragraph("BÁO CÁO THỐNG KÊ HỆ THỐNG", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            document.add(title);

            // Date range
            Font dateFont = new Font(Font.HELVETICA, 10, Font.ITALIC, Color.GRAY);
            String dateRange = buildDateRangeText(startDate, endDate);
            Paragraph dateParagraph = new Paragraph(dateRange, dateFont);
            dateParagraph.setAlignment(Element.ALIGN_CENTER);
            dateParagraph.setSpacingAfter(20);
            document.add(dateParagraph);

            // Job Stats Table
            Map<String, Object> jobStats = (Map<String, Object>) data.get("jobStats");
            if (jobStats != null) {
                Font sectionFont = new Font(Font.HELVETICA, 14, Font.BOLD, Color.DARK_GRAY);
                document.add(new Paragraph("Thống kê công việc", sectionFont));
                document.add(Chunk.NEWLINE);

                PdfPTable jobTable = new PdfPTable(2);
                jobTable.setWidthPercentage(80);
                addTableRow(jobTable, "Tổng số công việc", jobStats.get("total"));
                addTableRow(jobTable, "Đang mở", jobStats.get("open"));
                addTableRow(jobTable, "Chờ duyệt", jobStats.get("pending"));
                addTableRow(jobTable, "Đã đóng", jobStats.get("closed"));
                addTableRow(jobTable, "Bị từ chối", jobStats.get("rejected"));
                addTableRow(jobTable, "Hết hạn", jobStats.get("expired"));
                document.add(jobTable);
            }

            document.add(Chunk.NEWLINE);

            // Application Stats Table
            Map<String, Object> appStats = (Map<String, Object>) data.get("applicationStats");
            if (appStats != null) {
                Font sectionFont = new Font(Font.HELVETICA, 14, Font.BOLD, Color.DARK_GRAY);
                document.add(new Paragraph("Thống kê đơn ứng tuyển", sectionFont));
                document.add(Chunk.NEWLINE);

                PdfPTable appTable = new PdfPTable(2);
                appTable.setWidthPercentage(80);
                addTableRow(appTable, "Tổng đơn ứng tuyển", appStats.get("total"));
                addTableRow(appTable, "Đang chờ", appStats.get("pending"));
                addTableRow(appTable, "Đã chấp nhận", appStats.get("accepted"));
                addTableRow(appTable, "Từ chối", appStats.get("rejected"));
                document.add(appTable);
            }

            document.close();
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi tạo báo cáo PDF: " + e.getMessage(), e);
        }
    }

    @Override
    public String getContentType() {
        return "application/pdf";
    }

    @Override
    public String getFileExtension() {
        return "pdf";
    }

    private void addTableRow(PdfPTable table, String label, Object value) {
        Font labelFont = new Font(Font.HELVETICA, 11, Font.NORMAL, Color.BLACK);
        Font valueFont = new Font(Font.HELVETICA, 11, Font.BOLD, Color.BLACK);

        PdfPCell labelCell = new PdfPCell(new Phrase(label, labelFont));
        labelCell.setPadding(8);
        table.addCell(labelCell);

        PdfPCell valueCell = new PdfPCell(new Phrase(value != null ? value.toString() : "0", valueFont));
        valueCell.setPadding(8);
        valueCell.setHorizontalAlignment(Element.ALIGN_CENTER);
        table.addCell(valueCell);
    }

    private String buildDateRangeText(String startDate, String endDate) {
        if (startDate != null && endDate != null) {
            return "Thoi gian bao cao tu ngay " + startDate + " den " + endDate;
        } else if (startDate != null) {
            return "Thoi gian bao cao tu ngay " + startDate + " den hien tai";
        } else if (endDate != null) {
            return "Thoi gian bao cao den ngay " + endDate;
        }
        return "Thoi gian bao cao: toan bo du lieu den thoi diem hien tai";
    }
}
