package com.cherrycake.report.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.math.BigDecimal;
import java.util.List;

public record SalesReportResponse(Kpi kpi, List<Row> rows,
        @Schema(description = "Stored currency code; MIXED for multiple currencies; null for no data")
        String currencyCode) {
    @Schema(name = "SalesReportKpi")
    public record Kpi(long ordersCount, BigDecimal subtotalSum, BigDecimal vatSum,
            BigDecimal discountSum, BigDecimal totalSum) { }

    @Schema(name = "SalesReportRow")
    public record Row(String label, long ordersCount, BigDecimal total) { }
}
