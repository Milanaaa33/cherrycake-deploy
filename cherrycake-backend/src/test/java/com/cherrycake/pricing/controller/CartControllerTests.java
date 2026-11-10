package com.cherrycake.pricing.controller;

import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class CartControllerTests {

    @Autowired
    private MockMvc mvc;

    @Autowired
    private JdbcTemplate jdbc;

    @Test
    void calculatesLineWithModifiersInRegionCurrency() throws Exception {
        calculate("GEO", item(product("Cherry Cake"), 2,
                modifier("Cherry Cake", "Medium, 10 slices"), modifier("Cherry Cake", "Fresh cherries")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items[0].unitPrice").value(85.80))
                .andExpect(jsonPath("$.items[0].modifiersPrice").value(31.20))
                .andExpect(jsonPath("$.items[0].quantity").value(2))
                .andExpect(jsonPath("$.items[0].lineTotal").value(234.00))
                .andExpect(jsonPath("$.subtotal").value(234.00))
                .andExpect(jsonPath("$.vatRate").value(0.12))
                .andExpect(jsonPath("$.vatAmount").value(28.08))
                .andExpect(jsonPath("$.amountInclVat").value(262.08))
                .andExpect(jsonPath("$.discountRate").value(0.03))
                .andExpect(jsonPath("$.discountAmount").value(7.86))
                .andExpect(jsonPath("$.deliveryFee").value(0.00))
                .andExpect(jsonPath("$.total").value(254.22))
                .andExpect(jsonPath("$.currencyCode").value("GEL"));
    }

    @Test
    void discountThresholdIsScaledByExchangeRate() throws Exception {
        calculate("UZB", item(product("Tiramisu"), 1))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.amountInclVat").value(103500.00))
                .andExpect(jsonPath("$.discountRate").value(0.0))
                .andExpect(jsonPath("$.total").value(103500.00));

        calculate("UZB", item(product("Cherry Cake"), 1, modifier("Cherry Cake", "Small, 6 slices")))
                .andExpect(jsonPath("$.amountInclVat").value(414000.00))
                .andExpect(jsonPath("$.discountRate").value(0.03))
                .andExpect(jsonPath("$.discountAmount").value(12420.00))
                .andExpect(jsonPath("$.total").value(401580.00));
    }

    @Test
    void sumsSeveralLines() throws Exception {
        calculate("UKR", item(product("Tiramisu"), 2) + "," + item(product("Chocolate Eclair"), 1))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items.length()").value(2))
                .andExpect(jsonPath("$.items[0].lineTotal").value(570.00))
                .andExpect(jsonPath("$.items[1].lineTotal").value(115.00))
                .andExpect(jsonPath("$.subtotal").value(685.00));
    }

    @Test
    void moneyAndRatesKeepTheirScaleInJson() throws Exception {
        calculate("UZB", item(product("Tiramisu"), 1))
                .andExpect(content().string(containsString("\"subtotal\":90000.00")))
                .andExpect(content().string(containsString("\"vatRate\":0.1500")))
                .andExpect(content().string(containsString("\"discountRate\":0.0000")))
                .andExpect(content().string(containsString("\"deliveryFee\":0.00")));
    }

    @Test
    void zeroQuantityIsRejected() throws Exception {
        calculate("UZB", item(product("Tiramisu"), 0))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors[0].field").value("items[0].quantity"));
    }

    @Test
    void negativeQuantityIsRejected() throws Exception {
        calculate("UZB", item(product("Tiramisu"), -1)).andExpect(status().isBadRequest());
    }

    @Test
    void missingRegionIsRejected() throws Exception {
        send("{\"items\": [" + item(product("Tiramisu"), 1) + "]}")
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors[0].field").value("region"));
    }

    @Test
    void unknownRegionIsNotFound() throws Exception {
        calculate("XYZ", item(product("Tiramisu"), 1))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Region XYZ not found"));
    }

    @Test
    void outOfStockProductIsConflict() throws Exception {
        calculate("GEO", item(product("Napoleon Cake"), 1, modifier("Napoleon Cake", "Small, 6 slices")))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message", containsString("out of stock")));
    }

    @Test
    void emptyCartIsRejected() throws Exception {
        calculate("UZB", "")
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors[0].message").value("cart is empty"));
    }

    @Test
    void unknownProductIsNotFound() throws Exception {
        calculate("UZB", item(999999L, 1)).andExpect(status().isNotFound());
    }

    @Test
    void modifierOfAnotherProductIsRejected() throws Exception {
        calculate("UZB", item(product("Honey Cake"), 1,
                modifier("Honey Cake", "Small, 6 slices"), modifier("Cherry Cake", "Fresh cherries")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("is not available")));
    }

    @Test
    void twoChoicesInSingleGroupAreRejected() throws Exception {
        calculate("UZB", item(product("Honey Cake"), 1,
                modifier("Honey Cake", "Small, 6 slices"), modifier("Honey Cake", "Large, 14 slices")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("allows one choice")));
    }

    @Test
    void missingRequiredGroupIsRejected() throws Exception {
        calculate("UZB", item(product("Honey Cake"), 1))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("is required")));
    }

    @Test
    void duplicateModifierIsRejected() throws Exception {
        long small = modifier("Honey Cake", "Small, 6 slices");

        calculate("UZB", item(product("Honey Cake"), 1, small, small))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("duplicate")));
    }

    private ResultActions calculate(String region, String items) throws Exception {
        return send("{\"region\": \"" + region + "\", \"items\": [" + items + "]}");
    }

    private ResultActions send(String body) throws Exception {
        return mvc.perform(post("/api/cart/calculate")
                .contentType(MediaType.APPLICATION_JSON)
                .content(body));
    }

    private static String item(long productId, int quantity, long... modifierIds) {
        StringBuilder ids = new StringBuilder();
        for (long id : modifierIds) {
            ids.append(ids.isEmpty() ? "" : ",").append(id);
        }
        return "{\"productId\": " + productId + ", \"quantity\": " + quantity + ", \"modifierIds\": [" + ids + "]}";
    }

    private long product(String name) {
        return jdbc.queryForObject("SELECT id FROM products WHERE name = ?", Long.class, name);
    }

    private long modifier(String product, String name) {
        return jdbc.queryForObject("""
                SELECT m.id FROM modifiers m
                JOIN modifier_groups g ON g.id = m.group_id
                JOIN products p ON p.id = g.product_id
                WHERE p.name = ? AND m.name = ?
                """, Long.class, product, name);
    }
}
