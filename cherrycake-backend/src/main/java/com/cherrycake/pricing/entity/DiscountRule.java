package com.cherrycake.pricing.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.math.BigDecimal;

/**
 * Discount rate that applies from a threshold in conventional units.
 */
@Entity
@Table(name = "discount_rules")
public class DiscountRule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private BigDecimal threshold;

    private BigDecimal rate;

    protected DiscountRule() {
    }

    public DiscountRule(BigDecimal threshold, BigDecimal rate) {
        this.threshold = threshold;
        this.rate = rate;
    }

    public Long getId() {
        return id;
    }

    public BigDecimal getThreshold() {
        return threshold;
    }

    public BigDecimal getRate() {
        return rate;
    }
}
