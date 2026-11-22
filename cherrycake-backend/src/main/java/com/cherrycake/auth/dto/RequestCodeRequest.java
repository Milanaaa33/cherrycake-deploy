package com.cherrycake.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RequestCodeRequest(
        @Schema(example = "malika@example.com")
        @NotBlank(message = "email is required")
        @Email(message = "email must be valid")
        @Size(max = 150)
        String email) {
}
