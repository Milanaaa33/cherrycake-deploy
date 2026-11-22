package com.cherrycake.common.exception;

import org.springframework.http.HttpStatus;

/**
 * 503: an external service (for example the mail server) is not reachable.
 */
public class ServiceUnavailableException extends ApiException {

    public ServiceUnavailableException(String message) {
        super(HttpStatus.SERVICE_UNAVAILABLE, message);
    }
}
