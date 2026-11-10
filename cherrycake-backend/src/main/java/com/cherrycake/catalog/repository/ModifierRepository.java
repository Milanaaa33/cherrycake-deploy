package com.cherrycake.catalog.repository;

import com.cherrycake.catalog.entity.Modifier;
import java.util.Collection;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ModifierRepository extends JpaRepository<Modifier, Long> {

    List<Modifier> findByGroupIdInOrderById(Collection<Long> groupIds);
}
