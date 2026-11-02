package uz.itpu.cherrycake.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import uz.itpu.cherrycake.model.enums.OrderType;

import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CartCalculateRequest
{
    @NotBlank(message = "Country/Region code is required")
    private String regionCode;

    @Valid
    @NotEmpty(message = "Cart cannot be empty")
    @Builder.Default
    private List<CartItemDto> items = new ArrayList<>();

    private String promoCode;

    @Builder.Default
    private OrderType orderType = OrderType.PICKUP;

    private Long deliveryZoneId;
}