package com.cherrycake.common.exception;

import org.springframework.http.HttpStatus;

/**
 * 403: the user is signed in but the role does not allow this action.
 */
public class ForbiddenException extends ApiException {

    public ForbiddenException(String message) {
        super(HttpStatus.FORBIDDEN, message);
    }
}
