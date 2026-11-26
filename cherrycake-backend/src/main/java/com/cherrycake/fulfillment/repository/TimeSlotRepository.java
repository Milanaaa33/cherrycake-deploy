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

/**
 * A slot's capacity is shared by everything that occupies it on a date: checkout orders (pickup or delivery)
 * and table bookings. "Taken" below always means orders + bookings, so the slot list, the order reservation
 * and the booking check agree with each other.
 */
public interface TimeSlotRepository extends JpaRepository<TimeSlot, Long> {

    String TAKEN_PER_SLOT = "SELECT time_slot_id, COUNT(*) FROM ("
            + "SELECT time_slot_id FROM orders WHERE order_date = :date AND time_slot_id IS NOT NULL "
            + "UNION ALL "
            + "SELECT time_slot_id FROM bookings WHERE booking_date = :date"
            + ") taken GROUP BY time_slot_id";

    List<TimeSlot> findAllByOrderByStartTime();

    // Row lock: orders and bookings for the same slot wait here, so two of them cannot take the last place together.
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT s FROM TimeSlot s WHERE s.id = :id")
    Optional<TimeSlot> findByIdForUpdate(@Param("id") Long id);

    /** Orders plus bookings of one slot on one date. */
    @Query(value = "SELECT (SELECT COUNT(*) FROM orders WHERE time_slot_id = :slotId AND order_date = :date) + "
            + "(SELECT COUNT(*) FROM bookings WHERE time_slot_id = :slotId AND booking_date = :date)",
            nativeQuery = true)
    long countTaken(@Param("slotId") Long slotId, @Param("date") LocalDate date);

    /** Rows of [time_slot_id, orders + bookings] for one date; slots without anything are absent. */
    @Query(value = TAKEN_PER_SLOT, nativeQuery = true)
    List<Object[]> countTakenBySlot(@Param("date") LocalDate date);

    @Query(value = "SELECT COUNT(*) FROM dining_tables dt "
            + "JOIN pickup_points pp ON pp.id = dt.pickup_point_id "
            + "WHERE dt.is_available = TRUE AND pp.is_available = TRUE "
            + "AND NOT EXISTS (SELECT 1 FROM bookings b WHERE b.dining_table_id = dt.id "
            + "AND b.booking_date = :date AND b.time_slot_id = :slotId)", nativeQuery = true)
    long countAvailableTables(@Param("slotId") Long slotId, @Param("date") LocalDate date);
}
