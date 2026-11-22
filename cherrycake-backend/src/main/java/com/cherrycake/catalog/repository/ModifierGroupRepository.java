package com.cherrycake.catalog.repository;

import com.cherrycake.catalog.entity.ModifierGroup;
import java.util.Collection;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ModifierGroupRepository extends JpaRepository<ModifierGroup, Long> {

    List<ModifierGroup> findByProductIdInOrderById(Collection<Long> productIds);
}
