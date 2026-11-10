package com.cherrycake.catalog.repository;

import com.cherrycake.catalog.entity.Region;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RegionRepository extends JpaRepository<Region, Long> {

    Optional<Region> findByCode(String code);

    List<Region> findAllByOrderById();
}
