package com.cherrycake.common.exception;

import org.springframework.http.HttpStatus;

/**
 * Base class for business errors that map to a fixed HTTP status.
 */
public abstract class ApiException extends RuntimeException {

    private final HttpStatus status;

    protected ApiException(HttpStatus status, String message) {
        super(message);
        this.status = status;
    }

    public HttpStatus getStatus() {
        return status;
    }
}
