package uz.itpu.cherrycake.service;

import com.opencsv.CSVWriter;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uz.itpu.cherrycake.dto.response.SalesReportResponse;
import uz.itpu.cherrycake.dto.response.SalesReportResponse.MonthlySalesItem;
import uz.itpu.cherrycake.dto.response.SalesReportResponse.RegionSalesItem;
import uz.itpu.cherrycake.model.entity.Order;
import uz.itpu.cherrycake.model.entity.Region;
import uz.itpu.cherrycake.repository.OrderRepository;
import uz.itpu.cherrycake.repository.RegionRepository;

import java.io.ByteArrayOutputStream;
import java.io.OutputStreamWriter;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReportService
{
    private final OrderRepository orderRepository;
    private final RegionRepository regionRepository;

    public SalesReportResponse generateSalesReport(LocalDateTime startDate, LocalDateTime endDate, String regionCode)
    {
        if (startDate == null) startDate = LocalDateTime.now().minusMonths(6);
        if (endDate == null) endDate = LocalDateTime.now();

        List<Order> orders;
        if (regionCode != null && !regionCode.trim().isEmpty() && !regionCode.equalsIgnoreCase("ALL"))
            orders = orderRepository.findByRegionCodeIgnoreCaseAndCreatedAtBetween(regionCode.trim(), startDate, endDate);
        else orders = orderRepository.findByCreatedAtBetween(startDate, endDate);

        BigDecimal totalSubtotal = BigDecimal.ZERO;
        BigDecimal totalVat = BigDecimal.ZERO;
        BigDecimal totalDiscount = BigDecimal.ZERO;
        BigDecimal totalRevenue = BigDecimal.ZERO;

        Map<String, RegionSalesItem> regionMap = new HashMap<>();
        Map<String, MonthlySalesItem> monthMap = new TreeMap<>();

        DateTimeFormatter monthFormatter = DateTimeFormatter.ofPattern("yyyy-MM");

        for (Order o : orders)
        {
            totalSubtotal = totalSubtotal.add(o.getSubtotal());
            totalVat = totalVat.add(o.getVatAmount());
            totalDiscount = totalDiscount.add(o.getDiscountAmount());
            totalRevenue = totalRevenue.add(o.getTotalAmount());

            // By Region
            String rCode = o.getRegion().getCode();
            RegionSalesItem rItem = regionMap.computeIfAbsent(rCode, k -> RegionSalesItem.builder()
                .regionCode(rCode)
                .regionName(o.getRegion().getName())
                .orderCount(0L)
                .totalSales(BigDecimal.ZERO)
                .build());
            rItem.setOrderCount(rItem.getOrderCount() + 1);
            rItem.setTotalSales(rItem.getTotalSales().add(o.getTotalAmount()));

            // By Month
            String monthKey = o.getCreatedAt().format(monthFormatter);
            MonthlySalesItem mItem = monthMap.computeIfAbsent(monthKey, k -> MonthlySalesItem.builder()
                .month(monthKey)
                .orderCount(0L)
                .totalSales(BigDecimal.ZERO)
                .build());
            mItem.setOrderCount(mItem.getOrderCount() + 1);
            mItem.setTotalSales(mItem.getTotalSales().add(o.getTotalAmount()));
        }

        long ordersCount = orders.size();
        BigDecimal avgCheck = ordersCount > 0
            ? totalRevenue.divide(BigDecimal.valueOf(ordersCount), 2, RoundingMode.HALF_UP)
            : BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);

        return SalesReportResponse.builder()
            .period(startDate.format(DateTimeFormatter.ISO_LOCAL_DATE) + " to " + endDate.format(DateTimeFormatter.ISO_LOCAL_DATE))
            .regionFilter(regionCode != null ? regionCode : "ALL")
            .totalSubtotal(totalSubtotal.setScale(2, RoundingMode.HALF_UP))
            .totalVat(totalVat.setScale(2, RoundingMode.HALF_UP))
            .totalDiscount(totalDiscount.setScale(2, RoundingMode.HALF_UP))
            .totalRevenue(totalRevenue.setScale(2, RoundingMode.HALF_UP))
            .averageCheck(avgCheck)
            .totalOrdersCount(ordersCount)
            .salesByRegion(new ArrayList<>(regionMap.values()))
            .salesByMonth(new ArrayList<>(monthMap.values()))
            .build();
    }

    public byte[] exportCsv(LocalDateTime startDate, LocalDateTime endDate, String regionCode)
    {
        SalesReportResponse report = generateSalesReport(startDate, endDate, regionCode);

        try (ByteArrayOutputStream baos = new ByteArrayOutputStream(); OutputStreamWriter osw = new OutputStreamWriter(baos, StandardCharsets.UTF_8); CSVWriter writer = new CSVWriter(osw))
        {
            // Header metadata
            writer.writeNext(new String[] { "Cherry Cake Bakery & Café - Sales Report" });
            writer.writeNext(new String[] { "Report Period", report.getPeriod() });
            writer.writeNext(new String[] { "Region Filter", report.getRegionFilter() });
            writer.writeNext(new String[] { "Generated At", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME) });
            writer.writeNext(new String[] { "" });

            // KPIs
            writer.writeNext(new String[] { "Total Orders", "Total Subtotal", "Total VAT", "Total Discount", "Total Revenue", "Average Check" });
            writer.writeNext(new String[]
            {
                    String.valueOf(report.getTotalOrdersCount()),
                    report.getTotalSubtotal().toString(),
                    report.getTotalVat().toString(),
                    report.getTotalDiscount().toString(),
                    report.getTotalRevenue().toString(),
                    report.getAverageCheck().toString()
            });
            writer.writeNext(new String[] { "" });

            // By Region
            writer.writeNext(new String[] { "Region Sales Breakdown" });
            writer.writeNext(new String[] { "Region Code", "Region Name", "Orders Count", "Total Sales" });
            for (RegionSalesItem item : report.getSalesByRegion())
            {
                writer.writeNext(new String[]
                {
                    item.getRegionCode(),
                    item.getRegionName(),
                    String.valueOf(item.getOrderCount()),
                    item.getTotalSales().toString()
                });
            }
            writer.writeNext(new String[] { "" });

            // By Month
            writer.writeNext(new String[] { "Monthly Sales Breakdown" });
            writer.writeNext(new String[] { "Month", "Orders Count", "Total Sales" });
            for (MonthlySalesItem item : report.getSalesByMonth())
            {
                writer.writeNext(new String[]
                {
                    item.getMonth(),
                    String.valueOf(item.getOrderCount()),
                    item.getTotalSales().toString()
                });
            }

            writer.flush();
            return baos.toByteArray();
        } catch (Exception e) { throw new RuntimeException("Failed to generate CSV sales report", e); }
    }
}