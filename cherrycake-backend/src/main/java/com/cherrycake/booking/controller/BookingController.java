package com.cherrycake.booking.controller;

import com.cherrycake.booking.dto.BookingCreateRequest;
import com.cherrycake.booking.dto.BookingResponse;
import com.cherrycake.booking.service.BookingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping
@Tag(name = "Bookings", description = "Café table reservation and booking management")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @PostMapping({ "/api/bookings", "/api/v1/bookings" })
    @Operation(summary = "Reserve a table in the café with automatic capacity allocation")
    public ResponseEntity<BookingResponse> createBooking(@Valid @RequestBody BookingCreateRequest request) {
        BookingResponse response = bookingService.createBooking(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping({ "/api/bookings/{bookingNumber}", "/api/v1/bookings/{bookingNumber}" })
    @Operation(summary = "Get table booking details by booking number")
    public ResponseEntity<BookingResponse> getBookingByNumber(@PathVariable String bookingNumber) {
        return ResponseEntity.ok(bookingService.getBookingByNumber(bookingNumber));
    }

    @GetMapping({ "/api/bookings/my", "/api/v1/bookings/my" })
    @Operation(summary = "Get reservations by customer email")
    public ResponseEntity<List<BookingResponse>> getMyBookings(@RequestParam(required = false) String email) {
        return ResponseEntity.ok(bookingService.getBookingsByEmail(email));
    }
}
