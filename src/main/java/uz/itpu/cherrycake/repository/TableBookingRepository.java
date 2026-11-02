package uz.itpu.cherrycake.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import uz.itpu.cherrycake.model.entity.TableBooking;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface TableBookingRepository extends JpaRepository<TableBooking, Long>
{
    Optional<TableBooking> findByBookingNumber(String bookingNumber);

    boolean existsByTableNumberAndBookingTimeBetween(Integer tableNumber, LocalDateTime start, LocalDateTime end);

    List<TableBooking> findByUserIdOrderByBookingTimeDesc(Long userId);
}