package com.cherrycake.order.controller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.startsWith;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.cherrycake.order.repository.OrderRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.LocalDate;
import org.junit.jupiter.api.Test;
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

        assertThat(orderRepository.findByOrderNumber(orderNumber)).isPresent();

        mvc.perform(get("/api/orders/{orderNumber}", orderNumber))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.orderNumber").value(orderNumber))
                .andExpect(jsonPath("$.total").value(254.22));
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
    void returns404ForUnknownOrderNumber() throws Exception {
        mvc.perform(get("/api/orders/CC-2026-999999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404));
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

