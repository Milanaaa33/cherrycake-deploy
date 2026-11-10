package com.cherrycake.order.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/**
 * Created order snapshot with server-calculated totals (CC-24).
 */
public record OrderResponse(
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
        String currencyCode) {

    public record Customer(String name, String phone, String email) {
    }

    public record Item(
            Long productId,
            String productName,
            BigDecimal unitPrice,
            BigDecimal modifiersPrice,
            int quantity,
            BigDecimal lineTotal) {
    }
}

