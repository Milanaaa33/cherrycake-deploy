package com.cherrycake.auth.service;

import com.cherrycake.auth.dto.AuthResponse;
import com.cherrycake.auth.model.AuthenticatedUser;
import com.cherrycake.auth.model.Role;
import com.cherrycake.common.exception.BadRequestException;
import com.cherrycake.common.exception.ForbiddenException;
import com.cherrycake.common.exception.TooManyRequestsException;
import com.cherrycake.common.exception.UnauthorizedException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Base64;
import java.util.HexFormat;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Passwordless sign-in: a 6-digit code is sent to the email, and a correct code gives a session token.
 * Codes and tokens are stored only as SHA-256 hashes.
 *
 * <p>Roles (RBAC): every signed-in email is a CUSTOMER unless the user_roles table (or the ADMIN_EMAILS
 * environment variable, which bootstraps the first administrator) says ADMIN, STAFF or VIEWER.
 */
@Service
public class AuthService {

    private static final Duration CODE_TTL = Duration.ofMinutes(10);
    private static final Duration RESEND_DELAY = Duration.ofSeconds(60);
    private static final Duration CODE_HISTORY = Duration.ofHours(1);
    private static final Duration SESSION_TTL = Duration.ofDays(30);
    private static final int MAX_CODES_PER_HOUR = 5;
    private static final int MAX_ATTEMPTS = 5;
    private static final String INVALID_CODE = "Invalid or expired code";

    private final JdbcTemplate jdbc;
    private final LoginCodeSender codeSender;
    private final Set<String> bootstrapAdmins;
    private final SecureRandom random = new SecureRandom();

    public AuthService(
            JdbcTemplate jdbc,
            LoginCodeSender codeSender,
            @Value("${app.auth.admin-emails:}") String adminEmails) {
        this.jdbc = jdbc;
        this.codeSender = codeSender;
        this.bootstrapAdmins = Arrays.stream(adminEmails == null ? new String[0] : adminEmails.split(","))
                .map(AuthService::normalizeEmail)
                .filter(email -> !email.isEmpty())
                .collect(Collectors.toUnmodifiableSet());
    }

    @Transactional
    public void requestCode(String rawEmail) {
        String email = normalizeEmail(rawEmail);
        LocalDateTime now = LocalDateTime.now();

        jdbc.update("DELETE FROM auth_codes WHERE created_at < ?", now.minus(CODE_HISTORY));

        Integer recent = jdbc.queryForObject(
                "SELECT COUNT(*) FROM auth_codes WHERE email = ? AND created_at > ?",
                Integer.class, email, now.minus(RESEND_DELAY));
        if (recent != null && recent > 0) {
            throw new TooManyRequestsException("Please wait a minute before requesting another code");
        }
        Integer lastHour = jdbc.queryForObject(
                "SELECT COUNT(*) FROM auth_codes WHERE email = ?", Integer.class, email);
        if (lastHour != null && lastHour >= MAX_CODES_PER_HOUR) {
            throw new TooManyRequestsException("Too many codes requested. Please try again later");
        }

        String code = String.format(Locale.ROOT, "%06d", random.nextInt(1_000_000));
        jdbc.update("INSERT INTO auth_codes (email, code_hash, expires_at, attempts, created_at) VALUES (?, ?, ?, 0, ?)",
                email, hash(email + ":" + code), now.plus(CODE_TTL), now);
        codeSender.send(email, code);
    }

    // A wrong guess must stay counted, so a BadRequestException does not roll the attempt back.
    @Transactional(noRollbackFor = BadRequestException.class)
    public AuthResponse verifyCode(String rawEmail, String rawCode) {
        String email = normalizeEmail(rawEmail);
        String code = rawCode == null ? "" : rawCode.trim();
        LocalDateTime now = LocalDateTime.now();

        List<StoredCode> rows = jdbc.query(
                "SELECT id, code_hash, expires_at, attempts FROM auth_codes "
                        + "WHERE email = ? ORDER BY created_at DESC, id DESC LIMIT 1",
                (rs, i) -> new StoredCode(rs.getLong("id"), rs.getString("code_hash"),
                        rs.getTimestamp("expires_at").toLocalDateTime(), rs.getInt("attempts")),
                email);
        if (rows.isEmpty()) {
            throw new BadRequestException(INVALID_CODE);
        }
        StoredCode stored = rows.get(0);
        if (stored.expiresAt().isBefore(now) || stored.attempts() >= MAX_ATTEMPTS) {
            throw new BadRequestException(INVALID_CODE);
        }

        boolean matches = MessageDigest.isEqual(
                hash(email + ":" + code).getBytes(StandardCharsets.UTF_8),
                stored.codeHash().getBytes(StandardCharsets.UTF_8));
        if (!matches) {
            jdbc.update("UPDATE auth_codes SET attempts = attempts + 1 WHERE id = ?", stored.id());
            throw new BadRequestException(INVALID_CODE);
        }

        jdbc.update("DELETE FROM auth_codes WHERE email = ?", email);

        byte[] raw = new byte[32];
        random.nextBytes(raw);
        String token = Base64.getUrlEncoder().withoutPadding().encodeToString(raw);
        LocalDateTime expiresAt = now.plus(SESSION_TTL);
        jdbc.update("INSERT INTO auth_sessions (token_hash, email, expires_at, created_at) VALUES (?, ?, ?, ?)",
                hash(token), email, expiresAt, now);
        return new AuthResponse(token, email, expiresAt, resolveRole(email));
    }

