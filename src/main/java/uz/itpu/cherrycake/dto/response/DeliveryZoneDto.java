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
public class DeliveryZoneDto
{
    private Long id;
    private Long regionId;
    private String name;
    private BigDecimal deliveryFee;
    private Integer estimatedMinutes;
}