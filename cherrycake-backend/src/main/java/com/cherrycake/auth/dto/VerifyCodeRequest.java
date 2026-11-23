package com.cherrycake.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record VerifyCodeRequest(
        @Schema(example = "malika@example.com")
        @NotBlank(message = "email is required")
        @Email(message = "email must be valid")
        @Size(max = 150)
        String email,

        @Schema(example = "123456", description = "6-digit code from the email")
        @NotBlank(message = "code is required")
        @Pattern(regexp = "[0-9]{6}", message = "code must be 6 digits")
        String code) {
}
