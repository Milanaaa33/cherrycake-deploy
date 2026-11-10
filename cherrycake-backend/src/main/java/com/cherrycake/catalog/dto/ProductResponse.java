package com.cherrycake.catalog.dto;

import com.cherrycake.catalog.entity.ModifierType;
import com.fasterxml.jackson.annotation.JsonInclude;
import java.math.BigDecimal;
import java.util.List;

/**
 * Product card with the price in the region's currency. Only the detail endpoint fills modifierGroups.
 */
public record ProductResponse(
        Long id,
        String name,
        String description,
        String photoUrl,
        BigDecimal price,
        boolean inStock,
        @JsonInclude(JsonInclude.Include.NON_NULL) List<ModifierGroup> modifierGroups) {

    public record ModifierGroup(Long id, String name, ModifierType type, boolean isRequired, List<Modifier> modifiers) {
    }

    public record Modifier(Long id, String name, BigDecimal priceDelta) {
    }
}
