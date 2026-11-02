package uz.itpu.cherrycake.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import uz.itpu.cherrycake.common.exception.BadRequestException;
import uz.itpu.cherrycake.common.response.ApiResponse;
import uz.itpu.cherrycake.dto.request.BookingCreateRequest;
import uz.itpu.cherrycake.dto.response.BookingResponse;
import uz.itpu.cherrycake.model.entity.User;
import uz.itpu.cherrycake.service.AuthService;
import uz.itpu.cherrycake.service.BookingService;

import java.util.List;

@RestController
@RequestMapping("/api/v1/bookings")
@RequiredArgsConstructor
@Tag(name = "Table Bookings", description = "Table reservation management with conflict prevention")
public class BookingController
{
    private final BookingService bookingService;
    private final AuthService authService;

    @PostMapping
    @Operation(summary = "Book a café table (checks for time conflicts and issues a booking number)")
    public ResponseEntity<ApiResponse<BookingResponse>> createBooking(@Valid @RequestBody BookingCreateRequest request)
    {
        User currentUser = authService.getCurrentAuthenticatedUser();
        BookingResponse response = bookingService.createBooking(request, currentUser);
        return new ResponseEntity<>(ApiResponse.ok("Table booking confirmed", response), HttpStatus.CREATED);
    }

    @GetMapping("/{bookingNumber}")
    @Operation(summary = "Get booking details by unique booking number")
    public ResponseEntity<ApiResponse<BookingResponse>> getBooking(@PathVariable String bookingNumber)
    { return ResponseEntity.ok(ApiResponse.ok(bookingService.getBookingByNumber(bookingNumber))); }

    @GetMapping("/my")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get current authenticated user's bookings")
    public ResponseEntity<ApiResponse<List<BookingResponse>>> getMyBookings()
    {
        User currentUser = authService.getCurrentAuthenticatedUser();

        if (currentUser == null)
            throw new BadRequestException("User not authenticated");

        return ResponseEntity.ok(ApiResponse.ok(bookingService.getUserBookings(currentUser.getId())));
    }
}