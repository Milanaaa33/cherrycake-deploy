package com.cherrycake.fulfillment.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.math.BigDecimal;

public record DeliveryZoneResponse(
        Long id,
        @Schema(example = "Center") String name,
        @Schema(example = "15000.00", description = "Delivery price in the region's currency")
        BigDecimal deliveryFee,
        @Schema(example = "UZS") String currencyCode) {
}
