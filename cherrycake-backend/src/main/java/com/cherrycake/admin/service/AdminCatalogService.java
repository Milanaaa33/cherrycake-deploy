package com.cherrycake.admin.service;

import com.cherrycake.admin.dto.AdminDtos.AdminCategoryResponse;
import com.cherrycake.admin.dto.AdminDtos.AdminProductResponse;
import com.cherrycake.admin.dto.AdminDtos.AdminRegionResponse;
import com.cherrycake.admin.dto.AdminDtos.AvailabilityRequest;
import com.cherrycake.admin.dto.AdminDtos.CategoryRequest;
import com.cherrycake.admin.dto.AdminDtos.PriceRequest;
import com.cherrycake.admin.dto.AdminDtos.ProductRequest;
import com.cherrycake.admin.dto.AdminDtos.RegionRequest;
import com.cherrycake.admin.dto.AdminDtos.RegionalPriceView;
import com.cherrycake.admin.dto.AdminDtos.UserRoleRequest;
import com.cherrycake.admin.dto.AdminDtos.UserRoleResponse;
import com.cherrycake.auth.model.Role;
import com.cherrycake.auth.service.AuthService;
import com.cherrycake.common.exception.BadRequestException;
import com.cherrycake.common.exception.ConflictException;
import com.cherrycake.common.exception.NotFoundException;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Admin panel: catalog, regional prices and availability, region rates, and user roles.
 *
 * <p>Uses JdbcTemplate like {@link AuthService} and the booking service: the JPA entities of the catalog are
 * read-only on purpose (the public API never writes), and this keeps it that way.
 * Prices are stored in conventional units (CU); see V1__catalog.sql.
 */
@Service
@Transactional
public class AdminCatalogService {

    private static final String REGION_SELECT =
            "SELECT id, code, name, currency_code, currency_symbol, vat_rate, exchange_rate FROM regions";

    private final JdbcTemplate jdbc;
    private final AuthService authService;

    public AdminCatalogService(JdbcTemplate jdbc, AuthService authService) {
        this.jdbc = jdbc;
        this.authService = authService;
    }

    // ---------------------------------------------------------------- categories

    @Transactional(readOnly = true)
    public List<AdminCategoryResponse> getCategories() {
        return jdbc.query(
                "SELECT c.id, c.name, c.sort_order, "
                        + "(SELECT COUNT(*) FROM products p WHERE p.category_id = c.id) AS product_count "
                        + "FROM categories c ORDER BY c.sort_order, c.id",
                (rs, i) -> new AdminCategoryResponse(
                        rs.getLong("id"), rs.getString("name"), rs.getInt("sort_order"), rs.getLong("product_count")));
    }

    public AdminCategoryResponse createCategory(CategoryRequest request) {
        KeyHolder keys = new GeneratedKeyHolder();
        jdbc.update(con -> {
            var ps = con.prepareStatement(
                    "INSERT INTO categories (name, sort_order) VALUES (?, ?)", new String[] {"id"});
            ps.setString(1, request.name().trim());
            ps.setInt(2, request.sortOrder());
            return ps;
        }, keys);
        return getCategory(requireKey(keys));
    }

    public AdminCategoryResponse updateCategory(Long id, CategoryRequest request) {
        int updated = jdbc.update("UPDATE categories SET name = ?, sort_order = ? WHERE id = ?",
                request.name().trim(), request.sortOrder(), id);
        if (updated == 0) {
            throw new NotFoundException("Category " + id + " not found");
        }
        return getCategory(id);
    }

    public void deleteCategory(Long id) {
        Integer products = jdbc.queryForObject(
                "SELECT COUNT(*) FROM products WHERE category_id = ?", Integer.class, id);
        if (products != null && products > 0) {
            throw new ConflictException("Category " + id + " still has " + products + " product(s); move or delete them first");
        }
        if (jdbc.update("DELETE FROM categories WHERE id = ?", id) == 0) {
            throw new NotFoundException("Category " + id + " not found");
        }
    }

    private AdminCategoryResponse getCategory(Long id) {
        return getCategories().stream()
                .filter(c -> c.id().equals(id))
                .findFirst()
                .orElseThrow(() -> new NotFoundException("Category " + id + " not found"));
    }

    // ---------------------------------------------------------------- products

