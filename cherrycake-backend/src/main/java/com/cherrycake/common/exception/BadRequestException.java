package com.cherrycake.common.exception;

import org.springframework.http.HttpStatus;

/**
 * 400: the request is well-formed but its values are not acceptable.
 */
public class BadRequestException extends ApiException {

    public BadRequestException(String message) {
        super(HttpStatus.BAD_REQUEST, message);
    }
}
