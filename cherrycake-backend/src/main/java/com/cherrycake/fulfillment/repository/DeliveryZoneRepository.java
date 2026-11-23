package com.cherrycake.fulfillment.repository;

import com.cherrycake.fulfillment.entity.DeliveryZone;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DeliveryZoneRepository extends JpaRepository<DeliveryZone, Long> {

    List<DeliveryZone> findByRegionIdAndAvailableTrueOrderByDeliveryFeeAscIdAsc(Long regionId);
}
