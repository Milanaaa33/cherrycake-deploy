package uz.itpu.cherrycake.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import uz.itpu.cherrycake.model.enums.OrderStatus;
import uz.itpu.cherrycake.model.enums.OrderType;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderResponse
{
    private Long id;
    private String orderNumber;
    private OrderType orderType;
    private OrderStatus status;

    private String regionCode;
    private String currency;

    private BigDecimal subtotal;
    private BigDecimal vatRate;
    private BigDecimal vatAmount;
    private BigDecimal amountInclVat;
    private BigDecimal discountAmount;
    private BigDecimal deliveryFee;
    private BigDecimal totalAmount;

    private String customerName;
    private String customerEmail;
    private String customerPhone;
    private String deliveryAddress;

    private String pickupPointName;
    private LocalDateTime timeSlot;
    private LocalDateTime orderDate;
    private LocalDateTime createdAt;

    @Builder.Default
    private List<OrderItemResponse> items = new ArrayList<>();
}