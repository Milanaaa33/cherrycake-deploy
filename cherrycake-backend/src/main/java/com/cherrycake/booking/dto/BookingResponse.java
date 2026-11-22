package com.cherrycake.booking.dto;

import java.time.LocalDate;

public record BookingResponse(
        String bookingNumber,
        int tableNumber,
        LocalDate date,
        String time,
        int guestsCount
) {}
