package com.cherrycake.pricing.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.math.BigDecimal;
import java.util.List;

/**
 * Cart totals in the currency of the requested region.
 */
public record CalculateCartResponse(
        List<Item> items,
        BigDecimal subtotal,
        BigDecimal vatRate,
        BigDecimal vatAmount,
        BigDecimal amountInclVat,
        BigDecimal discountRate,
        BigDecimal discountAmount,
        BigDecimal deliveryFee,
        BigDecimal total,
        String currencyCode) {

    @Schema(name = "CalculateCartItemResponse")
    public record Item(
            Long productId,
            BigDecimal unitPrice,
            BigDecimal modifiersPrice,
            int quantity,
            BigDecimal lineTotal) {
    }
}
