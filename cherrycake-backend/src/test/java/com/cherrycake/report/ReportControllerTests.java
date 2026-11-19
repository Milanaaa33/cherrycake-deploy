package com.cherrycake.report;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.cherrycake.report.dto.ReportFilters;
import com.cherrycake.report.dto.SalesReportResponse;
import com.cherrycake.report.service.SalesReportPdfService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.lowagie.text.pdf.PdfName;
import com.lowagie.text.pdf.PdfReader;
import com.lowagie.text.pdf.parser.PdfTextExtractor;
import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDate;
import java.util.ArrayList;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class ReportControllerTests {
    @Autowired private MockMvc mvc;
    @Autowired private JdbcTemplate jdbc;
    @Autowired private ObjectMapper mapper;
    @Autowired private SalesReportPdfService pdf;

    @BeforeEach
    void data() {
        jdbc.update("DELETE FROM order_items");
        jdbc.update("DELETE FROM orders");
        order("a", "UZB", "2026-01-01", "80.00", "12.00", "1.00", "100.10", "UZS");
        order("b", "UZB", "2026-01-31", "160.00", "24.00", "2.00", "200.20", "UZS");
        order("c", "GEO", "2026-01-15", "30.00", "4.50", "0.00", "40.04", "GEL");
        order("d", "UZB", "2026-02-01", "40.00", "6.00", "1.00", "50.50", "UZS");
        order("e", "UZB", "2025-12-31", "9000.00", "900.00", "1.00", "9999.00", "UZS");
        order("f", "UZB", "2027-01-01", "70.00", "10.00", "1.00", "79.00", "UZS");
    }

    @Test
    void kpiEqualsIndependentSqlAndRegionRowsSumToKpi() throws Exception {
        JsonNode report = report("&groupBy=REGION");
        var expected = jdbc.queryForMap("SELECT COUNT(*) AS n, SUM(subtotal) AS s, SUM(vat_amount) AS v, "
                + "SUM(discount_amount) AS d, SUM(total) AS t FROM orders "
                + "WHERE order_date BETWEEN DATE '2026-01-01' AND DATE '2026-01-31'");
        assertThat(report.at("/kpi/ordersCount").asLong()).isEqualTo(((Number) expected.get("n")).longValue());
        String[] fields = {"subtotalSum", "vatSum", "discountSum", "totalSum"};
        String[] columns = {"s", "v", "d", "t"};
        for (int i = 0; i < fields.length; i++) {
            assertThat(report.path("kpi").path(fields[i]).decimalValue())
                    .isEqualByComparingTo((BigDecimal) expected.get(columns[i]));
        }
        // (100.10 + 200.20 + 40.04) / 3 orders = 113.4466..., rounded half up.
        assertThat(report.at("/kpi/averageOrderValue").decimalValue()).isEqualByComparingTo("113.45");
        assertThat(report.path("rows").size()).isEqualTo(2);
        assertThat(report.at("/rows/0/label").asText()).isEqualTo("GEO");
        assertThat(report.at("/rows/0/total").decimalValue()).isEqualByComparingTo("40.04");
        assertThat(report.at("/rows/1/total").decimalValue()).isEqualByComparingTo("300.30");
        assertThat(report.path("currencyCode").asText()).isEqualTo("MIXED");
    }

    @Test
    void filtersRegionAndUsesInclusiveOrderDatesRatherThanCreatedAt() throws Exception {
        JsonNode report = report("&region=UZB");
        assertThat(report.at("/kpi/ordersCount").asInt()).isEqualTo(2);
        assertThat(report.at("/kpi/totalSum").decimalValue()).isEqualByComparingTo("300.30");
        assertThat(report.at("/kpi/averageOrderValue").decimalValue()).isEqualByComparingTo("150.15");
        assertThat(report.at("/rows/0/label").asText()).isEqualTo("2026-01");
        assertThat(report.path("currencyCode").asText()).isEqualTo("UZS");
        mvc.perform(get("/api/reports/sales?from=2026-01-31&to=2026-01-31&region=UZB"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.kpi.ordersCount").value(1))
                .andExpect(jsonPath("$.kpi.totalSum").value(200.20));
    }

    @Test
    void monthBucketsKeepDifferentYearsSeparateAndChronological() throws Exception {
        mvc.perform(get("/api/reports/sales?from=2026-01-01&to=2027-01-01&region=UZB&groupBy=MONTH"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.rows.length()").value(3))
                .andExpect(jsonPath("$.rows[0].label").value("2026-01"))
                .andExpect(jsonPath("$.rows[1].label").value("2026-02"))
                .andExpect(jsonPath("$.rows[2].label").value("2027-01"));
    }

    @Test
    void emptyReportReturnsZeroMoneyAndNoRows() throws Exception {
        mvc.perform(get("/api/reports/sales?from=2024-01-01&to=2024-01-31&region=UZB"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.kpi.ordersCount").value(0))
                .andExpect(jsonPath("$.kpi.subtotalSum").value(0))
                .andExpect(jsonPath("$.kpi.vatSum").value(0))
                .andExpect(jsonPath("$.kpi.discountSum").value(0))
                .andExpect(jsonPath("$.kpi.totalSum").value(0))
                .andExpect(jsonPath("$.kpi.averageOrderValue").value(0))
                .andExpect(jsonPath("$.rows").isEmpty()).andExpect(jsonPath("$.currencyCode").value("UZS"));
    }

    @ParameterizedTest
    @ValueSource(strings = {"from=2026-02-01&to=2026-01-01", "from=not-a-date", "groupBy=WEEK",
            "region=UZ", "region=", "region=UZB%27%20OR%201=1", "to=2026-02-30"})
    void invalidFiltersReturnCommon400ForJsonAndPdf(String filters) throws Exception {
        for (String endpoint : new String[]{"sales", "export"}) {
            mvc.perform(get("/api/reports/" + endpoint + "?" + filters))
                    .andExpect(status().isBadRequest()).andExpect(jsonPath("$.status").value(400))
                    .andExpect(jsonPath("$.errors").isArray()).andExpect(jsonPath("$.timestamp").isNotEmpty());
        }
    }

    @Test
    void unknownRegionIs404AndUnsupportedFormatIs400() throws Exception {
        for (String endpoint : new String[]{"sales", "export"}) {
            mvc.perform(get("/api/reports/" + endpoint + "?region=XYZ"))
                    .andExpect(status().isNotFound()).andExpect(jsonPath("$.status").value(404));
        }
        mvc.perform(get("/api/reports/export?format=CSV"))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.status").value(400));
    }

    @Test
    void pdfContainsSameFiltersKpiRowsAndTwoEmbeddedCharts() throws Exception {
        JsonNode report = report("&groupBy=REGION");
        byte[] bytes = mvc.perform(get("/api/reports/export?format=PDF&from=2026-01-01&to=2026-01-31&groupBy=REGION"))
                .andExpect(status().isOk()).andExpect(content().contentType(MediaType.APPLICATION_PDF))
                .andExpect(header().string("Content-Disposition", org.hamcrest.Matchers.containsString("attachment;")))
                .andReturn().getResponse().getContentAsByteArray();
        try (PdfReader reader = new PdfReader(bytes)) {
            String text = text(reader);
            assertThat(text).contains("2026-01-01", "2026-01-31", "All regions", "REGION", "MIXED");
            for (String field : new String[]{"subtotalSum", "vatSum", "discountSum", "totalSum", "averageOrderValue"}) {
                assertThat(text).contains(report.path("kpi").path(field).decimalValue().setScale(2).toPlainString());
            }
            assertThat(text).contains("GEO", "UZB", "40.04", "300.30");
            int images = 0;
            for (int i = 1; i <= reader.getNumberOfPages(); i++) {
                var objects = reader.getPageN(i).getAsDict(PdfName.RESOURCES).getAsDict(PdfName.XOBJECT);
                if (objects != null) {
                    for (PdfName key : objects.getKeys()) {
                        var object = (com.lowagie.text.pdf.PdfDictionary) PdfReader.getPdfObject(objects.get(key));
                        if (PdfName.IMAGE.equals(object.getAsName(PdfName.SUBTYPE))) { images++; }
                    }
                }
            }
            assertThat(images).isEqualTo(2);
        }
        Files.write(Path.of("target/sales-report-sample.pdf"), bytes);
    }

    @Test
    void emptyPdfAndLongReportsAreReadableAndIncludeEveryRow() throws Exception {
        var rows = new ArrayList<SalesReportResponse.Row>();
        for (int i = 0; i < 40; i++) {
            rows.add(new SalesReportResponse.Row(LocalDate.of(2020, 1, 1).plusMonths(i).toString().substring(0, 7),
                    1, new BigDecimal("123456789.12")));
        }
        var kpi = new SalesReportResponse.Kpi(40, BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO,
                new BigDecimal("4938271564.80"), new BigDecimal("123456789.12"));
        var filters = new ReportFilters(LocalDate.of(2020, 1, 1), LocalDate.of(2023, 12, 31), "UZB", ReportFilters.GroupBy.MONTH);
        byte[] bytes = pdf.render(filters, new SalesReportResponse(kpi, rows, "UZS"));
        try (PdfReader reader = new PdfReader(bytes)) {
            assertThat(reader.getNumberOfPages()).isGreaterThanOrEqualTo(5);
            for (var row : rows) { assertThat(text(reader)).contains(row.label(), row.total().toPlainString()); }
        }
        Files.write(Path.of("target/sales-report-long.pdf"), bytes);
        byte[] empty = mvc.perform(get("/api/reports/export?from=2024-01-01&to=2024-01-31"))
                .andExpect(status().isOk()).andReturn().getResponse().getContentAsByteArray();
        try (PdfReader reader = new PdfReader(empty)) {
            assertThat(text(reader)).contains("No orders match", "0.00");
        }
    }

    private JsonNode report(String filters) throws Exception {
        return mapper.readTree(mvc.perform(get("/api/reports/sales?from=2026-01-01&to=2026-01-31" + filters))
                .andExpect(status().isOk()).andReturn().getResponse().getContentAsString());
    }

    private static String text(PdfReader reader) throws Exception {
        StringBuilder text = new StringBuilder();
        PdfTextExtractor extractor = new PdfTextExtractor(reader);
        for (int i = 1; i <= reader.getNumberOfPages(); i++) { text.append(extractor.getTextFromPage(i)); }
        return text.toString();
    }

    private void order(String number, String region, String date, String subtotal, String vat,
            String discount, String total, String currency) {
        jdbc.update("INSERT INTO orders (order_number, order_date, region_id, customer_name, phone, email, "
                + "subtotal, vat_amount, discount_amount, total, currency_code, created_at) "
                + "VALUES (?, CAST(? AS DATE), (SELECT id FROM regions WHERE code = ?), 'Test', '+998901234567', "
                + "'test@example.com', ?, ?, ?, ?, ?, TIMESTAMP '2020-01-01 00:00:00')",
                number, date, region, new BigDecimal(subtotal), new BigDecimal(vat), new BigDecimal(discount),
                new BigDecimal(total), currency);
    }
}
