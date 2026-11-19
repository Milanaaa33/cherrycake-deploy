package com.cherrycake.common.exception;

import org.springframework.http.HttpStatus;

/**
 * 401: the session token is missing, unknown or expired.
 */
public class UnauthorizedException extends ApiException {

    public UnauthorizedException(String message) {
        super(HttpStatus.UNAUTHORIZED, message);
    }
}
