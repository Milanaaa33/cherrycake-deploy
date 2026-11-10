package com.cherrycake.order.dto;

import com.cherrycake.pricing.dto.CalculateCartRequest;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.util.List;

/**
 * Guest checkout request matching the platform API v1 contract (CC-10 / CC-24).
 */
public record CreateOrderRequest(
        @Schema(example = "UZB")
        @NotBlank(message = "region is required")
        String region,

        @NotNull(message = "customer is required")
        @Valid
        Customer customer,

        @Schema(example = "2026-12-31")
        @NotNull(message = "orderDate is required")
        @FutureOrPresent(message = "orderDate must not be in the past")
        LocalDate orderDate,

        @NotEmpty(message = "items must not be empty")
        List<CalculateCartRequest.@NotNull @Valid Item> items) {

    @Schema(name = "OrderCustomerRequest")
    public record Customer(
            @Schema(example = "Malika Karimova")
            @NotBlank(message = "customer name is required")
            @Size(max = 150)
            String name,

            @Schema(example = "+998901234567")
            @NotBlank(message = "customer phone is required")
            @Pattern(regexp = "\\+?[1-9][0-9]{6,14}",
                    message = "phone must contain 7 to 15 digits with an optional leading +")
            String phone,

            @Schema(example = "malika@example.com")
            @NotBlank(message = "customer email is required")
            @Email(message = "customer email must be valid")
            @Size(max = 150)
            String email) {
    }
}
