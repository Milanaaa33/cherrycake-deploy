package uz.itpu.cherrycake.model.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "time_slots")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TimeSlot
{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "slot_time", nullable = false)
    private LocalDateTime slotTime;

    @Column(nullable = false)
    @Builder.Default
    private Integer capacity = 10;

    @Column(name = "reserved_count", nullable = false)
    @Builder.Default
    private Integer reservedCount = 0;

    public boolean isFull() { return reservedCount >= capacity; }
}