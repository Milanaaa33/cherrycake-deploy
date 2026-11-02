package uz.itpu.cherrycake.model.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "product_prices", uniqueConstraints = { @UniqueConstraint(columnNames = { "product_id", "region_id" }) })
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductPrice
{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "region_id", nullable = false)
    private Region region;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal price;
}