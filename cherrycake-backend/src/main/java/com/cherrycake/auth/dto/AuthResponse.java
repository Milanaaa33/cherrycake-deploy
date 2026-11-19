package com.cherrycake.auth.dto;

import java.time.LocalDateTime;

/**
 * Result of a successful sign-in: the frontend keeps the token and sends it as "Authorization: Bearer &lt;token&gt;".
 */
public record AuthResponse(String token, String email, LocalDateTime expiresAt) {
}
