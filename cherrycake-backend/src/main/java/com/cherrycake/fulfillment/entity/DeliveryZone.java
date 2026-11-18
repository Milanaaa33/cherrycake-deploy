package com.cherrycake.fulfillment.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.math.BigDecimal;

@Entity
@Table(name = "delivery_zones")
public class DeliveryZone {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "region_id", nullable = false)
    private Long regionId;

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    // Conventional units; converted with the region's exchange rate.
    @Column(name = "delivery_fee", nullable = false, precision = 12, scale = 6)
    private BigDecimal deliveryFee;

    @Column(name = "is_available", nullable = false)
    private boolean available;

    protected DeliveryZone() {
    }

    public Long getId() {
        return id;
    }

    public Long getRegionId() {
        return regionId;
    }

    public String getName() {
        return name;
    }

    public BigDecimal getDeliveryFee() {
        return deliveryFee;
    }

    public boolean isAvailable() {
        return available;
    }
}
