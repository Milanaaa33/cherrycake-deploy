package uz.itpu.cherrycake.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SalesReportResponse
{
    private String period;
    private String regionFilter;

    // KPIs
    private BigDecimal totalSubtotal;
    private BigDecimal totalVat;
    private BigDecimal totalDiscount;
    private BigDecimal totalRevenue;
    private BigDecimal averageCheck;
    private Long totalOrdersCount;

    @Builder.Default
    private List<RegionSalesItem> salesByRegion = new ArrayList<>();

    @Builder.Default
    private List<MonthlySalesItem> salesByMonth = new ArrayList<>();

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RegionSalesItem
    {
        private String regionCode;
        private String regionName;
        private Long orderCount;
        private BigDecimal totalSales;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MonthlySalesItem
    {
        private String month; // e.g. "2026-10"
        private Long orderCount;
        private BigDecimal totalSales;
    }
}