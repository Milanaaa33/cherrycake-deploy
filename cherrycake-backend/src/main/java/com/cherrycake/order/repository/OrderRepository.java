package com.cherrycake.order.repository;

import com.cherrycake.order.entity.Order;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderRepository extends JpaRepository<Order, Long> {

    Optional<Order> findByOrderNumber(String orderNumber);

    boolean existsByOrderNumber(String orderNumber);
}
