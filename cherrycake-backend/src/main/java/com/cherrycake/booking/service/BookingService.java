package com.cherrycake.booking.service;

import com.cherrycake.booking.dto.BookingResponse;
import com.cherrycake.booking.dto.CreateBookingRequest;
import com.cherrycake.common.exception.BadRequestException;
import com.cherrycake.common.exception.ConflictException;
import com.cherrycake.common.exception.NotFoundException;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Locale;
import java.util.UUID;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class BookingService {
    private final JdbcTemplate jdbc;

    public BookingService(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    @Transactional
    public BookingResponse create(CreateBookingRequest request) {
        if (request.date().isBefore(LocalDate.now())) {
            throw new BadRequestException("Booking date must not be in the past");
        }

        // Lock the slot row so simultaneous requests cannot reserve the same final table.
        List<Long> slotIds = jdbc.query(
                "SELECT id FROM time_slots WHERE id = ? AND is_available = TRUE FOR UPDATE",
                (rs, row) -> rs.getLong(1), request.timeSlotId());
        if (slotIds.isEmpty()) {
            throw new NotFoundException("Time slot not found");
        }

        String sql = "SELECT dt.id, dt.table_number, pp.id AS pickup_point_id, ts.start_time, ts.end_time "
                + "FROM dining_tables dt JOIN pickup_points pp ON pp.id = dt.pickup_point_id "
                + "JOIN regions r ON r.id = pp.region_id CROSS JOIN time_slots ts "
                + "WHERE r.code = ? AND pp.is_available = TRUE AND dt.is_available = TRUE "
                + "AND dt.seats >= ? AND ts.id = ? "
                + "AND NOT EXISTS (SELECT 1 FROM bookings b "
                + "WHERE b.dining_table_id = dt.id AND b.booking_date = ? AND b.time_slot_id = ?) "
                + "ORDER BY dt.seats, dt.id LIMIT 1";
        List<TableChoice> choices;
        if (request.region() == null || request.region().isBlank()) {
            sql = sql.replace("WHERE r.code = ? AND ", "WHERE ");
            choices = jdbc.query(sql,
                    (rs, row) -> new TableChoice(rs.getLong("id"), rs.getInt("table_number"),
                            rs.getLong("pickup_point_id"), rs.getTime("start_time").toLocalTime(),
                            rs.getTime("end_time").toLocalTime()),
                    request.guestsCount(), request.timeSlotId(), request.date(), request.timeSlotId());
        } else {
            choices = jdbc.query(sql,
                    (rs, row) -> new TableChoice(rs.getLong("id"), rs.getInt("table_number"),
                            rs.getLong("pickup_point_id"), rs.getTime("start_time").toLocalTime(),
                            rs.getTime("end_time").toLocalTime()),
                    request.region(), request.guestsCount(), request.timeSlotId(), request.date(), request.timeSlotId());
        }

        if (choices.isEmpty()) {
            throw new ConflictException("No table is available for this date, time and number of guests");
        }

        TableChoice table = choices.get(0);
        String bookingNumber = "CCB-" + UUID.randomUUID().toString().toUpperCase(Locale.ROOT);
        CreateBookingRequest.Customer customer = request.customer();
        jdbc.update("INSERT INTO bookings (booking_number, pickup_point_id, dining_table_id, booking_date, "
                        + "time_slot_id, guests_count, customer_name, phone, email) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                bookingNumber, table.pickupPointId(), table.id(), request.date(), request.timeSlotId(),
                request.guestsCount(), customer.name().trim(), customer.phone().trim(),
                customer.email().trim().toLowerCase(Locale.ROOT));

        return new BookingResponse(bookingNumber, table.tableNumber(), request.date(),
                table.startTime().toString(), request.guestsCount());
    }

    private record TableChoice(long id, int tableNumber, long pickupPointId,
                               LocalTime startTime, LocalTime endTime) {}
}
