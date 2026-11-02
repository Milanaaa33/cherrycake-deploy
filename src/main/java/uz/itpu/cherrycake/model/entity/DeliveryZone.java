package uz.itpu.cherrycake.model.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "delivery_zones")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DeliveryZone
{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "region_id", nullable = false)
    private Region region;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(name = "delivery_fee", nullable = false, precision = 15, scale = 2)
    private BigDecimal deliveryFee;

    @Column(name = "estimated_minutes", nullable = false)
    @Builder.Default
    private Integer estimatedMinutes = 45;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private boolean active = true;
}