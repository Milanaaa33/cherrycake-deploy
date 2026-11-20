package com.cherrycake.booking.repository;

import com.cherrycake.booking.entity.TableBooking;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TableBookingRepository extends JpaRepository<TableBooking, Long> {

    Optional<TableBooking> findByBookingNumber(String bookingNumber);

    List<TableBooking> findByBookingTimeBetween(LocalDateTime start, LocalDateTime end);

    List<TableBooking> findByEmailOrderByBookingTimeDesc(String email);
}
