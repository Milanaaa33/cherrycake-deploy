package uz.itpu.cherrycake.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import uz.itpu.cherrycake.model.entity.Order;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long>
{

    Optional<Order> findByOrderNumber(String orderNumber);

    List<Order> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<Order> findByCreatedAtBetween(LocalDateTime startDate, LocalDateTime endDate);

    List<Order> findByRegionCodeIgnoreCaseAndCreatedAtBetween(String regionCode, LocalDateTime startDate, LocalDateTime endDate);

    @Query
    (
        "SELECT r.code AS regionCode, r.name AS regionName, SUM(o.totalAmount) AS totalSales, COUNT(o) AS orderCount " +
        "FROM Order o JOIN o.region r " +
        "WHERE o.createdAt BETWEEN :startDate AND :endDate " +
        "GROUP BY r.code, r.name"
    )
    List<Object[]> getSalesAggregateByRegion(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
}