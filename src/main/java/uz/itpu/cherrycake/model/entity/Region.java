package uz.itpu.cherrycake.model.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "regions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Region
{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 10)
    private String code; // e.g. "UZ", "KZ", "US"

    @Column(nullable = false, length = 100)
    private String name;

    @Column(name = "currency_code", nullable = false, length = 10)
    private String currencyCode; // e.g. "UZS", "KZT", "USD"

    @Column(name = "currency_symbol", nullable = false, length = 10)
    private String currencySymbol; // e.g. "soʻm", "₸", "$"

    @Column(name = "vat_rate", nullable = false, precision = 5, scale = 2)
    private BigDecimal vatRate; // e.g. 12.00 for 12%

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private boolean active = true;
}