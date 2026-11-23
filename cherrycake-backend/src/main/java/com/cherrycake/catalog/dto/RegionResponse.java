package com.cherrycake.catalog.dto;

import java.math.BigDecimal;

public record RegionResponse(
        Long id,
        String code,
        String name,
        String currencyCode,
        String currencySymbol,
        BigDecimal vatRate) {
}
