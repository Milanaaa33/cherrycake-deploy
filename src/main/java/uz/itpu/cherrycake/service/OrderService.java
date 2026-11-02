package uz.itpu.cherrycake.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uz.itpu.cherrycake.common.exception.ConflictException;
import uz.itpu.cherrycake.common.exception.ResourceNotFoundException;
import uz.itpu.cherrycake.dto.request.CartCalculateRequest;
import uz.itpu.cherrycake.dto.request.OrderCreateRequest;
import uz.itpu.cherrycake.dto.response.CartCalculateResponse;
import uz.itpu.cherrycake.dto.response.OrderItemResponse;
import uz.itpu.cherrycake.dto.response.OrderResponse;
import uz.itpu.cherrycake.model.entity.*;
import uz.itpu.cherrycake.model.enums.OrderStatus;
import uz.itpu.cherrycake.model.enums.OrderType;
import uz.itpu.cherrycake.repository.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService
{
    private final OrderRepository orderRepository;
    private final RegionRepository regionRepository;
    private final ProductRepository productRepository;
    private final TimeSlotRepository timeSlotRepository;
    private final PickupPointRepository pickupPointRepository;
    private final PriceCalculatorService priceCalculatorService;

    @Transactional
    public OrderResponse createOrder(OrderCreateRequest request, User user)
    {
        Region region = regionRepository.findByCodeIgnoreCase(request.getRegionCode()).orElseThrow(() -> new ResourceNotFoundException("Region not found: " + request.getRegionCode()));

        // Check time slot capacity if specified
        TimeSlot timeSlot = null;
        if (request.getTimeSlotId() != null)
        {
            timeSlot = timeSlotRepository.findById(request.getTimeSlotId()).orElseThrow(() -> new ResourceNotFoundException("Time slot not found"));
            if (timeSlot.isFull()) throw new ConflictException("Selected time slot is already fully booked.");
            timeSlot.setReservedCount(timeSlot.getReservedCount() + 1);
            timeSlotRepository.save(timeSlot);
        }

        // Check pickup point if pickup order
        PickupPoint pickupPoint = null;
        if (request.getOrderType() == OrderType.PICKUP && request.getPickupPointId() != null)
            pickupPoint = pickupPointRepository.findById(request.getPickupPointId()).orElseThrow(() -> new ResourceNotFoundException("Pickup point not found"));

        // Perform server-side calculation of the order totals (prevent client tampering)
        CartCalculateRequest calcRequest = CartCalculateRequest.builder()
            .regionCode(region.getCode())
            .items(request.getItems())
            .promoCode(request.getPromoCode())
            .orderType(request.getOrderType())
            .deliveryZoneId(request.getDeliveryZoneId())
            .build();

        CartCalculateResponse calcResult = priceCalculatorService.calculateCart(calcRequest);

        // Generate unique order number (e.g., CC-20261029-A1B2)
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String shortId = UUID.randomUUID().toString().substring(0, 5).toUpperCase();
        String orderNumber = "CC-" + timestamp + "-" + shortId;

        Order order = Order.builder()
            .orderNumber(orderNumber)
            .user(user)
            .region(region)
            .slot(timeSlot)
            .pickupPoint(pickupPoint)
            .orderType(request.getOrderType())
            .status(OrderStatus.PENDING)
            .subtotal(calcResult.getSubtotal())
            .vatRate(calcResult.getVatRate())
            .vatAmount(calcResult.getVatAmount())
            .amountInclVat(calcResult.getAmountInclVat())
            .discountAmount(calcResult.getDiscountAmount())
            .deliveryFee(calcResult.getDeliveryFee())
            .totalAmount(calcResult.getFinalTotal())
            .currency(calcResult.getCurrency())
            .customerName(request.getCustomerName())
            .customerEmail(request.getCustomerEmail())
            .customerPhone(request.getCustomerPhone())
            .deliveryAddress(request.getDeliveryAddress())
            .orderDate(request.getOrderDate())
            .createdAt(LocalDateTime.now())
            .items(new ArrayList<>())
            .build();

        // Create line items
        for (CartCalculateResponse.CalculatedItemDto calcItem : calcResult.getItems())
        {
            Product product = productRepository.findById(calcItem.getProductId()).orElseThrow(() -> new ResourceNotFoundException("Product not found"));

            String selectedMods = String.join(", ", calcItem.getModifierNames());

            OrderItem orderItem = OrderItem.builder()
                .order(order)
                .product(product)
                .productName(calcItem.getProductName())
                .quantity(calcItem.getQuantity())
                .unitPrice(calcItem.getUnitPrice())
                .modifiersCost(calcItem.getModifiersPrice())
                .totalPrice(calcItem.getLineTotal())
                .selectedModifiers(selectedMods)
                .build();

            order.getItems().add(orderItem);
        }

        Order saved = orderRepository.save(order);
        return mapToOrderResponse(saved);
    }

    @Transactional(readOnly = true)
    public OrderResponse getOrderByNumber(String orderNumber)
    {
        Order order = orderRepository.findByOrderNumber(orderNumber).orElseThrow(() -> new ResourceNotFoundException("Order not found with number: " + orderNumber));
        return mapToOrderResponse(order);
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getUserOrders(Long userId)
    { return orderRepository.findByUserIdOrderByCreatedAtDesc(userId).stream().map(this::mapToOrderResponse).collect(Collectors.toList()); }

    @Transactional(readOnly = true)
    public List<OrderResponse> getAllOrders()
    { return orderRepository.findAll().stream().map(this::mapToOrderResponse).collect(Collectors.toList()); }

    private OrderResponse mapToOrderResponse(Order order)
    {
        List<OrderItemResponse> itemResponses = order.getItems().stream().map
        (i -> OrderItemResponse.builder()
            .productId(i.getProduct().getId())
            .productName(i.getProductName())
            .quantity(i.getQuantity())
            .unitPrice(i.getUnitPrice())
            .modifiersCost(i.getModifiersCost())
            .totalPrice(i.getTotalPrice())
            .selectedModifiers(i.getSelectedModifiers())
            .build()
        ).collect(Collectors.toList());

        return OrderResponse.builder()
            .id(order.getId())
            .orderNumber(order.getOrderNumber())
            .orderType(order.getOrderType())
            .status(order.getStatus())
            .regionCode(order.getRegion().getCode())
            .currency(order.getCurrency())
            .subtotal(order.getSubtotal())
            .vatRate(order.getVatRate())
            .vatAmount(order.getVatAmount())
            .amountInclVat(order.getAmountInclVat())
            .discountAmount(order.getDiscountAmount())
            .deliveryFee(order.getDeliveryFee())
            .totalAmount(order.getTotalAmount())
            .customerName(order.getCustomerName())
            .customerEmail(order.getCustomerEmail())
            .customerPhone(order.getCustomerPhone())
            .deliveryAddress(order.getDeliveryAddress())
            .pickupPointName(order.getPickupPoint() != null ? order.getPickupPoint().getName() : null)
            .timeSlot(order.getSlot() != null ? order.getSlot().getSlotTime() : null)
            .orderDate(order.getOrderDate())
            .createdAt(order.getCreatedAt())
            .items(itemResponses)
            .build();
    }
}