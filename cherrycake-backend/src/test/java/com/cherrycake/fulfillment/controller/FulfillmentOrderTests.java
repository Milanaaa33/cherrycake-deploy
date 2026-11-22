package com.cherrycake.fulfillment.controller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.transaction.annotation.Transactional;

/**
 * CC-38: pickup or delivery, time slot capacity and the delivery fee of POST /api/orders.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class FulfillmentOrderTests {

    private static final String EMAIL = "fulfillment-test@example.com";

    @Autowired
    private MockMvc mvc;

    @Autowired
    private JdbcTemplate jdbc;

    private final LocalDate date = LocalDate.now().plusDays(3);

    @Test
    void deliveryAddsZoneFeeAfterDiscountAndIsSaved() throws Exception {
        long zone = zone("UZB", "Center");
        long slot = slot("12:00");

        order("UZB", "\"fulfillmentType\":\"DELIVERY\",\"deliveryZoneId\":" + zone + ",\"timeSlotId\":" + slot)
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.amountInclVat").value(103500.00))
                .andExpect(jsonPath("$.discountRate").value(0.0))
                .andExpect(jsonPath("$.deliveryFee").value(15000.00))
                .andExpect(jsonPath("$.total").value(118500.00))
                .andExpect(jsonPath("$.fulfillmentType").value("DELIVERY"))
                .andExpect(jsonPath("$.deliveryZoneId").value(zone))
                .andExpect(jsonPath("$.pickupPointId").doesNotExist())
                .andExpect(jsonPath("$.timeSlotId").value(slot));

        Map<String, Object> saved = jdbc.queryForMap(
                "SELECT fulfillment_type, delivery_zone_id, pickup_point_id, time_slot_id, delivery_fee, total "
                        + "FROM orders WHERE email = ?", EMAIL);
        assertThat(saved.get("fulfillment_type")).isEqualTo("DELIVERY");
        assertThat(((Number) saved.get("delivery_zone_id")).longValue()).isEqualTo(zone);
        assertThat(saved.get("pickup_point_id")).isNull();
        assertThat(((Number) saved.get("time_slot_id")).longValue()).isEqualTo(slot);
        assertThat((BigDecimal) saved.get("delivery_fee")).isEqualByComparingTo("15000.00");
        assertThat((BigDecimal) saved.get("total")).isEqualByComparingTo("118500.00");
    }

    @Test
    void suburbsFeeIsExactInUzsAndConvertedElsewhere() throws Exception {
        order("UZB", delivery(zone("UZB", "Suburbs")))
                .andExpect(jsonPath("$.deliveryFee").value(25000.00))
                .andExpect(jsonPath("$.total").value(128500.00));

        order("GEO", delivery(zone("GEO", "Suburbs")))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.deliveryFee").value(5.42))
                .andExpect(jsonPath("$.currencyCode").value("GEL"));
    }

    @Test
    void pickupIsFreeAndRemembersThePoint() throws Exception {
        long point = point("Cherry Cake Chilonzor");

        order("UZB", "\"fulfillmentType\":\"PICKUP\",\"pickupPointId\":" + point + ",\"timeSlotId\":" + slot("10:00"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.deliveryFee").value(0.00))
                .andExpect(jsonPath("$.total").value(103500.00))
                .andExpect(jsonPath("$.fulfillmentType").value("PICKUP"))
                .andExpect(jsonPath("$.pickupPointId").value(point));
    }

    @Test
    void orderWithoutFulfillmentStillWorks() throws Exception {
        order("UZB", null)
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.deliveryFee").value(0.00))
                .andExpect(jsonPath("$.fulfillmentType").doesNotExist());
    }

    @Test
    void fullSlotReturns409AndSavesNothing() throws Exception {
        long slot = slot("14:00");
        jdbc.update("UPDATE time_slots SET capacity = 1 WHERE id = ?", slot);
        String pickup = "\"fulfillmentType\":\"PICKUP\",\"pickupPointId\":" + point("Cherry Cake Tashkent City")
                + ",\"timeSlotId\":" + slot;

        order("UZB", pickup).andExpect(status().isCreated());
        order("UZB", pickup)
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value("Time slot 14:00-16:00 on " + date + " is full"));

        assertThat(ordersSaved()).isEqualTo(1);
        mvc.perform(get("/api/time-slots").param("date", date.toString()))
                .andExpect(jsonPath("$[2].remaining").value(0))
                .andExpect(jsonPath("$[2].isAvailable").value(false));
        mvc.perform(get("/api/time-slots").param("date", date.plusDays(1).toString()))
                .andExpect(jsonPath("$[2].isAvailable").value(true));
    }

    @Test
    void closedSlotReturns409() throws Exception {
        long slot = slot("18:00");
        jdbc.update("UPDATE time_slots SET is_available = FALSE WHERE id = ?", slot);

        order("UZB", "\"fulfillmentType\":\"DELIVERY\",\"deliveryZoneId\":" + zone("UZB", "Center")
                + ",\"timeSlotId\":" + slot)
                .andExpect(status().isConflict());
        assertThat(ordersSaved()).isZero();
    }

    @Test
    void rejectsIncompleteOrMixedFulfillment() throws Exception {
        long zone = zone("UZB", "Center");
        long point = point("Cherry Cake Tashkent City");
        long slot = slot("10:00");

        expect400("\"fulfillmentType\":\"DELIVERY\",\"timeSlotId\":" + slot, "deliveryZoneId is required for DELIVERY");
        expect400("\"fulfillmentType\":\"PICKUP\",\"timeSlotId\":" + slot, "pickupPointId is required for PICKUP");
        expect400("\"fulfillmentType\":\"DELIVERY\",\"deliveryZoneId\":" + zone, "timeSlotId is required for DELIVERY");
        expect400("\"fulfillmentType\":\"PICKUP\",\"pickupPointId\":" + point + ",\"deliveryZoneId\":" + zone
                + ",\"timeSlotId\":" + slot, "deliveryZoneId is only allowed for DELIVERY");
        expect400("\"timeSlotId\":" + slot, "fulfillmentType is required");
        order("UZB", "\"fulfillmentType\":\"COURIER\"").andExpect(status().isBadRequest());
        assertThat(ordersSaved()).isZero();
    }

    @Test
    void zoneOrPointOfAnotherRegionIsNotFound() throws Exception {
        order("UZB", delivery(zone("KAZ", "Center")))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message", containsString("not found in UZB")));
        order("UZB", "\"fulfillmentType\":\"PICKUP\",\"pickupPointId\":" + point("Cherry Cake Esil")
                + ",\"timeSlotId\":" + slot("10:00"))
                .andExpect(status().isNotFound());
        order("UZB", "\"fulfillmentType\":\"PICKUP\",\"pickupPointId\":" + point("Cherry Cake Esil")
                + ",\"timeSlotId\":999999")
                .andExpect(status().isNotFound());
        assertThat(ordersSaved()).isZero();
    }

    private void expect400(String fulfillment, String message) throws Exception {
        order("UZB", fulfillment)
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString(message)));
    }

    private String delivery(long zone) {
        return "\"fulfillmentType\":\"DELIVERY\",\"deliveryZoneId\":" + zone + ",\"timeSlotId\":" + slot("16:00");
    }

    private ResultActions order(String region, String fulfillment) throws Exception {
        long tiramisu = jdbc.queryForObject("SELECT id FROM products WHERE name = 'Tiramisu'", Long.class);
        String body = """
                {"region":"%s","customer":{"name":"Slot Tester","phone":"+998901112233","email":"%s"},
                "orderDate":"%s","items":[{"productId":%d,"quantity":1}]%s}
                """.formatted(region, EMAIL, date, tiramisu, fulfillment == null ? "" : "," + fulfillment);
        return mvc.perform(post("/api/orders").contentType(MediaType.APPLICATION_JSON).content(body));
    }

    private int ordersSaved() {
        return jdbc.queryForObject("SELECT COUNT(*) FROM orders WHERE email = ?", Integer.class, EMAIL);
    }

    private long zone(String region, String name) {
        return jdbc.queryForObject("SELECT z.id FROM delivery_zones z JOIN regions r ON r.id = z.region_id "
                + "WHERE r.code = ? AND z.name = ?", Long.class, region, name);
    }

    private long point(String name) {
        return jdbc.queryForObject("SELECT id FROM pickup_points WHERE name = ?", Long.class, name);
    }

    private long slot(String start) {
        return jdbc.queryForObject("SELECT id FROM time_slots WHERE start_time = CAST(? AS TIME)", Long.class, start);
    }
}