    @Transactional(readOnly = true)
    public List<AdminProductResponse> getProducts() {
        List<AdminRegionResponse> regions = getRegions();
        Map<Long, Map<Long, PriceRow>> prices = new HashMap<>();
        jdbc.query("SELECT product_id, region_id, price, in_stock FROM regional_prices", rs -> {
            prices.computeIfAbsent(rs.getLong("product_id"), k -> new HashMap<>())
                    .put(rs.getLong("region_id"), new PriceRow(rs.getBigDecimal("price"), rs.getBoolean("in_stock")));
        });
        return jdbc.query(
                "SELECT p.id, p.category_id, c.name AS category_name, p.name, p.description, p.photo_url "
                        + "FROM products p JOIN categories c ON c.id = p.category_id ORDER BY p.id",
                (rs, i) -> {
                    long productId = rs.getLong("id");
                    Map<Long, PriceRow> productPrices = prices.getOrDefault(productId, Map.of());
                    List<RegionalPriceView> views = new ArrayList<>();
                    for (AdminRegionResponse region : regions) {
                        PriceRow row = productPrices.get(region.id());
                        if (row != null) {
                            views.add(new RegionalPriceView(region.code(), region.currencyCode(), row.price(),
                                    toLocal(row.price(), region.exchangeRate()), row.inStock()));
                        }
                    }
                    return new AdminProductResponse(productId, rs.getLong("category_id"), rs.getString("category_name"),
                            rs.getString("name"), rs.getString("description"), rs.getString("photo_url"), views);
                });
    }

    @Transactional(readOnly = true)
    public AdminProductResponse getProduct(Long id) {
        return getProducts().stream()
                .filter(p -> p.id().equals(id))
                .findFirst()
                .orElseThrow(() -> new NotFoundException("Product " + id + " not found"));
    }

    /**
     * Creates the product and a price row in every region (same CU price, in stock), so the product
     * is immediately visible in all 17 countries. Per-region prices can then be changed one by one.
     */
    public AdminProductResponse createProduct(ProductRequest request) {
        requireCategory(request.categoryId());
        BigDecimal price = request.price() == null ? BigDecimal.ZERO : request.price();
        KeyHolder keys = new GeneratedKeyHolder();
        jdbc.update(con -> {
            var ps = con.prepareStatement(
                    "INSERT INTO products (category_id, name, description, photo_url) VALUES (?, ?, ?, ?)",
                    new String[] {"id"});
            ps.setLong(1, request.categoryId());
            ps.setString(2, request.name().trim());
            ps.setString(3, blankToNull(request.description()));
            ps.setString(4, blankToNull(request.photoUrl()));
            return ps;
        }, keys);
        Long productId = requireKey(keys);
        jdbc.update("INSERT INTO regional_prices (product_id, region_id, price, in_stock) "
                + "SELECT ?, r.id, ?, TRUE FROM regions r", productId, price);
        return getProduct(productId);
    }

    public AdminProductResponse updateProduct(Long id, ProductRequest request) {
        requireCategory(request.categoryId());
        int updated = jdbc.update(
                "UPDATE products SET category_id = ?, name = ?, description = ?, photo_url = ? WHERE id = ?",
                request.categoryId(), request.name().trim(), blankToNull(request.description()),
                blankToNull(request.photoUrl()), id);
        if (updated == 0) {
            throw new NotFoundException("Product " + id + " not found");
        }
        return getProduct(id);
    }

    /**
     * Deleting a product that was ever ordered would break order history, so such a product is only
     * hidden (out of stock everywhere). A never-ordered product is removed together with its prices
     * and modifiers (ON DELETE CASCADE).
     *
     * @return true when the product was deleted, false when it was hidden instead
     */
    public boolean deleteProduct(Long id) {
        Integer ordered = jdbc.queryForObject(
                "SELECT COUNT(*) FROM order_items WHERE product_id = ?", Integer.class, id);
        if (ordered != null && ordered > 0) {
            int hidden = jdbc.update("UPDATE regional_prices SET in_stock = FALSE WHERE product_id = ?", id);
            if (hidden == 0 && !productExists(id)) {
                throw new NotFoundException("Product " + id + " not found");
            }
            return false;
        }
        if (jdbc.update("DELETE FROM products WHERE id = ?", id) == 0) {
            throw new NotFoundException("Product " + id + " not found");
        }
        return true;
    }

    // ---------------------------------------------------------------- prices and availability

    public AdminProductResponse updatePrice(Long productId, String regionCode, PriceRequest request) {
        Long regionId = requireRegionId(regionCode);
        if (!productExists(productId)) {
            throw new NotFoundException("Product " + productId + " not found");
        }
        int updated = jdbc.update(
                "UPDATE regional_prices SET price = ?, in_stock = ? WHERE product_id = ? AND region_id = ?",
                request.price(), request.inStock(), productId, regionId);
        if (updated == 0) {
            jdbc.update("INSERT INTO regional_prices (product_id, region_id, price, in_stock) VALUES (?, ?, ?, ?)",
                    productId, regionId, request.price(), request.inStock());
        }
        return getProduct(productId);
    }

    public AdminProductResponse updateAvailability(Long productId, String regionCode, AvailabilityRequest request) {
        Long regionId = requireRegionId(regionCode);
        int updated = jdbc.update(
                "UPDATE regional_prices SET in_stock = ? WHERE product_id = ? AND region_id = ?",
                request.inStock(), productId, regionId);
        if (updated == 0) {
            throw new NotFoundException("Product " + productId + " has no price in region " + regionCode);
        }
        return getProduct(productId);
    }

