package uz.itpu.cherrycake.model.entity;

import jakarta.persistence.*;
import lombok.*;
import uz.itpu.cherrycake.model.enums.DiscountType;

import java.math.BigDecimal;

@Entity
@Table(name = "discounts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Discount
{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, length = 50)
    private String code;

    @Column(nullable = false, length = 100)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(name = "discount_type", nullable = false, length = 30)
    private DiscountType discountType;

    @Column(name = "min_subtotal", nullable = false, precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal minSubtotal = BigDecimal.ZERO;

    @Column(nullable = false, precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal percentage = BigDecimal.ZERO;

    @Column(name = "fixed_amount", nullable = false, precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal fixedAmount = BigDecimal.ZERO;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private boolean active = true;
}