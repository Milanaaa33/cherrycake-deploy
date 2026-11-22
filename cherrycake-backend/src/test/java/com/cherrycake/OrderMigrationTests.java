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
class OrderMigrationTests {

    @Autowired
    private JdbcTemplate jdbc;

    @Test
    void createsOrdersAndOrderItemsTables() {
        List<String> tables = jdbc.queryForList(
                "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'",
                String.class);

        assertThat(tables).contains("orders", "order_items");
    }

    @Test
    void enforcesUniqueOrderNumber() {
        long regionId = jdbc.queryForObject("SELECT id FROM regions WHERE code = 'UZB'", Long.class);
        insertOrder("CC-2026-999001", regionId);

        assertThatThrownBy(() -> insertOrder("CC-2026-999001", regionId))
                .isInstanceOf(DataIntegrityViolationException.class);
    }

    @Test
    void rejectsNegativeSubtotalOrZeroQuantity() {
        long regionId = jdbc.queryForObject("SELECT id FROM regions WHERE code = 'UZB'", Long.class);
        assertThatThrownBy(() -> jdbc.update(
                "INSERT INTO orders (order_number, order_date, region_id, customer_name, phone, email, "
                        + "subtotal, vat_amount, total) VALUES ('CC-2026-999002', CURRENT_DATE, ?, 'Ali', '+99890', 'a@b.c', -1, 0, 0)",
                regionId))
                .isInstanceOf(DataIntegrityViolationException.class);

        insertOrder("CC-2026-999003", regionId);
        long orderId = jdbc.queryForObject("SELECT id FROM orders WHERE order_number = 'CC-2026-999003'", Long.class);
        long productId = jdbc.queryForObject("SELECT MIN(id) FROM products", Long.class);

        assertThatThrownBy(() -> jdbc.update(
                "INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price, line_total) "
                        + "VALUES (?, ?, 'Cherry Cake', 0, 100.00, 0.00)",
                orderId, productId))
                .isInstanceOf(DataIntegrityViolationException.class);
    }

    @Test
    void deletingOrderCascadesOrderItems() {
        long regionId = jdbc.queryForObject("SELECT id FROM regions WHERE code = 'UZB'", Long.class);
        insertOrder("CC-2026-999004", regionId);
        long orderId = jdbc.queryForObject("SELECT id FROM orders WHERE order_number = 'CC-2026-999004'", Long.class);
        long productId = jdbc.queryForObject("SELECT MIN(id) FROM products", Long.class);

        jdbc.update(
                "INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price, line_total) "
                        + "VALUES (?, ?, 'Cherry Cake', 1, 360000.00, 360000.00)",
                orderId, productId);

        jdbc.update("DELETE FROM orders WHERE id = ?", orderId);

        Integer itemsCount = jdbc.queryForObject(
                "SELECT COUNT(*) FROM order_items WHERE order_id = ?", Integer.class, orderId);
        assertThat(itemsCount).isZero();
    }

    private void insertOrder(String orderNumber, long regionId) {
        jdbc.update(
                "INSERT INTO orders (order_number, order_date, region_id, customer_name, phone, email, "
                        + "subtotal, vat_rate, vat_amount, amount_incl_vat, discount_rate, discount_amount, "
                        + "delivery_fee, total, currency_code) "
                        + "VALUES (?, CURRENT_DATE, ?, 'Test Customer', '+998901234567', 'test@example.com', "
                        + "360000.00, 0.1500, 54000.00, 414000.00, 0.0300, 12420.00, 0.00, 401580.00, 'UZS')",
                orderNumber, regionId);
    }
}
