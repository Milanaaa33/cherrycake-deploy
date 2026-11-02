package uz.itpu.cherrycake.model.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "product_modifiers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductModifier
{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(name = "price_delta", nullable = false, precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal priceDelta = BigDecimal.ZERO;

    @Column(name = "is_default", nullable = false)
    @Builder.Default
    private boolean isDefault = false;
}