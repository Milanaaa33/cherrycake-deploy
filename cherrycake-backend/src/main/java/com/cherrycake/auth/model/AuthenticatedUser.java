package com.cherrycake.auth.model;

/**
 * Who sent the request: the email of the session and its resolved role.
 */
public record AuthenticatedUser(String email, Role role) {
}
