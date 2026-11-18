package com.cherrycake.report.repository;

import com.cherrycake.report.dto.ReportFilters;
import com.cherrycake.report.dto.ReportFilters.GroupBy;
import java.math.BigDecimal;
import java.sql.Date;
import java.util.List;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class SalesReportRepository {
    private final NamedParameterJdbcTemplate jdbc;

    public SalesReportRepository(NamedParameterJdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public record Aggregate(String label, long count, BigDecimal subtotal, BigDecimal vat,
            BigDecimal discount, BigDecimal total, String currency) { }

    public List<Aggregate> aggregate(ReportFilters filters, Long regionId) {
        boolean byRegion = filters.groupBy() == GroupBy.REGION;
        String dimensions = byRegion ? "r.code" : "EXTRACT(YEAR FROM o.order_date), EXTRACT(MONTH FROM o.order_date)";
        String select = byRegion ? "r.code AS label" :
                "EXTRACT(YEAR FROM o.order_date) AS report_year, EXTRACT(MONTH FROM o.order_date) AS report_month";
        String sql = "SELECT " + select + """
                , COUNT(*) AS orders_count, SUM(o.subtotal) AS subtotal_sum,
                  SUM(o.vat_amount) AS vat_sum, SUM(o.discount_amount) AS discount_sum,
                  SUM(o.total) AS total_sum,
                  CASE WHEN COUNT(DISTINCT o.currency_code) = 1 THEN MIN(o.currency_code) ELSE 'MIXED' END AS currency
                FROM orders o JOIN regions r ON r.id = o.region_id
                WHERE o.order_date >= :from AND o.order_date <= :to
                """ + (regionId == null ? "" : " AND o.region_id = :regionId ")
                + " GROUP BY " + dimensions + " ORDER BY " + dimensions;
        var params = new MapSqlParameterSource("from", Date.valueOf(filters.from()))
                .addValue("to", Date.valueOf(filters.to())).addValue("regionId", regionId);
        // A single SQL statement gives KPI and chart rows the same database snapshot.
        return jdbc.query(sql, params, (rs, index) -> new Aggregate(
                byRegion ? rs.getString("label") : String.format(java.util.Locale.ROOT, "%04d-%02d",
                        rs.getInt("report_year"), rs.getInt("report_month")),
                rs.getLong("orders_count"), rs.getBigDecimal("subtotal_sum"), rs.getBigDecimal("vat_sum"),
                rs.getBigDecimal("discount_sum"), rs.getBigDecimal("total_sum"), rs.getString("currency")));
    }
}
