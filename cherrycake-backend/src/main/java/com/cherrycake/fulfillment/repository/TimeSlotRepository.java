package com.cherrycake.fulfillment.repository;

import com.cherrycake.fulfillment.entity.TimeSlot;
import jakarta.persistence.LockModeType;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface TimeSlotRepository extends JpaRepository<TimeSlot, Long> {

    List<TimeSlot> findAllByOrderByStartTime();

    // Row lock: orders for the same slot wait here, so two of them cannot take the last place together.
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT s FROM TimeSlot s WHERE s.id = :id")
    Optional<TimeSlot> findByIdForUpdate(@Param("id") Long id);

    @Query(value = "SELECT COUNT(*) FROM orders WHERE time_slot_id = :slotId AND order_date = :date",
            nativeQuery = true)
    long countOrders(@Param("slotId") Long slotId, @Param("date") LocalDate date);

    @Query(value = "SELECT time_slot_id, COUNT(*) FROM bookings "
            + "WHERE booking_date = :date GROUP BY time_slot_id", nativeQuery = true)
    List<Object[]> countBookingsBySlot(@Param("date") LocalDate date);


    @Query(value = "SELECT COUNT(*) FROM dining_tables dt "
            + "JOIN pickup_points pp ON pp.id = dt.pickup_point_id "
            + "WHERE dt.is_available = TRUE AND pp.is_available = TRUE "
            + "AND NOT EXISTS (SELECT 1 FROM bookings b WHERE b.dining_table_id = dt.id "
            + "AND b.booking_date = :date AND b.time_slot_id = :slotId)", nativeQuery = true)
    long countAvailableTables(@Param("slotId") Long slotId, @Param("date") LocalDate date);

    // Rows of [time_slot_id, orders count] for one date.
    @Query(value = "SELECT time_slot_id, COUNT(*) FROM orders "
            + "WHERE order_date = :date AND time_slot_id IS NOT NULL GROUP BY time_slot_id",
            nativeQuery = true)
    List<Object[]> countOrdersBySlot(@Param("date") LocalDate date);
}
