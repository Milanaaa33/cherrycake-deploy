package com.cherrycake.report.service;

import com.cherrycake.report.dto.ReportFilters;
import com.cherrycake.report.dto.ReportFilters.GroupBy;
import com.cherrycake.report.dto.SalesReportResponse;
import com.cherrycake.report.dto.SalesReportResponse.Row;
import com.lowagie.text.Document;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.Image;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;
import org.jfree.chart.ChartFactory;
import org.jfree.chart.ChartUtils;
import org.jfree.chart.JFreeChart;
import org.jfree.chart.axis.NumberAxis;
import org.jfree.chart.plot.PlotOrientation;
import org.jfree.data.category.DefaultCategoryDataset;
import org.springframework.stereotype.Service;

@Service
public class SalesReportPdfService {
    private static final Color CHERRY = new Color(124, 63, 88);
    private static final Color ROSE = new Color(201, 76, 109);
    private static final Font BODY = FontFactory.getFont(FontFactory.HELVETICA, 10);
    private static final Font HEADING = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18);

    public byte[] render(ReportFilters filters, SalesReportResponse report) {
        try (var output = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A4, 36, 36, 32, 32);
            try {
                PdfWriter.getInstance(document, output);
                document.addTitle("Cherry Cake Sales Report");
                document.addAuthor("Cherry Cake");
                document.open();
                title(document, "Cherry Cake Sales Report");
                filters(document, filters, report);
                PdfPTable kpi = new PdfPTable(new float[]{3, 2});
                kpi.setWidthPercentage(100);
                add(kpi, "Metric", "Value");
                add(kpi, "Orders", Long.toString(report.kpi().ordersCount()));
                add(kpi, "Subtotal", report.kpi().subtotalSum().toPlainString());
                add(kpi, "VAT", report.kpi().vatSum().toPlainString());
                add(kpi, "Discount", report.kpi().discountSum().toPlainString());
                add(kpi, "Total", report.kpi().totalSum().toPlainString());
                document.add(kpi);
                // Keep each chart legible for long ranges; every row is included, in chronological order.
                int chunks = Math.max(1, (report.rows().size() + 11) / 12);
                for (int chunk = 0; chunk < chunks; chunk++) {
                    if (chunk > 0) {
                        document.newPage();
                        title(document, "Sales charts continued");
                        filters(document, filters, report);
                    }
                    List<Row> rows = report.rows().subList(chunk * 12, Math.min(report.rows().size(), (chunk + 1) * 12));
                    document.add(chart(rows, filters, report, true));
                    document.add(chart(rows, filters, report, false));
                }
                document.newPage();
                title(document, "Sales breakdown");
                filters(document, filters, report);
                PdfPTable table = new PdfPTable(new float[]{3, 2, 3});
                table.setWidthPercentage(100);
                table.setHeaderRows(1);
                table.setSplitRows(false);
                add(table, filters.groupBy() == GroupBy.REGION ? "Region" : "Month", "Orders", "Total");
                for (Row row : report.rows()) {
                    add(table, row.label(), Long.toString(row.ordersCount()), row.total().toPlainString());
                }
                document.add(table);
                if (report.rows().isEmpty()) {
                    document.add(new Paragraph("No orders match the selected filters.", BODY));
                }
            } finally {
                document.close();
            }
            return output.toByteArray();
        } catch (IOException ex) {
            throw new IllegalStateException("Could not generate sales PDF", ex);
        }
    }

    private static void title(Document document, String text) {
        Paragraph title = new Paragraph(text, HEADING);
        title.setSpacingAfter(10);
        document.add(title);
    }

    private static void filters(Document document, ReportFilters filters, SalesReportResponse report) {
        Paragraph details = new Paragraph("Period: " + filters.from() + " to " + filters.to()
                + " (inclusive)\nRegion: " + (filters.region() == null ? "All regions" : filters.region())
                + " | Grouping: " + filters.groupBy() + " | Currency: "
                + (report.currencyCode() == null ? "No sales" : report.currencyCode()), BODY);
        details.setSpacingAfter(10);
        document.add(details);
        if ("MIXED".equals(report.currencyCode())) {
            Paragraph note = new Paragraph("Totals combine stored local-currency amounts. "
                    + "Select one region for a single-currency report; no currency conversion is applied.", BODY);
            note.setSpacingAfter(10);
            document.add(note);
        }
    }

    private static Image chart(List<Row> rows, ReportFilters filters, SalesReportResponse report,
            boolean orders) throws IOException {
        DefaultCategoryDataset dataset = new DefaultCategoryDataset();
        String series = orders ? "Orders" : "Revenue";
        for (Row row : rows) {
            dataset.addValue(orders ? Long.valueOf(row.ordersCount()) : row.total(), series, row.label());
        }
        String dimension = filters.groupBy() == GroupBy.REGION ? "Region" : "Month";
        String units = orders ? "Orders" : "Revenue (" + (report.currencyCode() == null ? "local amounts" : report.currencyCode()) + ")";
        JFreeChart chart = orders
                ? ChartFactory.createBarChart("Orders by " + dimension.toLowerCase(java.util.Locale.ROOT), dimension,
                        units, dataset, PlotOrientation.VERTICAL, false, false, false)
                : ChartFactory.createLineChart("Revenue trend", dimension, units, dataset,
                        PlotOrientation.VERTICAL, false, false, false);
        chart.setBackgroundPaint(Color.WHITE);
        chart.getTitle().setFont(new java.awt.Font("SansSerif", java.awt.Font.BOLD, 24));
        var plot = chart.getCategoryPlot();
        plot.getDomainAxis().setLabelFont(new java.awt.Font("SansSerif", java.awt.Font.PLAIN, 20));
        plot.getDomainAxis().setTickLabelFont(new java.awt.Font("SansSerif", java.awt.Font.PLAIN, 18));
        if (rows.size() > 6) {
            plot.getDomainAxis().setCategoryLabelPositions(org.jfree.chart.axis.CategoryLabelPositions.UP_45);
            plot.getDomainAxis().setMaximumCategoryLabelWidthRatio(1.8f);
        }
        plot.getRangeAxis().setLabelFont(new java.awt.Font("SansSerif", java.awt.Font.PLAIN, 20));
        plot.getRangeAxis().setTickLabelFont(new java.awt.Font("SansSerif", java.awt.Font.PLAIN, 18));
        plot.setBackgroundPaint(Color.WHITE);
        plot.setRangeGridlinePaint(new Color(225, 225, 225));
        plot.setNoDataMessage("No orders match the selected filters");
        plot.getRenderer().setSeriesPaint(0, orders ? ROSE : CHERRY);
        plot.getRenderer().setSeriesStroke(0, new java.awt.BasicStroke(2.5f));
        ((NumberAxis) plot.getRangeAxis()).setAutoRangeIncludesZero(true);
        if (orders) {
            ((NumberAxis) plot.getRangeAxis()).setStandardTickUnits(NumberAxis.createIntegerTickUnits());
        }
        try (var bytes = new ByteArrayOutputStream()) {
            ChartUtils.writeChartAsPNG(bytes, chart, 1100, 340);
            Image image = Image.getInstance(bytes.toByteArray());
            image.scaleToFit(520, 161);
            image.setSpacingBefore(12);
            return image;
        }
    }

    private static void add(PdfPTable table, String... values) {
        for (String value : values) {
            PdfPCell cell = new PdfPCell(new Phrase(value, BODY));
            cell.setPadding(7);
            cell.setBorderColor(new Color(210, 210, 210));
            table.addCell(cell);
        }
    }
}
