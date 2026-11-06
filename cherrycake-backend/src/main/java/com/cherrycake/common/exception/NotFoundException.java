package com.cherrycake.common.exception;

import org.springframework.http.HttpStatus;

/**
 * 404: an unknown region, product, modifier and so on.
 */
public class NotFoundException extends ApiException {

    public NotFoundException(String message) {
        super(HttpStatus.NOT_FOUND, message);
    }
}
