package com.cherrycake.catalog.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.Table;
import java.io.Serializable;
import java.math.BigDecimal;

/**
 * Modifier surcharge in conventional units for one region.
 */
@Entity
@Table(name = "modifier_regional_prices")
@IdClass(ModifierRegionalPrice.Key.class)
public class ModifierRegionalPrice {

    public record Key(Long modifierId, Long regionId) implements Serializable {
    }

    @Id
    @Column(name = "modifier_id")
    private Long modifierId;

    @Id
    @Column(name = "region_id")
    private Long regionId;

    @Column(name = "price_delta")
    private BigDecimal priceDelta;

    protected ModifierRegionalPrice() {
    }

    public Long getModifierId() {
        return modifierId;
    }

    public Long getRegionId() {
        return regionId;
    }

    public BigDecimal getPriceDelta() {
        return priceDelta;
    }
}
