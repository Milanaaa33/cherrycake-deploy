package com.cherrycake.booking.service;

import com.cherrycake.booking.dto.BookingCreateRequest;
import com.cherrycake.booking.dto.BookingResponse;
import com.cherrycake.booking.entity.BookingStatus;
import com.cherrycake.booking.entity.TableBooking;
import com.cherrycake.booking.repository.TableBookingRepository;
import com.cherrycake.common.exception.BadRequestException;
import com.cherrycake.common.exception.ConflictException;
import com.cherrycake.common.exception.NotFoundException;
import com.cherrycake.fulfillment.entity.TimeSlot;
import com.cherrycake.fulfillment.repository.TimeSlotRepository;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Arrays;
import java.util.Comparator;
import java.util.List;
import java.util.concurrent.atomic.AtomicLong;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class BookingService {

    private static final AtomicLong BOOKING_COUNTER = new AtomicLong(40);

    private final TableBookingRepository tableBookingRepository;
    private final TimeSlotRepository timeSlotRepository;

    public BookingService(TableBookingRepository tableBookingRepository, TimeSlotRepository timeSlotRepository) {
        this.tableBookingRepository = tableBookingRepository;
        this.timeSlotRepository = timeSlotRepository;
    }

    private static class CafeTable {
        final int tableNumber;
        final int capacity;

        CafeTable(int number, int capacity) {
            this.tableNumber = number;
            this.capacity = capacity;
        }
    }

    private static final List<CafeTable> CAFE_TABLES = Arrays.asList(
        new CafeTable(1, 2),
        new CafeTable(2, 2),
        new CafeTable(3, 2),
        new CafeTable(4, 4),
        new CafeTable(5, 4),
        new CafeTable(6, 4),
        new CafeTable(7, 6),
        new CafeTable(8, 6),
        new CafeTable(9, 8),
        new CafeTable(10, 8),
        new CafeTable(11, 10),
        new CafeTable(12, 12)
    );

    @Transactional
    public BookingResponse createBooking(BookingCreateRequest request) {
        if (request == null) {
            throw new BadRequestException("Booking request cannot be null");
        }

        LocalDate targetDate = request.getDate();
        LocalTime targetTime = request.getTime();

        if (targetDate == null && request.getBookingTime() != null) {
            targetDate = request.getBookingTime().toLocalDate();
        }

        if (targetTime == null && request.getTimeSlotId() != null) {
            targetTime = timeSlotRepository.findById(request.getTimeSlotId())
                .map(TimeSlot::getStartTime)
                .orElse(null);
        }

        if (targetTime == null && request.getBookingTime() != null) {
            targetTime = request.getBookingTime().toLocalTime();
        }

        if (targetDate == null || targetTime == null) {
            throw new BadRequestException("Booking date and time are required");
        }

        if (targetDate.isBefore(LocalDate.now())) {
            throw new BadRequestException("Booking date cannot be in the past: " + targetDate);
        }

        LocalTime opening = LocalTime.of(10, 0);
        LocalTime closing = LocalTime.of(22, 0);
        if (targetTime.isBefore(opening) || targetTime.isAfter(closing)) {
            throw new BadRequestException("Booking time must be within cafe working hours 10:00 - 22:00: " + targetTime);
        }

        int guests = request.getGuestsCount() != null ? request.getGuestsCount() : (request.getGuests() != null ? request.getGuests() : 0);
        if (guests < 1 || guests > 12) {
            throw new BadRequestException("Guests count must be between 1 and 12");
        }

        String customerName = request.resolveCustomerName();
        if (customerName == null || customerName.isBlank()) {
            throw new BadRequestException("Customer name is required");
        }

        String customerPhone = request.resolveCustomerPhone();
        if (customerPhone == null || customerPhone.isBlank()) {
            throw new BadRequestException("Customer phone is required");
        }

        String email = request.resolveCustomerEmail();

        LocalDateTime bookingDateTime = LocalDateTime.of(targetDate, targetTime);
        LocalDateTime windowStart = bookingDateTime.minusHours(1).minusMinutes(59);
        LocalDateTime windowEnd = bookingDateTime.plusHours(1).plusMinutes(59);

        List<TableBooking> conflictingBookings = tableBookingRepository.findByBookingTimeBetween(windowStart, windowEnd)
            .stream()
            .filter(b -> b.getStatus() == BookingStatus.CONFIRMED || b.getStatus() == BookingStatus.PENDING)
            .collect(Collectors.toList());

        List<Integer> occupiedTableNumbers = conflictingBookings.stream()
            .map(TableBooking::getTableNumber)
            .collect(Collectors.toList());

        Integer assignedTable = request.getTableNumber();
        if (assignedTable != null) {
            if (occupiedTableNumbers.contains(assignedTable)) {
                throw new ConflictException("Selected time slot is no longer available. Please choose another time.");
            }
        } else {
            assignedTable = CAFE_TABLES.stream()
                .filter(table -> table.capacity >= guests)
                .filter(table -> !occupiedTableNumbers.contains(table.tableNumber))
                .min(Comparator.comparingInt(table -> table.capacity))
                .map(table -> table.tableNumber)
                .orElse(null);

            if (assignedTable == null) {
                throw new ConflictException("Selected time slot is no longer available. Please choose another time.");
            }
        }

        String bookingNumber = "CHK-BKG-" + BOOKING_COUNTER.incrementAndGet();

        TableBooking booking = new TableBooking(
            bookingNumber,
            email,
            assignedTable,
            guests,
            bookingDateTime,
            BookingStatus.CONFIRMED,
            customerName,
            customerPhone,
            request.getNotes(),
            LocalDateTime.now()
        );

        TableBooking saved = tableBookingRepository.save(booking);
        return mapToResponse(saved);
    }

    public BookingResponse getBookingByNumber(String bookingNumber) {
        TableBooking booking = tableBookingRepository.findByBookingNumber(bookingNumber)
            .orElseThrow(() -> new NotFoundException("Booking not found: " + bookingNumber));
        return mapToResponse(booking);
    }

    public List<BookingResponse> getBookingsByEmail(String email) {
        if (email == null || email.isBlank()) {
            return List.of();
        }
        return tableBookingRepository.findByEmailOrderByBookingTimeDesc(email.trim())
            .stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());
    }

    private BookingResponse mapToResponse(TableBooking b) {
        LocalDate date = b.getBookingTime() != null ? b.getBookingTime().toLocalDate() : null;
        LocalTime time = b.getBookingTime() != null ? b.getBookingTime().toLocalTime() : null;

        return new BookingResponse(
            b.getId(),
            b.getBookingNumber(),
            b.getTableNumber(),
            b.getGuestsCount(),
            date,
            time,
            b.getBookingTime(),
            b.getStatus(),
            b.getCustomerName(),
            b.getCustomerPhone(),
            b.getEmail(),
            b.getNotes(),
            b.getCreatedAt()
        );
    }
}
