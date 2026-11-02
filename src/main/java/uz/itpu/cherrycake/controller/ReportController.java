package uz.itpu.cherrycake.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import uz.itpu.cherrycake.common.response.ApiResponse;
import uz.itpu.cherrycake.dto.response.SalesReportResponse;
import uz.itpu.cherrycake.service.ReportService;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/v1/reports")
@RequiredArgsConstructor
@Tag(name = "Reports", description = "Sales reporting, aggregation metrics, and CSV export")
public class ReportController
{
    private final ReportService reportService;

    @GetMapping("/sales")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get aggregated sales report by region and month with KPIs")
    public ResponseEntity<ApiResponse<SalesReportResponse>> getSalesReport
    (
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
        @RequestParam(required = false) String region
    )
    {
        SalesReportResponse report = reportService.generateSalesReport(startDate, endDate, region);
        return ResponseEntity.ok(ApiResponse.ok(report));
    }

    @GetMapping("/sales/csv")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Download sales report as CSV")
    public ResponseEntity<byte[]> downloadCsv
    (
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
        @RequestParam(required = false) String region
    )
    {
        byte[] csvData = reportService.exportCsv(startDate, endDate, region);

        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"cherry_cake_sales_report.csv\"")
            .contentType(MediaType.parseMediaType("text/csv; charset=UTF-8"))
            .body(csvData);
    }
}