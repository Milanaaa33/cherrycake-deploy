package com.cherrycake.fulfillment.dto;

import io.swagger.v3.oas.annotations.media.Schema;

public record TimeSlotResponse(
        Long id,
        @Schema(example = "10:00") String startTime,
        @Schema(example = "12:00") String endTime,
        @Schema(example = "5") int capacity,
        @Schema(example = "3", description = "Places left on the requested date") int remaining,
        @Schema(description = "False when the slot is full or closed") boolean isAvailable) {
}
