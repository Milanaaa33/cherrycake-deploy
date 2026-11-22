package com.cherrycake.fulfillment.repository;

import com.cherrycake.fulfillment.entity.PickupPoint;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PickupPointRepository extends JpaRepository<PickupPoint, Long> {

    List<PickupPoint> findByRegionIdAndAvailableTrueOrderById(Long regionId);
}
