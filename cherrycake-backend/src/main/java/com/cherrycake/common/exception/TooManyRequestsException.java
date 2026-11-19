package com.cherrycake.common.exception;

import org.springframework.http.HttpStatus;

/**
 * 429: too many sign-in codes requested in a short time.
 */
public class TooManyRequestsException extends ApiException {

    public TooManyRequestsException(String message) {
        super(HttpStatus.TOO_MANY_REQUESTS, message);
    }
}
