package com.cherrycake;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class CatalogMigrationTests {

    @Autowired
    private JdbcTemplate jdbc;

    @Test
    void createsAllCatalogTables() {
        List<String> tables = jdbc.queryForList(
                "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'",
                String.class);

        assertThat(tables).contains(
                "regions", "categories", "products", "regional_prices",
                "modifier_groups", "modifiers", "modifier_regional_prices", "discount_rules");
    }

    @Test
    void rejectsUnknownModifierGroupType() {
        long productId = insertProduct();

        assertThatThrownBy(() -> jdbc.update(
                "INSERT INTO modifier_groups (product_id, name, type) VALUES (?, 'Size', 'ANY')", productId))
                .isInstanceOf(DataIntegrityViolationException.class);
    }

    @Test
    void rejectsSecondPriceForSameProductAndRegion() {
        long productId = insertProduct();
        long regionId = insertRegion();
        jdbc.update("INSERT INTO regional_prices (product_id, region_id, price) VALUES (?, ?, 10.00)",
                productId, regionId);

        assertThatThrownBy(() -> jdbc.update(
                "INSERT INTO regional_prices (product_id, region_id, price) VALUES (?, ?, 12.00)",
                productId, regionId))
                .isInstanceOf(DataIntegrityViolationException.class);
    }

    @Test
    void rejectsVatRateGivenAsPercent() {
        assertThatThrownBy(() -> jdbc.update(
                "INSERT INTO regions (code, name, currency_code, currency_symbol, vat_rate) "
                        + "VALUES ('TST', 'Test', 'TST', 'T', 15)"))
                .isInstanceOf(DataIntegrityViolationException.class);
    }

    @Test
    void deletingProductRemovesItsPricesAndModifiers() {
        long productId = insertProduct();
        long regionId = insertRegion();
        jdbc.update("INSERT INTO regional_prices (product_id, region_id, price) VALUES (?, ?, 10.00)",
                productId, regionId);
        jdbc.update("INSERT INTO modifier_groups (product_id, name, type) VALUES (?, 'Size', 'SINGLE')",
                productId);

        jdbc.update("DELETE FROM products WHERE id = ?", productId);

        assertThat(count("regional_prices", productId)).isZero();
        assertThat(count("modifier_groups", productId)).isZero();
    }

    private long insertProduct() {
        jdbc.update("INSERT INTO categories (name, sort_order) VALUES ('Test', 99)");
        Long categoryId = jdbc.queryForObject("SELECT MAX(id) FROM categories", Long.class);
        jdbc.update("INSERT INTO products (category_id, name) VALUES (?, 'Test cake')", categoryId);
        return jdbc.queryForObject("SELECT MAX(id) FROM products", Long.class);
    }

    private long insertRegion() {
        jdbc.update("INSERT INTO regions (code, name, currency_code, currency_symbol, vat_rate) "
                + "VALUES ('TST', 'Test', 'TST', 'T', 0.1000)");
        return jdbc.queryForObject("SELECT id FROM regions WHERE code = 'TST'", Long.class);
    }

    private int count(String table, long productId) {
        return jdbc.queryForObject("SELECT COUNT(*) FROM " + table + " WHERE product_id = ?",
                Integer.class, productId);
    }
}
