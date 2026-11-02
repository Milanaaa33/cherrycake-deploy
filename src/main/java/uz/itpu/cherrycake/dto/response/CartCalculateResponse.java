package uz.itpu.cherrycake.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CartCalculateResponse
{
    private String regionCode;
    private String currency;
    private String currencySymbol;

    private BigDecimal subtotal;
    private BigDecimal vatRate;
    private BigDecimal vatAmount;
    private BigDecimal amountInclVat;

    private BigDecimal discountRate;
    private BigDecimal discountAmount;
    private String discountDescription;

    private BigDecimal deliveryFee;
    private BigDecimal finalTotal;

    @Builder.Default
    private List<CalculatedItemDto> items = new ArrayList<>();

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CalculatedItemDto
    {
        private Long productId;
        private String productName;
        private Integer quantity;
        private BigDecimal unitPrice;
        private BigDecimal modifiersPrice;
        private BigDecimal lineTotal;
        private List<String> modifierNames;
    }
}