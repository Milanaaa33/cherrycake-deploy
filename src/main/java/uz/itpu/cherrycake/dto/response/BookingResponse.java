package uz.itpu.cherrycake.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import uz.itpu.cherrycake.model.enums.BookingStatus;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingResponse
{
    private Long id;
    private String bookingNumber;
    private Integer tableNumber;
    private Integer guestsCount;
    private LocalDateTime bookingTime;
    private BookingStatus status;
    private String customerName;
    private String customerPhone;
    private String notes;
    private LocalDateTime createdAt;
}