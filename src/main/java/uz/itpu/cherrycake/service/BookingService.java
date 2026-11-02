package uz.itpu.cherrycake.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uz.itpu.cherrycake.common.exception.ConflictException;
import uz.itpu.cherrycake.common.exception.ResourceNotFoundException;
import uz.itpu.cherrycake.dto.request.BookingCreateRequest;
import uz.itpu.cherrycake.dto.response.BookingResponse;
import uz.itpu.cherrycake.model.entity.TableBooking;
import uz.itpu.cherrycake.model.entity.User;
import uz.itpu.cherrycake.model.enums.BookingStatus;
import uz.itpu.cherrycake.repository.TableBookingRepository;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookingService
{
    private final TableBookingRepository tableBookingRepository;

    @Transactional
    public BookingResponse createBooking(BookingCreateRequest request, User user)
    {
        // Conflict check: There we check whether table is booked within 2 hours of requested bookingTime
        LocalDateTime startWindow = request.getBookingTime().minusHours(2);
        LocalDateTime endWindow = request.getBookingTime().plusHours(2);

        boolean conflictExists = tableBookingRepository.existsByTableNumberAndBookingTimeBetween(request.getTableNumber(), startWindow, endWindow);

        if (conflictExists)
            throw new ConflictException(String.format("Table %d is already booked around %s. Please select another table or time.", request.getTableNumber(), request.getBookingTime()));

        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String shortId = UUID.randomUUID().toString().substring(0, 4).toUpperCase();
        String bookingNumber = "TB-" + timestamp + "-" + shortId;

        TableBooking booking = TableBooking.builder()
            .bookingNumber(bookingNumber)
            .user(user)
            .tableNumber(request.getTableNumber())
            .guestsCount(request.getGuestsCount())
            .bookingTime(request.getBookingTime())
            .status(BookingStatus.CONFIRMED)
            .customerName(request.getCustomerName())
            .customerPhone(request.getCustomerPhone())
            .notes(request.getNotes())
            .createdAt(LocalDateTime.now())
            .build();

        TableBooking saved = tableBookingRepository.save(booking);
        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public BookingResponse getBookingByNumber(String bookingNumber)
    {
        TableBooking booking = tableBookingRepository.findByBookingNumber(bookingNumber)
            .orElseThrow(() -> new ResourceNotFoundException("Booking not found with number: " + bookingNumber));
        return mapToResponse(booking);
    }

    @Transactional(readOnly = true)
    public List<BookingResponse> getUserBookings(Long userId)
    { return tableBookingRepository.findByUserIdOrderByBookingTimeDesc(userId).stream().map(this::mapToResponse).collect(Collectors.toList()); }

    private BookingResponse mapToResponse(TableBooking booking)
    {
        return BookingResponse.builder()
            .id(booking.getId())
            .bookingNumber(booking.getBookingNumber())
            .tableNumber(booking.getTableNumber())
            .guestsCount(booking.getGuestsCount())
            .bookingTime(booking.getBookingTime())
            .status(booking.getStatus())
            .customerName(booking.getCustomerName())
            .customerPhone(booking.getCustomerPhone())
            .notes(booking.getNotes())
            .createdAt(booking.getCreatedAt())
            .build();
    }
}