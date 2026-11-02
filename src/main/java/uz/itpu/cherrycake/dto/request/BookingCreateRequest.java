package uz.itpu.cherrycake.dto.request;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingCreateRequest
{
    @NotNull(message = "Table number is required")
    @Min(value = 1, message = "Table number must be at least 1")
    private Integer tableNumber;

    @NotNull(message = "Guests count is required")
    @Min(value = 1, message = "Guests count must be at least 1")
    @Max(value = 20, message = "Maximum 20 guests per table booking")
    private Integer guestsCount;

    @NotNull(message = "Booking time is required")
    @Future(message = "Booking time must be in the future")
    private LocalDateTime bookingTime;

    @NotBlank(message = "Customer name is required")
    private String customerName;

    @NotBlank(message = "Customer phone is required")
    @Pattern(regexp = "^\\+?[0-9]{9,15}$", message = "Phone must be valid")
    private String customerPhone;

    private String notes;
}