package uz.itpu.cherrycake.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegionDto
{
    private Long id;
    private String code;
    private String name;
    private String currencyCode;
    private String currencySymbol;
    private BigDecimal vatRate;
    private boolean active;
}