package com.cherrycake.admin.service;

import com.cherrycake.common.exception.UnauthorizedException;
import java.util.List;
import java.util.Locale;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AdminAccessService {
    private final JdbcTemplate jdbc;
    private final String adminEmail;

    public AdminAccessService(JdbcTemplate jdbc, @Value("${app.security.admin-email:}") String adminEmail) {
        this.jdbc = jdbc;
        this.adminEmail = normalize(adminEmail);
    }

    @Transactional
    public String roleFor(String email) {
        String normalized = normalize(email);
        if (normalized.isBlank()) throw new UnauthorizedException("Sign in is required");
        if (!adminEmail.isBlank() && normalized.equals(adminEmail)) {
            Integer count = jdbc.queryForObject("SELECT COUNT(*) FROM user_roles WHERE email = ?", Integer.class, normalized);
            if (count == null || count == 0) jdbc.update("INSERT INTO user_roles(email, role) VALUES (?, 'ADMIN')", normalized);
            else jdbc.update("UPDATE user_roles SET role='ADMIN', updated_at=CURRENT_TIMESTAMP WHERE email=?", normalized);
        }
        var roles = jdbc.query("SELECT role FROM user_roles WHERE email=?",
                (rs, row) -> rs.getString(1), normalized);
        return roles.isEmpty() ? "VIEWER" : roles.get(0);
    }

    public String requireAny(String email, String... allowed) {
        String role = roleFor(email);
        for (String candidate : allowed) if (role.equals(candidate)) return role;
        throw new UnauthorizedException("Insufficient permissions");
    }

    @Transactional
    public void setRole(String actorEmail, String targetEmail, String role) {
        requireAny(actorEmail, "ADMIN");
        String email = normalize(targetEmail);
        String normalizedRole = role == null ? "" : role.trim().toUpperCase(Locale.ROOT);
        if (email.isBlank() || !List.of("ADMIN", "STAFF", "VIEWER").contains(normalizedRole))
            throw new IllegalArgumentException("Valid email and role are required");
        if (!adminEmail.isBlank() && email.equals(adminEmail) && !normalizedRole.equals("ADMIN"))
            throw new IllegalArgumentException("Configured ADMIN_EMAIL cannot be demoted");
        jdbc.update("""
            INSERT INTO user_roles(email, role, created_at, updated_at)
            VALUES (?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            ON CONFLICT (email) DO UPDATE SET role=EXCLUDED.role, updated_at=CURRENT_TIMESTAMP
            """, email, normalizedRole);
    }

    public List<RoleEntry> listRoles(String actorEmail) {
        requireAny(actorEmail, "ADMIN");
        return jdbc.query("SELECT email, role FROM user_roles ORDER BY email",
                (rs, row) -> new RoleEntry(rs.getString(1), rs.getString(2)));
    }

    private static String normalize(String email) {
        return email == null ? "" : email.trim().toLowerCase(Locale.ROOT);
    }
    public record RoleEntry(String email, String role) {}
}
