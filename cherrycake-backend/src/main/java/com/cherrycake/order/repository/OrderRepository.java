package com.cherrycake.order.repository;

import com.cherrycake.order.entity.Order;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface OrderRepository extends JpaRepository<Order, Long> {

    Optional<Order> findByOrderNumber(String orderNumber);

    // Newest first; items are loaded together with the orders to avoid one query per order.
    @EntityGraph(attributePaths = "items")
    List<Order> findByClientIdOrderByCreatedAtDescIdDesc(String clientId);

    // History of a signed-in customer: orders with their email plus orders made in this browser.
    // Pass "" (never a stored id) instead of null for clientId, null would match every order without an owner.
    @EntityGraph(attributePaths = "items")
    List<Order> findByEmailIgnoreCaseOrderByCreatedAtDescIdDesc(String email);

    // Database allocation is safe across application restarts and concurrent instances.
    @Query(value = "SELECT nextval('order_number_seq')", nativeQuery = true)
    long nextOrderNumber();

    // Adds earlier guest orders (no owner yet) with the same email and phone to a browser's history.
    @Modifying(flushAutomatically = true, clearAutomatically = true)
    @Query(value = "UPDATE orders SET client_id = :clientId "
            + "WHERE client_id IS NULL AND LOWER(email) = LOWER(:email) AND phone = :phone",
            nativeQuery = true)
    int claimUnownedOrders(@Param("clientId") String clientId,
            @Param("email") String email,
            @Param("phone") String phone);
}
