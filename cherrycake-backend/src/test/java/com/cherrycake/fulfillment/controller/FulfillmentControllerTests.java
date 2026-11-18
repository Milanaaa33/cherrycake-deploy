package com.cherrycake.fulfillment.controller;

import static org.hamcrest.Matchers.contains;
import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.LocalDate;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class FulfillmentControllerTests {

    @Autowired
    private MockMvc mvc;

    @Autowired
    private JdbcTemplate jdbc;

    @Test
    void pickupPointsBelongToTheRegion() throws Exception {
        mvc.perform(get("/api/pickup-points").param("region", "UZB"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[*].name", contains("Cherry Cake Tashkent City", "Cherry Cake Chilonzor")))
                .andExpect(jsonPath("$[0].address").value("Tashkent, Amir Temur Avenue 15"))
                .andExpect(jsonPath("$[0].openingHours").value("09:00-21:00"));
    }

    @Test
    void closedPickupPointIsHidden() throws Exception {
        jdbc.update("UPDATE pickup_points SET is_available = FALSE WHERE name = 'Cherry Cake Chilonzor'");

        mvc.perform(get("/api/pickup-points").param("region", "UZB"))
                .andExpect(jsonPath("$[*].name", contains("Cherry Cake Tashkent City")));
    }

    @ParameterizedTest
    @CsvSource({
        "UZB, 15000.00, 25000.00, UZS",
        "KAZ, 600.00, 1000.00, KZT",
        "GEO, 3.25, 5.42, GEL",
        "UKR, 50.00, 83.33, UAH",
        "CHN, 8.75, 14.58, CNY",
    })
    void deliveryFeeIsConvertedToRegionCurrency(String region, double center, double suburbs, String currency)
            throws Exception {
        mvc.perform(get("/api/delivery-zones").param("region", region))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[*].name", contains("Center", "Suburbs")))
                .andExpect(jsonPath("$[0].deliveryFee").value(center))
                .andExpect(jsonPath("$[1].deliveryFee").value(suburbs))
                .andExpect(jsonPath("$[0].currencyCode").value(currency));
    }

    @Test
    void regionIsRequiredAndMustExist() throws Exception {
        mvc.perform(get("/api/pickup-points")).andExpect(status().isBadRequest());
        mvc.perform(get("/api/delivery-zones")).andExpect(status().isBadRequest());
        mvc.perform(get("/api/delivery-zones").param("region", "XYZ"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Region XYZ not found"));
    }

    @Test
    void timeSlotsOfAFreeDayAreAllOpen() throws Exception {
        mvc.perform(get("/api/time-slots").param("date", LocalDate.now().plusDays(60).toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(5)))
                .andExpect(jsonPath("$[0].startTime").value("10:00"))
                .andExpect(jsonPath("$[0].endTime").value("12:00"))
                .andExpect(jsonPath("$[0].capacity").value(5))
                .andExpect(jsonPath("$[0].remaining").value(5))
                .andExpect(jsonPath("$[0].isAvailable").value(true));
    }

    @Test
    void closedSlotIsListedAsUnavailable() throws Exception {
        jdbc.update("UPDATE time_slots SET is_available = FALSE WHERE start_time = '18:00'");

        mvc.perform(get("/api/time-slots").param("date", LocalDate.now().toString()))
                .andExpect(jsonPath("$[4].startTime").value("18:00"))
                .andExpect(jsonPath("$[4].isAvailable").value(false));
    }

    @Test
    void timeSlotsRejectMissingMalformedOrPastDate() throws Exception {
        mvc.perform(get("/api/time-slots")).andExpect(status().isBadRequest());
        mvc.perform(get("/api/time-slots").param("date", "31.12.2026")).andExpect(status().isBadRequest());
        mvc.perform(get("/api/time-slots").param("date", LocalDate.now().minusDays(1).toString()))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("date must not be in the past"));
    }
}
