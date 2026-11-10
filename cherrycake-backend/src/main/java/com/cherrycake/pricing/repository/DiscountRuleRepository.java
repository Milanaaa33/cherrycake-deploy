package com.cherrycake.pricing.repository;

import com.cherrycake.pricing.entity.DiscountRule;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DiscountRuleRepository extends JpaRepository<DiscountRule, Long> {
}
