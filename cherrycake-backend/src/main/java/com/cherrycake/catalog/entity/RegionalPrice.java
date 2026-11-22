package com.cherrycake.catalog.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.Table;
import java.io.Serializable;
import java.math.BigDecimal;

/**
 * Product price in conventional units for one region.
 */
@Entity
@Table(name = "regional_prices")
@IdClass(RegionalPrice.Key.class)
public class RegionalPrice {

    public record Key(Long productId, Long regionId) implements Serializable {
    }

    @Id
    @Column(name = "product_id")
    private Long productId;

    @Id
    @Column(name = "region_id")
    private Long regionId;

    private BigDecimal price;

    @Column(name = "in_stock")
    private boolean inStock;

    protected RegionalPrice() {
    }

    public Long getProductId() {
        return productId;
    }

    public Long getRegionId() {
        return regionId;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public boolean isInStock() {
        return inStock;
    }
}
