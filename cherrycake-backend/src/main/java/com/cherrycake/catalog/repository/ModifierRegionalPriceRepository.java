package com.cherrycake.catalog.repository;

import com.cherrycake.catalog.entity.ModifierRegionalPrice;
import java.util.Collection;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ModifierRegionalPriceRepository
        extends JpaRepository<ModifierRegionalPrice, ModifierRegionalPrice.Key> {

    List<ModifierRegionalPrice> findByRegionIdAndModifierIdIn(Long regionId, Collection<Long> modifierIds);
}