    /**
     * Email of the signed-in customer for an "Authorization: Bearer" header value.
     */
    @Transactional(readOnly = true)
    public String requireEmail(String authorizationHeader) {
        String token = extractToken(authorizationHeader);
        List<String> emails = token.isEmpty() ? List.of() : jdbc.queryForList(
                "SELECT email FROM auth_sessions WHERE token_hash = ? AND expires_at > ?",
                String.class, hash(token), LocalDateTime.now());
        if (emails.isEmpty()) {
            throw new UnauthorizedException("Session expired. Please sign in again");
        }
        return emails.get(0);
    }

    /**
     * The signed-in user with the resolved role, for an "Authorization: Bearer" header value.
     */
    @Transactional(readOnly = true)
    public AuthenticatedUser requireUser(String authorizationHeader) {
        String email = requireEmail(authorizationHeader);
        return new AuthenticatedUser(email, resolveRole(email));
    }

    /**
     * Same as {@link #requireUser(String)}, but also checks that the role is at least the given one:
     * ADMIN passes every check, STAFF passes STAFF and VIEWER checks, VIEWER passes only VIEWER checks.
     *
     * @throws UnauthorizedException when there is no valid session (401)
     * @throws ForbiddenException when the session's role is too low (403)
     */
    @Transactional(readOnly = true)
    public AuthenticatedUser requireRole(String authorizationHeader, Role minimum) {
        AuthenticatedUser user = requireUser(authorizationHeader);
        if (!user.role().atLeast(minimum)) {
            throw new ForbiddenException("This action requires the " + minimum + " role");
        }
        return user;
    }

    /**
     * Role of an email: ADMIN for bootstrap administrators (ADMIN_EMAILS), otherwise the user_roles row,
     * otherwise CUSTOMER.
     */
    @Transactional(readOnly = true)
    public Role resolveRole(String rawEmail) {
        String email = normalizeEmail(rawEmail);
        if (bootstrapAdmins.contains(email)) {
            return Role.ADMIN;
        }
        List<String> roles = jdbc.queryForList("SELECT role FROM user_roles WHERE email = ?", String.class, email);
        if (roles.isEmpty()) {
            return Role.CUSTOMER;
        }
        try {
            return Role.valueOf(roles.get(0));
        } catch (IllegalArgumentException ex) {
            return Role.CUSTOMER;
        }
    }

    public boolean isBootstrapAdmin(String rawEmail) {
        return bootstrapAdmins.contains(normalizeEmail(rawEmail));
    }

    public static String normalize(String email) {
        return normalizeEmail(email);
    }

    @Transactional
    public void logout(String authorizationHeader) {
        String token = extractToken(authorizationHeader);
        if (!token.isEmpty()) {
            jdbc.update("DELETE FROM auth_sessions WHERE token_hash = ?", hash(token));
        }
    }

    private static String extractToken(String header) {
        if (header == null) {
            return "";
        }
        String value = header.trim();
        if (value.regionMatches(true, 0, "Bearer ", 0, 7)) {
            value = value.substring(7).trim();
        }
        return value;
    }

    private static String normalizeEmail(String email) {
        return email == null ? "" : email.trim().toLowerCase(Locale.ROOT);
    }

    private static String hash(String value) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(digest.digest(value.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException ex) {
            throw new IllegalStateException("SHA-256 is not available", ex);
        }
    }

    private record StoredCode(long id, String codeHash, LocalDateTime expiresAt, int attempts) {
    }
}
