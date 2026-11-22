package com.cherrycake.admin.controller;

import com.cherrycake.admin.service.AdminAccessService;
import com.cherrycake.auth.service.AuthService;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/admin")
public class AdminController {
    private final AuthService auth;
    private final AdminAccessService access;
    private final JdbcTemplate jdbc;

    public AdminController(AuthService auth, AdminAccessService access, JdbcTemplate jdbc) {
        this.auth = auth;
        this.access = access;
        this.jdbc = jdbc;
    }

    private String email(String header) { return auth.requireEmail(header); }

    @GetMapping("/me")
    public Map<String, String> me(@RequestHeader(value = "Authorization", required = false) String header) {
        String email = email(header);
        return Map.of("email", email, "role", access.roleFor(email));
    }

    @GetMapping("/products")
    public List<Map<String, Object>> products(@RequestHeader(value = "Authorization", required = false) String header) {
        access.requireAny(email(header), "ADMIN", "STAFF", "VIEWER");
        return jdbc.queryForList("""
            SELECT p.id, p.category_id, p.name, p.description, p.photo_url,
                   r.code AS region_code, rp.price, rp.in_stock
            FROM products p
            LEFT JOIN regional_prices rp ON rp.product_id = p.id
            LEFT JOIN regions r ON r.id = rp.region_id
            ORDER BY p.id, r.code
            """);
    }

    @PutMapping("/products/{id}")
    public Map<String, Object> updateProduct(@PathVariable long id,
            @RequestHeader(value = "Authorization", required = false) String header,
            @RequestBody ProductUpdate body) {
        access.requireAny(email(header), "ADMIN");
        if (body.name() == null || body.name().isBlank())
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Product name is required");
        int count = jdbc.update("UPDATE products SET name=?, description=?, photo_url=? WHERE id=?",
                body.name().trim(), body.description(), body.photoUrl(), id);
        if (count == 0) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found");
        return Map.of("id", id, "updated", true);
    }

    @PutMapping("/products/{id}/prices/{regionCode}")
    public Map<String, Object> updatePrice(@PathVariable long id, @PathVariable String regionCode,
            @RequestHeader(value = "Authorization", required = false) String header,
            @RequestBody PriceUpdate body) {
        String role = access.roleFor(email(header));
        if (!role.equals("ADMIN") && !role.equals("STAFF"))
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Insufficient role");
        if (body.price() != null && (!role.equals("ADMIN") || body.price().signum() < 0))
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only ADMIN may change non-negative prices");
        if (body.price() == null && body.inStock() == null)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Nothing to update");
        Integer regionId = jdbc.query("SELECT id FROM regions WHERE code = ?",
                rs -> rs.next() ? rs.getInt(1) : null, regionCode.toUpperCase());
        if (regionId == null) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Region not found");
        if (body.price() != null) jdbc.update(
                "UPDATE regional_prices SET price=? WHERE product_id=? AND region_id=?", body.price(), id, regionId);
        if (body.inStock() != null) jdbc.update(
                "UPDATE regional_prices SET in_stock=? WHERE product_id=? AND region_id=?", body.inStock(), id, regionId);
        return Map.of("id", id, "region", regionCode, "updated", true);
    }

    @GetMapping("/roles")
    public List<AdminAccessService.RoleEntry> roles(
            @RequestHeader(value = "Authorization", required = false) String header) {
        return access.listRoles(email(header));
    }

    @PutMapping("/roles")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void setRole(@RequestHeader(value = "Authorization", required = false) String header,
                        @RequestBody RoleUpdate body) {
        access.setRole(email(header), body.email(), body.role());
    }

    public record ProductUpdate(String name, String description, String photoUrl) {}
    public record PriceUpdate(BigDecimal price, Boolean inStock) {}
    public record RoleUpdate(String email, String role) {}
}
