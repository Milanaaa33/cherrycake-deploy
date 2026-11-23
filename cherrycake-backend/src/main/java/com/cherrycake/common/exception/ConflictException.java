package com.cherrycake.common.exception;

import org.springframework.http.HttpStatus;

/**
 * 409: the request conflicts with current data, for example a product is out of stock.
 */
public class ConflictException extends ApiException {

    public ConflictException(String message) {
        super(HttpStatus.CONFLICT, message);
    }
}
