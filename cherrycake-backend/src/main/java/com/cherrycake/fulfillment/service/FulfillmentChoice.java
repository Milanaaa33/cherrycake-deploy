package com.cherrycake.fulfillment.service;

import com.cherrycake.fulfillment.entity.FulfillmentType;
import java.math.BigDecimal;

/**
 * Validated way of receiving an order; {@code deliveryFee} is already in the region's currency.
 */
public record FulfillmentChoice(
        FulfillmentType type,
        Long pickupPointId,
        Long deliveryZoneId,
        Long timeSlotId,
        BigDecimal deliveryFee) {

    /** Order without pickup or delivery details (checkout before CC-38). */
    public static final FulfillmentChoice NONE = new FulfillmentChoice(null, null, null, null, new BigDecimal("0.00"));
}
