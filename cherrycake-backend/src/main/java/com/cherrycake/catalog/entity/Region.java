package com.cherrycake.catalog.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.math.RoundingMode;

@Entity
@Table(name = "regions")
public class Region {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String code;

    private String name;

    @Column(name = "currency_code")
    private String currencyCode;

    @Column(name = "currency_symbol")
    private String currencySymbol;

    @Column(name = "vat_rate")
    private BigDecimal vatRate;

    @Column(name = "exchange_rate")
    private BigDecimal exchangeRate;

    protected Region() {
    }

    /**
     * Converts an amount in conventional units to this region's currency.
     */
    public BigDecimal toLocalCurrency(BigDecimal conventionalUnits) {
        return conventionalUnits.multiply(exchangeRate).setScale(2, RoundingMode.HALF_UP);
    }

    public Long getId() {
        return id;
    }

    public String getCode() {
        return code;
    }

    public String getName() {
        return name;
    }

    public String getCurrencyCode() {
        return currencyCode;
    }

    public String getCurrencySymbol() {
        return currencySymbol;
    }

    public BigDecimal getVatRate() {
        return vatRate;
    }

    public BigDecimal getExchangeRate() {
        return exchangeRate;
    }
}
