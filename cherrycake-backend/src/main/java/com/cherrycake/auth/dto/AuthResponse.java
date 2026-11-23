package com.cherrycake.auth.dto;

import com.cherrycake.auth.model.Role;
import java.time.LocalDateTime;

/**
 * Result of a successful sign-in: the frontend keeps the token and sends it as "Authorization: Bearer &lt;token&gt;".
 * The role tells the frontend which sections to show (admin panel for ADMIN/STAFF/VIEWER).
 */
public record AuthResponse(String token, String email, LocalDateTime expiresAt, Role role) {
}