    // ---------------------------------------------------------------- regions

    @Transactional(readOnly = true)
    public List<AdminRegionResponse> getRegions() {
        return jdbc.query(REGION_SELECT + " ORDER BY id", (rs, i) -> new AdminRegionResponse(
                rs.getLong("id"), rs.getString("code"), rs.getString("name"), rs.getString("currency_code"),
                rs.getString("currency_symbol"), rs.getBigDecimal("vat_rate"), rs.getBigDecimal("exchange_rate")));
    }

    public AdminRegionResponse updateRegion(String code, RegionRequest request) {
        int updated = jdbc.update("UPDATE regions SET vat_rate = ?, exchange_rate = ? WHERE code = ?",
                request.vatRate(), request.exchangeRate(), normalizeCode(code));
        if (updated == 0) {
            throw new NotFoundException("Region " + code + " not found");
        }
        return getRegions().stream()
                .filter(r -> r.code().equals(normalizeCode(code)))
                .findFirst()
                .orElseThrow(() -> new NotFoundException("Region " + code + " not found"));
    }

    // ---------------------------------------------------------------- users and roles

    @Transactional(readOnly = true)
    public List<UserRoleResponse> getUserRoles() {
        return jdbc.query(
                "SELECT email, role, granted_by, granted_at FROM user_roles ORDER BY role, email",
                (rs, i) -> {
                    Timestamp grantedAt = rs.getTimestamp("granted_at");
                    return new UserRoleResponse(rs.getString("email"), Role.valueOf(rs.getString("role")),
                            rs.getString("granted_by"), grantedAt == null ? null : grantedAt.toLocalDateTime(),
                            authService.isBootstrapAdmin(rs.getString("email")));
                });
    }

    public UserRoleResponse setUserRole(UserRoleRequest request, String grantedBy) {
        String email = AuthService.normalize(request.email());
        if (request.role() == Role.CUSTOMER) {
            throw new BadRequestException("CUSTOMER is the default; delete the role instead of assigning it");
        }
        if (authService.isBootstrapAdmin(email) && request.role() != Role.ADMIN) {
            throw new ConflictException(email + " is a bootstrap administrator (ADMIN_EMAILS); its role cannot be lowered here");
        }
        LocalDateTime now = LocalDateTime.now();
        int updated = jdbc.update("UPDATE user_roles SET role = ?, granted_by = ?, granted_at = ? WHERE email = ?",
                request.role().name(), grantedBy, now, email);
        if (updated == 0) {
            jdbc.update("INSERT INTO user_roles (email, role, granted_by, granted_at) VALUES (?, ?, ?, ?)",
                    email, request.role().name(), grantedBy, now);
        }
        return new UserRoleResponse(email, request.role(), grantedBy, now, authService.isBootstrapAdmin(email));
    }

    public void deleteUserRole(String rawEmail, String requestedBy) {
        String email = AuthService.normalize(rawEmail);
        if (email.equals(AuthService.normalize(requestedBy))) {
            throw new ConflictException("You cannot remove your own role");
        }
        if (authService.isBootstrapAdmin(email)) {
            throw new ConflictException(email + " is a bootstrap administrator (ADMIN_EMAILS); remove it from the environment instead");
        }
        if (jdbc.update("DELETE FROM user_roles WHERE email = ?", email) == 0) {
            throw new NotFoundException("No role is assigned to " + email);
        }
    }

    // ---------------------------------------------------------------- helpers

    private void requireCategory(Long categoryId) {
        Integer count = jdbc.queryForObject("SELECT COUNT(*) FROM categories WHERE id = ?", Integer.class, categoryId);
        if (count == null || count == 0) {
            throw new NotFoundException("Category " + categoryId + " not found");
        }
    }

    private boolean productExists(Long id) {
        Integer count = jdbc.queryForObject("SELECT COUNT(*) FROM products WHERE id = ?", Integer.class, id);
        return count != null && count > 0;
    }

    private Long requireRegionId(String code) {
        List<Long> ids = jdbc.queryForList("SELECT id FROM regions WHERE code = ?", Long.class, normalizeCode(code));
        if (ids.isEmpty()) {
            throw new NotFoundException("Region " + code + " not found");
        }
        return ids.get(0);
    }

    private static String normalizeCode(String code) {
        return code == null ? "" : code.trim().toUpperCase(java.util.Locale.ROOT);
    }

    private static Long requireKey(KeyHolder keys) {
        Number key = keys.getKey();
        if (key == null) {
            throw new IllegalStateException("Database did not return the generated id");
        }
        return key.longValue();
    }

    private static String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    private static BigDecimal toLocal(BigDecimal conventionalUnits, BigDecimal exchangeRate) {
        return conventionalUnits.multiply(exchangeRate).setScale(2, RoundingMode.HALF_UP);
    }

    private record PriceRow(BigDecimal price, boolean inStock) {
    }
}
