package com.cherrycake.catalog.repository;

import com.cherrycake.catalog.entity.RegionalPrice;
import java.util.Collection;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RegionalPriceRepository extends JpaRepository<RegionalPrice, RegionalPrice.Key> {

    List<RegionalPrice> findByRegionId(Long regionId);

    List<RegionalPrice> findByRegionIdAndProductIdIn(Long regionId, Collection<Long> productIds);
}
