package com.cherrycake.fulfillment.dto;

import io.swagger.v3.oas.annotations.media.Schema;

public record PickupPointResponse(
        Long id,
        @Schema(example = "Cherry Cake Tashkent City") String name,
        @Schema(example = "Tashkent, Amir Temur Avenue 15") String address,
        @Schema(example = "09:00-21:00") String openingHours) {
}
