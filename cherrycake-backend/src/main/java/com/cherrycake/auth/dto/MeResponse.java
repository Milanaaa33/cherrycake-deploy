package com.cherrycake.auth.dto;

import com.cherrycake.auth.model.Role;

/**
 * The signed-in user and the role the frontend should show (admin link, read-only admin panel and so on).
 */
public record MeResponse(String email, Role role) {
}
