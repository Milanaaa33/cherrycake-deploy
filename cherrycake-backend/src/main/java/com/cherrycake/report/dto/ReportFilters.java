package com.cherrycake.report.dto;

import java.time.LocalDate;

public record ReportFilters(LocalDate from, LocalDate to, String region, GroupBy groupBy) {
    public enum GroupBy { REGION, MONTH }
}
