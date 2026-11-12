package com.cherrycake.order.controller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.startsWith;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.cherrycake.order.repository.OrderRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import java.time.LocalDate;
import java.time.Year;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.NullAndEmptySource;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class OrderControllerTests {

    @Autowired
    private MockMvc mvc;

    @Autowired
    private JdbcTemplate jdbc;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void createsGuestOrderWithServerCalculatedTotalsAndPersistsSnapshot() throws Exception {
        long cakeId = product("Cherry Cake");
        long mod1 = modifier("Cherry Cake", "Medium, 10 slices");
        long mod2 = modifier("Cherry Cake", "Fresh cherries");
        String tomorrow = LocalDate.now().plusDays(1).toString();

        String body = """
                {
                  "region": "GEO",
                  "customer": {
                    "name": "Nino Beridze",
                    "phone": "+995599112233",
                    "email": "nino@example.com"
                  },
                  "orderDate": "%s",
                  "items": [
                    { "productId": %d, "quantity": 2, "modifierIds": [%d, %d] }
                  ]
                }
                """.formatted(tomorrow, cakeId, mod1, mod2);

        MvcResult result = mvc.perform(post("/api/orders")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.orderNumber").value(startsWith("CC-")))
                .andExpect(jsonPath("$.region").value("GEO"))
                .andExpect(jsonPath("$.items[0].productName").value("Cherry Cake"))
                .andExpect(jsonPath("$.subtotal").value(234.00))
                .andExpect(jsonPath("$.vatAmount").value(28.08))
                .andExpect(jsonPath("$.discountAmount").value(7.86))
                .andExpect(jsonPath("$.deliveryFee").value(0.00))
                .andExpect(jsonPath("$.total").value(254.22))
                .andExpect(jsonPath("$.currencyCode").value("GEL"))
                .andReturn();

        JsonNode json = objectMapper.readTree(result.getResponse().getContentAsString());
        String orderNumber = json.get("orderNumber").asText();

        assertThat(orderNumber).matches("CC-" + Year.now() + "-[0-9]{6,}");
        var saved = orderRepository.findByOrderNumber(orderNumber).orElseThrow();
        assertThat(saved.getSubtotal()).isEqualByComparingTo("234.00");
        assertThat(saved.getVatRate()).isEqualByComparingTo("0.12");
        assertThat(saved.getVatAmount()).isEqualByComparingTo("28.08");
        assertThat(saved.getAmountInclVat()).isEqualByComparingTo("262.08");
        assertThat(saved.getDiscountRate()).isEqualByComparingTo("0.03");
        assertThat(saved.getDiscountAmount()).isEqualByComparingTo("7.86");
        assertThat(saved.getDeliveryFee()).isEqualByComparingTo("0.00");
        assertThat(saved.getTotal()).isEqualByComparingTo("254.22");
        assertThat(saved.getCreatedAt()).isNotNull();
        assertThat(saved.getItems()).hasSize(1);
        var line = saved.getItems().get(0);
        assertThat(line.getProductName()).isEqualTo("Cherry Cake");
        assertThat(line.getUnitPrice()).isEqualByComparingTo("85.80");
        assertThat(line.getModifiersPrice()).isEqualByComparingTo("31.20");
        assertThat(objectMapper.readValue(line.getModifiersJson(), Long[].class))
                .containsExactly(mod1, mod2);
        assertThat(line.getLineTotal()).isEqualByComparingTo("234.00");

        jdbc.update("UPDATE products SET name = 'Changed product' WHERE id = ?", cakeId);
        jdbc.update("UPDATE regional_prices SET price = 1 WHERE product_id = ?", cakeId);
        assertThat(jdbc.queryForObject("SELECT product_name FROM order_items WHERE id = ?",
                String.class, line.getId())).isEqualTo("Cherry Cake");
        assertThat(jdbc.queryForObject("SELECT total FROM orders WHERE id = ?",
                java.math.BigDecimal.class, saved.getId())).isEqualByComparingTo("254.22");
    }

    @Test
    void rejectsPastOrderDateAndInvalidCustomerEmail() throws Exception {
        long tiramisuId = product("Tiramisu");
        String yesterday = LocalDate.now().minusDays(1).toString();

        String body = """
                {
                  "region": "UZB",
                  "customer": {
                    "name": "Malika",
                    "phone": "+998901234567",
                    "email": "not-an-email"
                  },
                  "orderDate": "%s",
                  "items": [
                    { "productId": %d, "quantity": 1 }
                  ]
                }
                """.formatted(yesterday, tiramisuId);

        mvc.perform(post("/api/orders")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400));
    }

    @Test
    void returns409WhenProductIsOutOfStockInRegion() throws Exception {
        long napoleonId = product("Napoleon Cake");
        long mod = modifier("Napoleon Cake", "Small, 6 slices");
        String tomorrow = LocalDate.now().plusDays(1).toString();

        String body = """
                {
                  "region": "GEO",
                  "customer": {
                    "name": "Giorgi",
                    "phone": "+995591223344",
                    "email": "giorgi@example.ge"
                  },
                  "orderDate": "%s",
                  "items": [
                    { "productId": %d, "quantity": 1, "modifierIds": [%d] }
                  ]
                }
                """.formatted(tomorrow, napoleonId, mod);

        mvc.perform(post("/api/orders")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.status").value(409));
    }

    @Test
    void ignoresFrontendAmountsAndMatchesCartCalculationForToday() throws Exception {
        ObjectNode body = validOrder();
        body.put("total", 0).put("subtotal", 0).put("vatAmount", 0)
                .put("discountAmount", 999999).put("deliveryFee", -1);
        ((ObjectNode) body.at("/items/0")).put("unitPrice", 0).put("lineTotal", 0);
        ObjectNode cartRequest = objectMapper.createObjectNode();
        cartRequest.set("region", body.get("region"));
        cartRequest.set("items", body.get("items"));
        JsonNode cart = objectMapper.readTree(mvc.perform(post("/api/cart/calculate")
                        .contentType(MediaType.APPLICATION_JSON).content(cartRequest.toString()))
                .andExpect(status().isOk()).andReturn().getResponse().getContentAsString());
        JsonNode order = objectMapper.readTree(mvc.perform(post("/api/orders")
                        .contentType(MediaType.APPLICATION_JSON).content(body.toString()))
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString());
        for (String field : List.of("subtotal", "vatRate", "vatAmount", "amountInclVat", "discountRate",
                "discountAmount", "deliveryFee", "total", "currencyCode")) {
            assertThat(order.get(field)).as(field).isEqualTo(cart.get(field));
        }
        assertThat(order.path("total").decimalValue()).isPositive();
    }

    @ParameterizedTest
    @ValueSource(strings = {"region", "customer", "orderDate", "items"})
    void rejectsMissingRequiredFieldsWithoutSaving(String field) throws Exception {
        ObjectNode body = validOrder();
        body.remove(field);
        assertRejectedWithoutSaving(body, 400);
    }

    @ParameterizedTest
    @ValueSource(strings = {"name", "phone", "email"})
    void rejectsBlankContactsWithoutSaving(String field) throws Exception {
        ObjectNode body = validOrder();
        ((ObjectNode) body.get("customer")).put(field, " ");
        assertRejectedWithoutSaving(body, 400);
    }

    @ParameterizedTest
    @ValueSource(strings = {"+998901234567", "+998 90 123 45 67", "+998-90-123-45-67",
            "+998 (90) 123-45-67", "\t +998 (90) 123-45-67 \n"})
    void normalizesFormattedPhoneBeforeValidationAndPersistence(String phone) throws Exception {
        ObjectNode body = validOrder();
        ((ObjectNode) body.get("customer")).put("phone", phone);
        MvcResult result = mvc.perform(post("/api/orders")
                        .contentType(MediaType.APPLICATION_JSON).content(body.toString()))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.customer.phone").value("+998901234567"))
                .andReturn();
        String orderNumber = objectMapper.readTree(result.getResponse().getContentAsString())
                .path("orderNumber").asText();
        assertThat(jdbc.queryForObject("SELECT phone FROM orders WHERE order_number = ?",
                String.class, orderNumber)).isEqualTo("+998901234567");
    }

    @ParameterizedTest
    @NullAndEmptySource
    @ValueSource(strings = {" ()- \t", "+998 (90) abc-45-67", "+998 (90) 1", "+1234567890123456"})
    void rejectsInvalidPhonesAfterNormalizationWithoutSaving(String phone) throws Exception {
        ObjectNode body = validOrder();
        ((ObjectNode) body.get("customer")).put("phone", phone);
        assertRejectedWithoutSaving(body, 400);
    }

    @Test
    void rejectsMalformedPhoneAndOversizedContacts() throws Exception {
        ObjectNode body = validOrder();
        ((ObjectNode) body.get("customer")).put("phone", "call-me");
        assertRejectedWithoutSaving(body, 400);
        body = validOrder();
        ((ObjectNode) body.get("customer")).put("name", "a".repeat(151));
        assertRejectedWithoutSaving(body, 400);
    }

    @ParameterizedTest
    @ValueSource(strings = {"[]", "[null]", "[{\"productId\":1,\"quantity\":0}]",
            "[{\"productId\":1,\"quantity\":1.5}]",
            "[{\"productId\":1,\"quantity\":-1}]", "[{\"productId\":1}]",
            "[{\"quantity\":1}]", "[{\"productId\":1,\"quantity\":1,\"modifierIds\":[null]}]"})
    void rejectsInvalidItemsWithoutSaving(String items) throws Exception {
        ObjectNode body = validOrder();
        body.set("items", objectMapper.readTree(items));
        assertRejectedWithoutSaving(body, 400);
    }

    @Test
    void rejectsUnknownRegionAndProductWithoutSaving() throws Exception {
        ObjectNode body = validOrder();
        body.put("region", "XYZ");
        assertRejectedWithoutSaving(body, 404);
        body = validOrder();
        ((ObjectNode) body.at("/items/0")).put("productId", Long.MAX_VALUE);
        assertRejectedWithoutSaving(body, 404);
    }

    @Test
    void rejectsInvalidModifiersAndDoesNotPersistAnyLines() throws Exception {
        ObjectNode body = validOrder();
        ObjectNode second = (ObjectNode) objectMapper.readTree("""
                {"productId":%d,"quantity":1,"modifierIds":[%d]}
                """.formatted(product("Tiramisu"), modifier("Cherry Cake", "Fresh cherries")));
        ((com.fasterxml.jackson.databind.node.ArrayNode) body.get("items")).add(second);
        assertRejectedWithoutSaving(body, 400);
        body = validOrder();
        ((ObjectNode) body.at("/items/0")).put("productId", product("Cherry Cake"));
        assertRejectedWithoutSaving(body, 400);
    }

    private ObjectNode validOrder() throws Exception {
        return (ObjectNode) objectMapper.readTree("""
                {"region":"UZB","customer":{"name":"Anvar","phone":"+998901234567",
                "email":"anvar@example.com"},"orderDate":"%s",
                "items":[{"productId":%d,"quantity":1}]}
                """.formatted(LocalDate.now(), product("Tiramisu")));
    }

    private void assertRejectedWithoutSaving(ObjectNode body, int statusCode) throws Exception {
        long orders = orderRepository.count();
        Long items = jdbc.queryForObject("SELECT COUNT(*) FROM order_items", Long.class);
        mvc.perform(post("/api/orders").contentType(MediaType.APPLICATION_JSON).content(body.toString()))
                .andExpect(status().is(statusCode))
                .andExpect(jsonPath("$.status").value(statusCode))
                .andExpect(jsonPath("$.message").isNotEmpty())
                .andExpect(jsonPath("$.errors").isArray())
                .andExpect(jsonPath("$.timestamp").isNotEmpty())
                .andExpect(jsonPath("$.path").value("/api/orders"));
        assertThat(orderRepository.count()).isEqualTo(orders);
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM order_items", Long.class)).isEqualTo(items);
    }

    private long product(String name) {
        return jdbc.queryForObject("SELECT id FROM products WHERE name = ?", Long.class, name);
    }

    private long modifier(String productName, String modifierName) {
        return jdbc.queryForObject(
                "SELECT m.id FROM modifiers m "
                        + "JOIN modifier_groups mg ON mg.id = m.group_id "
                        + "JOIN products p ON p.id = mg.product_id "
                        + "WHERE p.name = ? AND m.name = ?",
                Long.class, productName, modifierName);
    }
}
