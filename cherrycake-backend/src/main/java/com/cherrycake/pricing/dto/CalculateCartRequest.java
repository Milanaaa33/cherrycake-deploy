package com.cherrycake.pricing.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public record CalculateCartRequest(
        @Schema(example = "UZB")
        @NotBlank(message = "region is required")
        String region,

        @NotEmpty(message = "cart is empty")
        List<@NotNull @Valid Item> items) {

    @Schema(name = "CalculateCartItemRequest")
    public record Item(
            @NotNull(message = "productId is required")
            Long productId,

            @NotNull(message = "quantity is required")
            @Min(value = 1, message = "quantity must be at least 1")
            Integer quantity,

            List<@NotNull Long> modifierIds) {

        public Item {
            modifierIds = modifierIds == null ? List.of() : modifierIds;
        }
    }
}
