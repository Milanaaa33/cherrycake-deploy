package com.cherrycake.common.dto;

import java.time.Instant;
import java.util.List;

/**
 * Single error format for every failed API call.
 */
public record ErrorResponse(
        int status,
        String message,
        List<FieldError> errors,
        Instant timestamp,
        String path) {

    public record FieldError(String field, String message) {
    }

    public static ErrorResponse of(int status, String message, List<FieldError> errors, String path) {
        return new ErrorResponse(status, message, errors, Instant.now(), path);
    }
}
