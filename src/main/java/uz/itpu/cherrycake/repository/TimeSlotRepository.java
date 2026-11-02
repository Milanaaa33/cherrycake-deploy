package uz.itpu.cherrycake.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import uz.itpu.cherrycake.model.entity.TimeSlot;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TimeSlotRepository extends JpaRepository<TimeSlot, Long>
{ List<TimeSlot> findBySlotTimeAfterOrderBySlotTimeAsc(LocalDateTime now); }