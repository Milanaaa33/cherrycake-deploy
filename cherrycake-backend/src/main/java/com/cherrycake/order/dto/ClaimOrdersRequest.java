package com.cherrycake.order.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * Contact details used when placing the earlier orders; both must match to add them to this browser's history.
 */
public record ClaimOrdersRequest(
        @Schema(example = "malika@example.com")
        @NotBlank(message = "email is required")
        @Email(message = "email must be valid")
        @Size(max = 150)
        String email,

        @Schema(example = "+998901234567",
                description = "Spaces, hyphens and parentheses are removed before validation")
        @NotBlank(message = "phone is required")
        @Pattern(regexp = "\\+?[1-9][0-9]{6,14}",
                message = "phone must contain 7 to 15 digits with an optional leading +")
        String phone) {

    public ClaimOrdersRequest {
        if (phone != null) {
            phone = phone.replaceAll("[\\s()-]", "");
        }
    }
}
