package uz.itpu.cherrycake.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import uz.itpu.cherrycake.model.enums.OrderType;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderCreateRequest
{
    @NotBlank(message = "Region code is required")
    private String regionCode;

    @NotNull(message = "Order type is required (PICKUP or DELIVERY)")
    private OrderType orderType;

    @NotBlank(message = "Customer name is required")
    @Size(min = 2, max = 150, message = "Customer name must be between 2 and 150 characters")
    private String customerName;

    @NotBlank(message = "Email is required")
    @Email(message = "Please provide a valid email address")
    private String customerEmail;

    @NotBlank(message = "Phone number is required")
    @Pattern(regexp = "^\\+?[0-9]{9,15}$", message = "Phone must be a valid number (9-15 digits)")
    private String customerPhone;

    private String deliveryAddress;

    private Long deliveryZoneId;

    private Long pickupPointId;

    private Long timeSlotId;

    private String promoCode;

    @NotNull(message = "Order date is required")
    @FutureOrPresent(message = "Order date cannot be in the past")
    private LocalDateTime orderDate;

    @Valid
    @NotEmpty(message = "Order items list cannot be empty")
    @Builder.Default
    private List<CartItemDto> items = new ArrayList<>();
}