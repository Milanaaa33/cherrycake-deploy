package com.cherrycake.report;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.lowagie.text.pdf.PdfReader;
import com.lowagie.text.pdf.parser.PdfTextExtractor;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.LocalDateTime;
import java.util.HexFormat;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

/**
 * CC-56 QA Reconciliation: verifies Web/JSON API == Exported PDF == Independent SQL across all 3 required filter sets.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class QaReportReconciliationTests {

    private static final String QA_STAFF_TOKEN = "qa-reconciliation-staff-token";
    private static final String QA_STAFF_AUTH = "Bearer " + QA_STAFF_TOKEN;

    @Autowired private MockMvc mvc;
    @Autowired private JdbcTemplate jdbc;
    @Autowired private ObjectMapper mapper;

    @BeforeEach
    void seedSixMonthsAndAuthSession() throws Exception {
        MessageDigest digest = MessageDigest.getInstance("SHA-256");
        String tokenHash = HexFormat.of().formatHex(digest.digest(QA_STAFF_TOKEN.getBytes(StandardCharsets.UTF_8)));
        jdbc.update("DELETE FROM auth_sessions WHERE token_hash = ?", tokenHash);
        jdbc.update("INSERT INTO auth_sessions (token_hash, email, expires_at) VALUES (?, ?, ?)",
                tokenHash, "qa-staff@cherrycake.test", LocalDateTime.now().plusDays(1));
        jdbc.update("DELETE FROM user_roles WHERE email = ?", "qa-staff@cherrycake.test");
        jdbc.update("INSERT INTO user_roles (email, role) VALUES (?, 'STAFF')", "qa-staff@cherrycake.test");

        jdbc.update("DELETE FROM order_items");
        jdbc.update("DELETE FROM orders");

        // Six-month span across UZB, KAZ, GEO, UKR, CHN plus one outside-window order
        insertOrder("QA-2026-001", "UZB", "2026-06-10", "100.00", "15.00", "3.45", "111.55", "UZS");
        insertOrder("QA-2026-002", "UZB", "2026-08-22", "200.00", "30.00", "6.90", "223.10", "UZS");
        insertOrder("QA-2026-003", "KAZ", "2026-09-05", "400.00", "80.00", "14.40", "465.60", "KZT");
        insertOrder("QA-2026-004", "GEO", "2026-10-14", "90.00", "10.80", "3.02", "97.78", "GEL");
        insertOrder("QA-2026-005", "UKR", "2026-11-03", "100.00", "8.00", "3.24", "104.76", "UAH");
        insertOrder("QA-2026-006", "CHN", "2026-11-18", "100.00", "18.00", "3.54", "114.46", "CNY");
        insertOrder("QA-2026-007", "UZB", "2026-11-25", "500.00", "75.00", "28.75", "546.25", "UZS");
        insertOrder("QA-2025-999", "UZB", "2025-12-15", "999.00", "99.00", "0.00", "1098.00", "UZS");
    }

    @Test
    void reconcilesFilterSet1AllCountriesSixMonthsByRegion() throws Exception {
        String query = "from=2026-06-01&to=2026-11-30&groupBy=REGION";
        JsonNode json = fetchReportJson(query);
        String pdfText = fetchReportPdfText(query);

        Map<String, Object> sqlKpi = jdbc.queryForMap(
                "SELECT COUNT(*) AS cnt, SUM(subtotal) AS sub, SUM(vat_amount) AS vat, "
                        + "SUM(discount_amount) AS disc, SUM(total) AS tot "
                        + "FROM orders WHERE order_date >= DATE '2026-06-01' AND order_date <= DATE '2026-11-30'");

        assertKpiAndPdfMatchSql(json, pdfText, sqlKpi, "MIXED");

        var sqlRows = jdbc.queryForList(
                "SELECT r.code AS label, COUNT(*) AS cnt, SUM(o.total) AS tot "
                        + "FROM orders o JOIN regions r ON r.id = o.region_id "
                        + "WHERE o.order_date >= DATE '2026-06-01' AND o.order_date <= DATE '2026-11-30' "
                        + "GROUP BY r.code ORDER BY r.code");
        assertRowsMatchSqlAndPdf(json, pdfText, sqlRows);
    }

    @Test
    void reconcilesFilterSet2SingleCountrySixMonthsByMonth() throws Exception {
        String query = "from=2026-06-01&to=2026-11-30&region=UZB&groupBy=MONTH";
        JsonNode json = fetchReportJson(query);
        String pdfText = fetchReportPdfText(query);

        Map<String, Object> sqlKpi = jdbc.queryForMap(
                "SELECT COUNT(*) AS cnt, SUM(o.subtotal) AS sub, SUM(o.vat_amount) AS vat, "
                        + "SUM(o.discount_amount) AS disc, SUM(o.total) AS tot "
                        + "FROM orders o JOIN regions r ON r.id = o.region_id "
                        + "WHERE r.code = 'UZB' AND o.order_date >= DATE '2026-06-01' AND o.order_date <= DATE '2026-11-30'");

        assertKpiAndPdfMatchSql(json, pdfText, sqlKpi, "UZS");

        var sqlRows = jdbc.queryForList(
                "SELECT EXTRACT(YEAR FROM o.order_date) AS yr, EXTRACT(MONTH FROM o.order_date) AS mo, "
                        + "COUNT(*) AS cnt, SUM(o.total) AS tot "
                        + "FROM orders o JOIN regions r ON r.id = o.region_id "
                        + "WHERE r.code = 'UZB' AND o.order_date >= DATE '2026-06-01' AND o.order_date <= DATE '2026-11-30' "
                        + "GROUP BY EXTRACT(YEAR FROM o.order_date), EXTRACT(MONTH FROM o.order_date) "
                        + "ORDER BY yr, mo");

        assertThat(json.path("rows").size()).isEqualTo(sqlRows.size());
        for (int i = 0; i < sqlRows.size(); i++) {
            Map<String, Object> dbRow = sqlRows.get(i);
            String expectedLabel = String.format(java.util.Locale.ROOT, "%04d-%02d",
                    ((Number) dbRow.get("yr")).intValue(), ((Number) dbRow.get("mo")).intValue());
            JsonNode apiRow = json.path("rows").get(i);
            assertThat(apiRow.path("label").asText()).isEqualTo(expectedLabel);
            assertThat(apiRow.path("ordersCount").asLong()).isEqualTo(((Number) dbRow.get("cnt")).longValue());
            assertThat(apiRow.path("total").decimalValue()).isEqualByComparingTo((BigDecimal) dbRow.get("tot"));
            assertThat(pdfText).contains(expectedLabel, ((BigDecimal) dbRow.get("tot")).setScale(2, RoundingMode.HALF_UP).toPlainString());
        }
    }

    @Test
    void reconcilesFilterSet3SingleMonthAllCountriesByRegion() throws Exception {
        String query = "from=2026-11-01&to=2026-11-30&groupBy=REGION";
        JsonNode json = fetchReportJson(query);
        String pdfText = fetchReportPdfText(query);

        Map<String, Object> sqlKpi = jdbc.queryForMap(
                "SELECT COUNT(*) AS cnt, SUM(subtotal) AS sub, SUM(vat_amount) AS vat, "
                        + "SUM(discount_amount) AS disc, SUM(total) AS tot "
                        + "FROM orders WHERE order_date >= DATE '2026-11-01' AND order_date <= DATE '2026-11-30'");

        assertKpiAndPdfMatchSql(json, pdfText, sqlKpi, "MIXED");

        var sqlRows = jdbc.queryForList(
                "SELECT r.code AS label, COUNT(*) AS cnt, SUM(o.total) AS tot "
                        + "FROM orders o JOIN regions r ON r.id = o.region_id "
                        + "WHERE o.order_date >= DATE '2026-11-01' AND o.order_date <= DATE '2026-11-30' "
                        + "GROUP BY r.code ORDER BY r.code");
        assertRowsMatchSqlAndPdf(json, pdfText, sqlRows);
    }

    private JsonNode fetchReportJson(String query) throws Exception {
        String content = mvc.perform(get("/api/reports/sales?" + query).header("Authorization", QA_STAFF_AUTH))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();
        return mapper.readTree(content);
    }

    private String fetchReportPdfText(String query) throws Exception {
        byte[] pdfBytes = mvc.perform(get("/api/reports/export?format=PDF&" + query).header("Authorization", QA_STAFF_AUTH))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_PDF))
                .andReturn()
                .getResponse()
                .getContentAsByteArray();

        try (PdfReader reader = new PdfReader(pdfBytes)) {
            PdfTextExtractor extractor = new PdfTextExtractor(reader);
            StringBuilder text = new StringBuilder();
            for (int page = 1; page <= reader.getNumberOfPages(); page++) {
                text.append(extractor.getTextFromPage(page));
            }
            return text.toString();
        }
    }

    private static void assertKpiAndPdfMatchSql(
            JsonNode json, String pdfText, Map<String, Object> sqlKpi, String expectedCurrency) {
        long count = ((Number) sqlKpi.get("cnt")).longValue();
        BigDecimal sub = ((BigDecimal) sqlKpi.get("sub")).setScale(2, RoundingMode.HALF_UP);
        BigDecimal vat = ((BigDecimal) sqlKpi.get("vat")).setScale(2, RoundingMode.HALF_UP);
        BigDecimal disc = ((BigDecimal) sqlKpi.get("disc")).setScale(2, RoundingMode.HALF_UP);
        BigDecimal tot = ((BigDecimal) sqlKpi.get("tot")).setScale(2, RoundingMode.HALF_UP);
        BigDecimal avg = tot.divide(BigDecimal.valueOf(count), 2, RoundingMode.HALF_UP);

        assertThat(json.path("currencyCode").asText()).isEqualTo(expectedCurrency);
        assertThat(json.at("/kpi/ordersCount").asLong()).isEqualTo(count);
        assertThat(json.at("/kpi/subtotalSum").decimalValue()).isEqualByComparingTo(sub);
        assertThat(json.at("/kpi/vatSum").decimalValue()).isEqualByComparingTo(vat);
        assertThat(json.at("/kpi/discountSum").decimalValue()).isEqualByComparingTo(disc);
        assertThat(json.at("/kpi/totalSum").decimalValue()).isEqualByComparingTo(tot);
        assertThat(json.at("/kpi/averageOrderValue").decimalValue()).isEqualByComparingTo(avg);

        assertThat(pdfText).contains(
                expectedCurrency,
                Long.toString(count),
                sub.toPlainString(),
                vat.toPlainString(),
                disc.toPlainString(),
                tot.toPlainString(),
                avg.toPlainString());
    }

    private static void assertRowsMatchSqlAndPdf(
            JsonNode json, String pdfText, java.util.List<Map<String, Object>> sqlRows) {
        assertThat(json.path("rows").size()).isEqualTo(sqlRows.size());
        for (int i = 0; i < sqlRows.size(); i++) {
            Map<String, Object> dbRow = sqlRows.get(i);
            String label = (String) dbRow.get("label");
            long count = ((Number) dbRow.get("cnt")).longValue();
            BigDecimal total = ((BigDecimal) dbRow.get("tot")).setScale(2, RoundingMode.HALF_UP);

            JsonNode apiRow = json.path("rows").get(i);
            assertThat(apiRow.path("label").asText()).isEqualTo(label);
            assertThat(apiRow.path("ordersCount").asLong()).isEqualTo(count);
            assertThat(apiRow.path("total").decimalValue()).isEqualByComparingTo(total);
            assertThat(pdfText).contains(label, total.toPlainString());
        }
    }

    private void insertOrder(String number, String region, String date, String subtotal,
            String vat, String discount, String total, String currency) {
        jdbc.update(
                "INSERT INTO orders (order_number, order_date, region_id, customer_name, phone, email, "
                        + "subtotal, vat_amount, discount_amount, total, currency_code, created_at) "
                        + "VALUES (?, CAST(? AS DATE), (SELECT id FROM regions WHERE code = ?), 'QA Customer', '+998901234567', "
                        + "'qa@example.com', ?, ?, ?, ?, ?, TIMESTAMP '2026-06-01 00:00:00')",
                number, date, region, new BigDecimal(subtotal), new BigDecimal(vat),
                new BigDecimal(discount), new BigDecimal(total), currency);
    }
}
