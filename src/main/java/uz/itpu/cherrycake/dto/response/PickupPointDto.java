package uz.itpu.cherrycake.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PickupPointDto
{
    private Long id;
    private Long regionId;
    private String name;
    private String address;
    private String workingHours;
}