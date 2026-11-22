package com.cherrycake.report.controller;

import com.cherrycake.common.dto.ErrorResponse;
import com.cherrycake.report.dto.ReportFilters.GroupBy;
import com.cherrycake.report.dto.SalesReportResponse;
import com.cherrycake.report.service.SalesReportService;
import com.cherrycake.report.service.SalesReportPdfService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.time.LocalDate;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/reports")
@Tag(name = "Reports", description = "Public sales aggregates and PDF export from persisted orders")
@ApiResponse(responseCode = "400", description = "Invalid filters or unsupported format",
        content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class)))
@ApiResponse(responseCode = "404", description = "Unknown region",
        content = @Content(mediaType = "application/json", schema = @Schema(implementation = ErrorResponse.class)))
public class ReportController {
    private final SalesReportService sales;
    private final SalesReportPdfService pdf;

    public ReportController(SalesReportService sales, SalesReportPdfService pdf) {
        this.sales = sales;
        this.pdf = pdf;
    }

    @GetMapping("/sales")
    @Operation(summary = "Sales KPI and chart rows grouped by country or calendar month",
            description = "Inclusive orderDate range; defaults to the last six calendar months through today. "
                    + "Omit region for all countries. Sums use stored local amounts; MIXED is not a common currency.")
    @ApiResponse(responseCode = "200", description = "Sales report",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = SalesReportResponse.class)))
    public SalesReportResponse sales(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(required = false) String region,
            @RequestParam(defaultValue = "MONTH") GroupBy groupBy) {
        return sales.sales(sales.filters(from, to, region, groupBy));
    }

    public enum ExportFormat { PDF }

    @GetMapping("/export")
    @Operation(summary = "Download a PDF with matching filters, KPI, order/revenue charts and rows")
    @ApiResponse(responseCode = "200", description = "PDF attachment",
            content = @Content(mediaType = "application/pdf", schema = @Schema(type = "string", format = "binary")))
    public ResponseEntity<byte[]> export(
            @RequestParam(defaultValue = "PDF") ExportFormat format,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(required = false) String region,
            @RequestParam(defaultValue = "MONTH") GroupBy groupBy) {
        var filters = sales.filters(from, to, region, groupBy);
        byte[] bytes = pdf.render(filters, sales.sales(filters));
        String name = "cherry-cake-sales-" + filters.from() + "-" + filters.to() + ".pdf";
        return ResponseEntity.ok().contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, ContentDisposition.attachment().filename(name).build().toString())
                .header(HttpHeaders.CACHE_CONTROL, "no-store").body(bytes);
    }
}
