package com.cherrycake.booking.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.LocalDate;
import org.junit.jupiter.api.Test;
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
class BookingControllerTests {
    @Autowired private MockMvc mvc;
    @Autowired private JdbcTemplate jdbc;

    @Test
    void createsBookingUsingNestedCustomerContract() throws Exception {
        Long slotId = jdbc.queryForObject("SELECT id FROM time_slots ORDER BY start_time LIMIT 1", Long.class);
        String body = """
                {"date":"%s","timeSlotId":%d,"guestsCount":4,
                 "customer":{"name":"Test Customer","phone":"+995555123456","email":"test@example.com"},
                 "region":"GEO"}
                """.formatted(LocalDate.now().plusDays(2), slotId);

        mvc.perform(post("/api/bookings").contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.bookingNumber").isNotEmpty())
                .andExpect(jsonPath("$.tableNumber").isNumber())
                .andExpect(jsonPath("$.date").value(LocalDate.now().plusDays(2).toString()))
                .andExpect(jsonPath("$.guestsCount").value(4));

        org.junit.jupiter.api.Assertions.assertEquals(1,
                jdbc.queryForObject("SELECT COUNT(*) FROM bookings", Integer.class));
    }

    @Test
    void rejectsPastDateAndInvalidGuestCount() throws Exception {
        Long slotId = jdbc.queryForObject("SELECT id FROM time_slots ORDER BY start_time LIMIT 1", Long.class);
        String pastDate = """
                {"date":"%s","timeSlotId":%d,"guestsCount":2,
                 "customer":{"name":"Test","phone":"+995555123456","email":"test@example.com"}}
                """.formatted(LocalDate.now().minusDays(1), slotId);
        mvc.perform(post("/api/bookings").contentType(MediaType.APPLICATION_JSON).content(pastDate))
                .andExpect(status().isBadRequest());

        String invalidGuests = """
                {"date":"%s","timeSlotId":%d,"guestsCount":13,
                 "customer":{"name":"Test","phone":"+995555123456","email":"test@example.com"}}
                """.formatted(LocalDate.now().plusDays(1), slotId);
        mvc.perform(post("/api/bookings").contentType(MediaType.APPLICATION_JSON).content(invalidGuests))
                .andExpect(status().isBadRequest());
    }

    @Test
    void returnsConflictWhenNoTableCanFitTheGuests() throws Exception {
        Long slotId = jdbc.queryForObject("SELECT id FROM time_slots ORDER BY start_time LIMIT 1", Long.class);
        String body = """
                {"date":"%s","timeSlotId":%d,"guestsCount":12,
                 "customer":{"name":"Test Customer","phone":"+995555123456","email":"test@example.com"},
                 "region":"GEO"}
                """.formatted(LocalDate.now().plusDays(3), slotId);

        mvc.perform(post("/api/bookings").contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isCreated());
        mvc.perform(post("/api/bookings").contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isCreated());
        mvc.perform(post("/api/bookings").contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.status").value(409));
    }
}
