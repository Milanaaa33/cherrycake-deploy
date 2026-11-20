package com.cherrycake.booking.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.LocalDate;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class BookingControllerTests {

    @Autowired
    private MockMvc mvc;

    @Test
    void createBookingWithFlatFieldsSucceeds() throws Exception {
        String futureDate = LocalDate.now().plusDays(2).toString();
        String json = """
            {
              "customerName": "Eleanor Vance",
              "customerPhone": "+998901234567",
              "guestsCount": 4,
              "date": "%s",
              "time": "18:00:00",
              "notes": "Window seat"
            }
            """.formatted(futureDate);

        mvc.perform(post("/api/bookings")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.bookingNumber").exists())
            .andExpect(jsonPath("$.tableNumber").value(4))
            .andExpect(jsonPath("$.guests").value(4))
            .andExpect(jsonPath("$.customerName").value("Eleanor Vance"));
    }

    @Test
    void createBookingWithNestedCustomerAndSlotSucceeds() throws Exception {
        String futureDate = LocalDate.now().plusDays(3).toString();
        String json = """
            {
              "date": "%s",
              "timeSlotId": 1,
              "guestsCount": 2,
              "customer": {
                "name": "Arjumand",
                "phone": "+998909876543",
                "email": "arjumand@example.com"
              }
            }
            """.formatted(futureDate);

        mvc.perform(post("/api/bookings")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.bookingNumber").exists())
            .andExpect(jsonPath("$.tableNumber").isNumber())
            .andExpect(jsonPath("$.guestsCount").value(2))
            .andExpect(jsonPath("$.customerName").value("Arjumand"));
    }

    @Test
    void pastDateReturnsBadRequest() throws Exception {
        String pastDate = LocalDate.now().minusDays(1).toString();
        String json = """
            {
              "customerName": "Past Guest",
              "customerPhone": "+998901234567",
              "guestsCount": 2,
              "date": "%s",
              "time": "12:00:00"
            }
            """.formatted(pastDate);

        mvc.perform(post("/api/bookings")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
            .andExpect(status().isBadRequest());
    }

    @Test
    void invalidGuestsCountReturnsBadRequest() throws Exception {
        String futureDate = LocalDate.now().plusDays(1).toString();
        String json = """
            {
              "customerName": "Big Group",
              "customerPhone": "+998901234567",
              "guestsCount": 25,
              "date": "%s",
              "time": "14:00:00"
            }
            """.formatted(futureDate);

        mvc.perform(post("/api/bookings")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
            .andExpect(status().isBadRequest());
    }
}
