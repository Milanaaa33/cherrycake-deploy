package com.cherrycake.booking.dto;

import com.cherrycake.booking.entity.BookingStatus;
import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

public class BookingResponse {

    private Long id;
    private String bookingNumber;
    private Integer tableNumber;

    @JsonProperty("guests")
    @JsonAlias({ "guestsCount", "guests" })
    private Integer guests;

    private LocalDate date;
    private LocalTime time;
    private LocalDateTime bookingTime;
    private BookingStatus status;
    private String customerName;
    private String customerPhone;
    private String email;
    private String notes;
    private LocalDateTime createdAt;

    public BookingResponse() {
    }

    public BookingResponse(Long id, String bookingNumber, Integer tableNumber, Integer guests,
                           LocalDate date, LocalTime time, LocalDateTime bookingTime,
                           BookingStatus status, String customerName, String customerPhone,
                           String email, String notes, LocalDateTime createdAt) {
        this.id = id;
        this.bookingNumber = bookingNumber;
        this.tableNumber = tableNumber;
        this.guests = guests;
        this.date = date;
        this.time = time;
        this.bookingTime = bookingTime;
        this.status = status;
        this.customerName = customerName;
        this.customerPhone = customerPhone;
        this.email = email;
        this.notes = notes;
        this.createdAt = createdAt;
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

    public Integer getTableNumber() {
        return tableNumber;
    }

    public void setTableNumber(Integer tableNumber) {
        this.tableNumber = tableNumber;
    }

    public Integer getGuests() {
        return guests;
    }

    public void setGuests(Integer guests) {
        this.guests = guests;
    }

    @JsonProperty("guestsCount")
    public Integer getGuestsCount() {
        return guests;
    }

    public void setGuestsCount(Integer guestsCount) {
        this.guests = guestsCount;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public LocalTime getTime() {
        return time;
    }

    public void setTime(LocalTime time) {
        this.time = time;
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

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
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
