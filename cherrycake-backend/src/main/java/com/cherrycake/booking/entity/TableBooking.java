package com.cherrycake.booking.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDateTime;

@Entity
@Table(name = "table_bookings")
public class TableBooking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "booking_number", nullable = false, unique = true, length = 50)
    private String bookingNumber;

    @Column(name = "email", length = 150)
    private String email;

    @Column(name = "table_number", nullable = false)
    private Integer tableNumber;

    @Column(name = "guests_count", nullable = false)
    private Integer guestsCount;

    @Column(name = "booking_time", nullable = false)
    private LocalDateTime bookingTime;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    private BookingStatus status = BookingStatus.CONFIRMED;

    @Column(name = "customer_name", nullable = false, length = 150)
    private String customerName;

    @Column(name = "customer_phone", nullable = false, length = 50)
    private String customerPhone;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public TableBooking() {
    }

    public TableBooking(String bookingNumber, String email, Integer tableNumber, Integer guestsCount,
                        LocalDateTime bookingTime, BookingStatus status, String customerName,
                        String customerPhone, String notes, LocalDateTime createdAt) {
        this.bookingNumber = bookingNumber;
        this.email = email;
        this.tableNumber = tableNumber;
        this.guestsCount = guestsCount;
        this.bookingTime = bookingTime;
        this.status = status != null ? status : BookingStatus.CONFIRMED;
        this.customerName = customerName;
        this.customerPhone = customerPhone;
        this.notes = notes;
        this.createdAt = createdAt != null ? createdAt : LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getBookingNumber() {
        return bookingNumber;
    }

    public void setBookingNumber(String bookingNumber) {
        this.bookingNumber = bookingNumber;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public Integer getTableNumber() {
        return tableNumber;
    }

    public void setTableNumber(Integer tableNumber) {
        this.tableNumber = tableNumber;
    }

    public Integer getGuestsCount() {
        return guestsCount;
    }

    public void setGuestsCount(Integer guestsCount) {
        this.guestsCount = guestsCount;
    }

    public LocalDateTime getBookingTime() {
        return bookingTime;
    }

    public void setBookingTime(LocalDateTime bookingTime) {
        this.bookingTime = bookingTime;
    }

    public BookingStatus getStatus() {
        return status;
    }

    public void setStatus(BookingStatus status) {
        this.status = status;
    }

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public String getCustomerPhone() {
        return customerPhone;
    }

    public void setCustomerPhone(String customerPhone) {
        this.customerPhone = customerPhone;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
