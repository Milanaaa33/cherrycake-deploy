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

    // Rows of [time_slot_id, orders count] for one date.
    @Query(value = "SELECT time_slot_id, COUNT(*) FROM orders "
            + "WHERE order_date = :date AND time_slot_id IS NOT NULL GROUP BY time_slot_id",
            nativeQuery = true)
    List<Object[]> countOrdersBySlot(@Param("date") LocalDate date);
}
