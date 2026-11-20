package com.cherrycake.booking.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

public class BookingCreateRequest {

    private Integer tableNumber;

    @NotNull(message = "Guests count is required")
    @Min(value = 1, message = "Guests count must be between 1 and 12")
    @Max(value = 12, message = "Guests count must be between 1 and 12")
    @JsonAlias({ "guests", "guestsCount" })
    private Integer guestsCount;

    private LocalDate date;
    private LocalTime time;
    private Long timeSlotId;
    private LocalDateTime bookingTime;
    private String customerName;
    private String customerPhone;
    private String email;
    private String notes;
    private CustomerDto customer;

    public static class CustomerDto {
        private String name;
        private String phone;
        private String email;

        public CustomerDto() {
        }

        public CustomerDto(String name, String phone, String email) {
            this.name = name;
            this.phone = phone;
            this.email = email;
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String getPhone() {
            return phone;
        }

        public void setPhone(String phone) {
            this.phone = phone;
        }

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }
    }

    public BookingCreateRequest() {
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

    public Integer getGuests() {
        return guestsCount;
    }

    public void setGuests(Integer g) {
        this.guestsCount = g;
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

    public Long getTimeSlotId() {
        return timeSlotId;
    }

    public void setTimeSlotId(Long timeSlotId) {
        this.timeSlotId = timeSlotId;
    }

    public LocalDateTime getBookingTime() {
        return bookingTime;
    }

    public void setBookingTime(LocalDateTime bookingTime) {
        this.bookingTime = bookingTime;
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

    public CustomerDto getCustomer() {
        return customer;
    }

    public void setCustomer(CustomerDto customer) {
        this.customer = customer;
    }

    public String resolveCustomerName() {
        if (customer != null && customer.getName() != null && !customer.getName().isBlank()) {
            return customer.getName().trim();
        }
        return customerName != null ? customerName.trim() : null;
    }

    public String resolveCustomerPhone() {
        if (customer != null && customer.getPhone() != null && !customer.getPhone().isBlank()) {
            return customer.getPhone().trim();
        }
        return customerPhone != null ? customerPhone.trim() : null;
    }

    public String resolveCustomerEmail() {
        if (customer != null && customer.getEmail() != null && !customer.getEmail().isBlank()) {
            return customer.getEmail().trim();
        }
        return email != null ? email.trim() : null;
    }
}
