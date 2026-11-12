package com.cherrycake.order.repository;

import com.cherrycake.order.entity.Order;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface OrderRepository extends JpaRepository<Order, Long> {

    Optional<Order> findByOrderNumber(String orderNumber);

    // Database allocation is safe across application restarts and concurrent instances.
    @Query(value = "SELECT nextval('order_number_seq')", nativeQuery = true)
    long nextOrderNumber();
}
