package uz.itpu.cherrycake.model.entity;

import jakarta.persistence.*;
import lombok.*;
import uz.itpu.cherrycake.model.enums.BookingStatus;

import java.time.LocalDateTime;

@Entity
@Table(name = "table_bookings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TableBooking
{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "booking_number", nullable = false, unique = true, length = 50)
    private String bookingNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "table_number", nullable = false)
    private Integer tableNumber;

    @Column(name = "guests_count", nullable = false)
    private Integer guestsCount;

    @Column(name = "booking_time", nullable = false)
    private LocalDateTime bookingTime;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    @Builder.Default
    private BookingStatus status = BookingStatus.CONFIRMED;

    @Column(name = "customer_name", nullable = false, length = 150)
    private String customerName;

    @Column(name = "customer_phone", nullable = false, length = 50)
    private String customerPhone;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}