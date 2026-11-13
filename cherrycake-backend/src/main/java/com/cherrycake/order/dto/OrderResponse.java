package com.cherrycake.order.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Created order snapshot with server-calculated totals (CC-24).
 */
public record OrderResponse(
        @Schema(example = "CC-2026-000123", accessMode = Schema.AccessMode.READ_ONLY)
        String orderNumber,
        LocalDate orderDate,
        String region,
        Customer customer,
        List<Item> items,
        BigDecimal subtotal,
        BigDecimal vatRate,
        BigDecimal vatAmount,
        BigDecimal amountInclVat,
        BigDecimal discountRate,
        BigDecimal discountAmount,
        BigDecimal deliveryFee,
        BigDecimal total,
        String currencyCode,
        LocalDateTime createdAt) {

    @Schema(name = "OrderCustomerResponse")
    public record Customer(String name, String phone, String email) {
    }

    @Schema(name = "OrderItemResponse")
    public record Item(
            Long productId,
            String productName,
            BigDecimal unitPrice,
            BigDecimal modifiersPrice,
            int quantity,
            BigDecimal lineTotal) {
    }
}
