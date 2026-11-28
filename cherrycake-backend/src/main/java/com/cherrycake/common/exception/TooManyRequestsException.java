package com.cherrycake.common.exception;

import org.springframework.http.HttpStatus;
import org.springframework.lang.Nullable;

/**
 * 429: too many sign-in codes requested in a short time.
 */
public class TooManyRequestsException extends ApiException {

    @Nullable
    private final Long retryAfterSeconds;

    public TooManyRequestsException(String message) {
        this(message, null);
    }

    public TooManyRequestsException(String message, long retryAfterSeconds) {
        this(message, Long.valueOf(retryAfterSeconds));
    }

    private TooManyRequestsException(String message, @Nullable Long retryAfterSeconds) {
        super(HttpStatus.TOO_MANY_REQUESTS, message);
        this.retryAfterSeconds = retryAfterSeconds;
    }

    @Nullable
    public Long getRetryAfterSeconds() {
        return retryAfterSeconds;
    }
}
