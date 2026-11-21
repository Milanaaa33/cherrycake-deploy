package com.cherrycake.booking.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

/** Request body follows the public booking API contract (camelCase JSON). */
public record CreateBookingRequest(
        @NotNull LocalDate date,
        @NotNull Long timeSlotId,
        @Min(1) @Max(12) int guestsCount,
        @NotNull @Valid Customer customer,
        // Optional extension used by the website's country switcher. Omit it for the base API contract.
        @Pattern(regexp = "^[A-Z]{3}$") String region
) {
    public record Customer(
            @NotBlank @Size(max = 150) String name,
            @NotBlank @Pattern(regexp = "^\\+?[0-9\\s()\\-]{7,20}$") String phone,
            @NotBlank @Email @Size(max = 150) String email
    ) {}
}
