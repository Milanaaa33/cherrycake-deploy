package com.cherrycake;

import static org.assertj.core.api.Assertions.assertThat;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test")
class SeedDataTests {

    @Autowired
    private JdbcTemplate jdbc;

    @Test
    void seedsFiveRegionsWithVatAndExchangeRate() {
        List<Map<String, Object>> regions = jdbc.queryForList(
                "SELECT code, currency_code, vat_rate, exchange_rate FROM regions ORDER BY code");

        assertThat(regions).extracting(r -> r.get("code"))
                .containsExactly("CHN", "GEO", "KAZ", "UKR", "UZB");
        assertThat(regions).extracting(r -> r.get("currency_code"))
                .containsExactly("CNY", "GEL", "KZT", "UAH", "UZS");
        assertThat(regions).extracting(r -> ((BigDecimal) r.get("vat_rate")).stripTrailingZeros())
                .containsExactly(new BigDecimal("0.18"), new BigDecimal("0.12"), new BigDecimal("0.2"),
                        new BigDecimal("0.08"), new BigDecimal("0.15"));
        assertThat(regions).extracting(r -> (BigDecimal) r.get("exchange_rate"))
                .allMatch(rate -> rate.signum() > 0);
    }

    @Test
    void seedsThreeCategoriesAndTwelveProducts() {
        assertThat(count("SELECT COUNT(*) FROM categories")).isEqualTo(3);
        assertThat(count("SELECT COUNT(*) FROM products")).isEqualTo(12);
    }

    @Test
    void everyProductHasPriceInEveryRegion() {
        assertThat(count("SELECT COUNT(*) FROM regional_prices")).isEqualTo(12 * 5);
    }

    @Test
    void someProductsAreSoldOutInOneRegion() {
        List<String> soldOut = jdbc.queryForList(
                "SELECT p.name || ' ' || r.code FROM regional_prices rp "
                        + "JOIN products p ON p.id = rp.product_id JOIN regions r ON r.id = rp.region_id "
                        + "WHERE rp.in_stock = FALSE ORDER BY 1",
                String.class);

        assertThat(soldOut).containsExactly("Macarons Box CHN", "Napoleon Cake GEO");
    }

    @Test
    void everyModifierGroupHasModifiersAndEveryModifierHasPriceInEveryRegion() {
        assertThat(count("SELECT COUNT(*) FROM modifier_groups g "
                + "WHERE NOT EXISTS (SELECT 1 FROM modifiers m WHERE m.group_id = g.id)")).isZero();
        assertThat(count("SELECT COUNT(*) FROM modifiers")).isPositive();
        assertThat(count("SELECT COUNT(*) FROM modifier_regional_prices"))
                .isEqualTo(count("SELECT COUNT(*) FROM modifiers") * 5);
    }

    @Test
    void seedsBothModifierGroupTypes() {
        assertThat(jdbc.queryForList("SELECT DISTINCT type FROM modifier_groups ORDER BY type", String.class))
                .containsExactly("MULTI", "SINGLE");
    }

    @Test
    void seedsDiscountTableFromSpec() {
        List<Map<String, Object>> rules = jdbc.queryForList(
                "SELECT threshold, rate FROM discount_rules ORDER BY threshold");

        assertThat(rules).extracting(r -> ((BigDecimal) r.get("threshold")).intValue())
                .containsExactly(100, 500, 700, 1000, 5000);
        assertThat(rules).extracting(r -> ((BigDecimal) r.get("rate")).stripTrailingZeros())
                .containsExactly(new BigDecimal("0.03"), new BigDecimal("0.05"), new BigDecimal("0.07"),
                        new BigDecimal("0.1"), new BigDecimal("0.15"));
    }

    @Test
    void leavesNoTemporaryTablesBehind() {
        assertThat(count("SELECT COUNT(*) FROM information_schema.tables "
                + "WHERE LOWER(table_name) IN ('seed_modifiers', 'seed_product_kinds')")).isZero();
    }

    private int count(String sql) {
        return jdbc.queryForObject(sql, Integer.class);
    }
}
