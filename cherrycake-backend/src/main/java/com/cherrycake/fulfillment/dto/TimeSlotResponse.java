package com.cherrycake.fulfillment.dto;

import io.swagger.v3.oas.annotations.media.Schema;

/** Time slot contract for both table booking and existing checkout flows. */
public record TimeSlotResponse(
        Long timeSlotId,
        @Schema(example = "18:00") String time,
        boolean isAvailable,
        Long id,
        @Schema(example = "18:00") String startTime,
        @Schema(example = "19:00") String endTime,
        int capacity,
        int remaining) {
}
