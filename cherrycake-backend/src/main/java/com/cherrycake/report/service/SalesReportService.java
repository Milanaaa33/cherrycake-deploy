package com.cherrycake.report.service;

import com.cherrycake.catalog.entity.Region;
import com.cherrycake.catalog.service.CatalogService;
import com.cherrycake.common.exception.BadRequestException;
import com.cherrycake.report.dto.ReportFilters;
import com.cherrycake.report.dto.ReportFilters.GroupBy;
import com.cherrycake.report.dto.SalesReportResponse;
import com.cherrycake.report.dto.SalesReportResponse.Kpi;
import com.cherrycake.report.dto.SalesReportResponse.Row;
import com.cherrycake.report.repository.SalesReportRepository;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.Locale;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SalesReportService {
    private final SalesReportRepository repository;
    private final CatalogService catalog;

    public SalesReportService(SalesReportRepository repository, CatalogService catalog) {
        this.repository = repository;
        this.catalog = catalog;
    }

    public ReportFilters filters(LocalDate from, LocalDate to, String region, GroupBy groupBy) {
        LocalDate end = to == null ? LocalDate.now() : to;
        LocalDate start = from == null ? end.minusMonths(5).withDayOfMonth(1) : from;
        if (start.isAfter(end) || start.getYear() < 1 || end.getYear() > 9999) {
            throw new BadRequestException("from must be on or before to; years must be between 1 and 9999");
        }
        if (region != null && !region.matches("[A-Za-z]{3}")) {
            throw new BadRequestException("region must be a three-letter country code");
        }
        return new ReportFilters(start, end, region == null ? null : region.toUpperCase(Locale.ROOT), groupBy);
    }

    @Transactional(readOnly = true)
    public SalesReportResponse sales(ReportFilters filters) {
        Region region = filters.region() == null ? null : catalog.getRegion(filters.region());
        var aggregates = repository.aggregate(filters, region == null ? null : region.getId());
        long count = 0;
        BigDecimal subtotal = new BigDecimal("0.00"), vat = subtotal, discount = subtotal, total = subtotal;
        String currency = region == null ? null : region.getCurrencyCode();
        for (var row : aggregates) {
            count += row.count();
            subtotal = subtotal.add(row.subtotal());
            vat = vat.add(row.vat());
            discount = discount.add(row.discount());
            total = total.add(row.total());
            currency = currency == null ? row.currency() : currency.equals(row.currency()) ? currency : "MIXED";
        }
        return new SalesReportResponse(new Kpi(count, money(subtotal), money(vat), money(discount), money(total)),
                aggregates.stream().map(r -> new Row(r.label(), r.count(), money(r.total()))).toList(), currency);
    }

    private static BigDecimal money(BigDecimal amount) {
        return amount.setScale(2, RoundingMode.HALF_UP);
    }
}
