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
public class ProductDto
{
    private Long id;
    private String code;
    private String name;
    private String description;
    private String imageUrl;
    private Long categoryId;
    private String categoryName;
    private BigDecimal price;
    private String currency;
    private String currencySymbol;
    private boolean available;

    @Builder.Default
    private List<ProductModifierDto> modifiers = new ArrayList<>();
}