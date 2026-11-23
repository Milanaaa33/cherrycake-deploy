package com.cherrycake.admin.controller;

import com.cherrycake.admin.dto.AdminDtos.AdminCategoryResponse;
import com.cherrycake.admin.dto.AdminDtos.AdminProductResponse;
import com.cherrycake.admin.dto.AdminDtos.AdminRegionResponse;
import com.cherrycake.admin.dto.AdminDtos.AvailabilityRequest;
import com.cherrycake.admin.dto.AdminDtos.CategoryRequest;
import com.cherrycake.admin.dto.AdminDtos.PriceRequest;
import com.cherrycake.admin.dto.AdminDtos.ProductRequest;
import com.cherrycake.admin.dto.AdminDtos.RegionRequest;
import com.cherrycake.admin.dto.AdminDtos.UserRoleRequest;
import com.cherrycake.admin.dto.AdminDtos.UserRoleResponse;
import com.cherrycake.admin.service.AdminCatalogService;
import com.cherrycake.auth.model.AuthenticatedUser;
import com.cherrycake.auth.model.Role;
import com.cherrycake.auth.service.AuthService;
import com.cherrycake.common.dto.ErrorResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

/**
 * Admin panel API. Access is role-based (RBAC):
 * <ul>
 *   <li>VIEWER: read everything here (catalog, prices, regions, roles);</li>
 *   <li>STAFF: also change prices and availability per region;</li>
 *   <li>ADMIN: also create, edit and delete categories and products, change region rates and manage roles.</li>
 * </ul>
 * Every request needs "Authorization: Bearer &lt;token&gt;" from /api/auth/verify-code.
 */
@RestController
@RequestMapping("/api/admin")
@Tag(name = "Admin", description = "Catalog, prices, availability, regions and roles. VIEWER reads, STAFF edits prices and stock, ADMIN edits everything")
@ApiResponse(responseCode = "401", description = "Missing or expired session token",
        content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
@ApiResponse(responseCode = "403", description = "The role does not allow this action",
        content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
public class AdminController {

    private static final String AUTH = "Authorization";

    private final AdminCatalogService admin;
    private final AuthService auth;

    public AdminController(AdminCatalogService admin, AuthService auth) {
        this.admin = admin;
        this.auth = auth;
    }

    // ---------------------------------------------------------------- categories

    @GetMapping("/categories")
    @Operation(summary = "Categories with product counts (VIEWER)")
    public List<AdminCategoryResponse> getCategories(@RequestHeader(value = AUTH, required = false) String token) {
        auth.requireRole(token, Role.VIEWER);
        return admin.getCategories();
    }

    @PostMapping("/categories")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create a category (ADMIN)")
    public AdminCategoryResponse createCategory(
            @RequestHeader(value = AUTH, required = false) String token,
            @Valid @RequestBody CategoryRequest request) {
        auth.requireRole(token, Role.ADMIN);
        return admin.createCategory(request);
    }

    @PutMapping("/categories/{id}")
    @Operation(summary = "Rename or reorder a category (ADMIN)")
    public AdminCategoryResponse updateCategory(
            @RequestHeader(value = AUTH, required = false) String token,
            @PathVariable Long id,
            @Valid @RequestBody CategoryRequest request) {
        auth.requireRole(token, Role.ADMIN);
        return admin.updateCategory(id, request);
    }

    @DeleteMapping("/categories/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Delete an empty category (ADMIN)")
    @ApiResponse(responseCode = "409", description = "The category still has products",
            content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    public void deleteCategory(@RequestHeader(value = AUTH, required = false) String token, @PathVariable Long id) {
        auth.requireRole(token, Role.ADMIN);
        admin.deleteCategory(id);
    }

    // ---------------------------------------------------------------- products

    @GetMapping("/products")
    @Operation(summary = "All products with their price and availability in every region (VIEWER)")
    public List<AdminProductResponse> getProducts(@RequestHeader(value = AUTH, required = false) String token) {
        auth.requireRole(token, Role.VIEWER);
        return admin.getProducts();
    }

    @PostMapping("/products")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create a product; it gets the same CU price in every region (ADMIN)")
    public AdminProductResponse createProduct(
            @RequestHeader(value = AUTH, required = false) String token,
            @Valid @RequestBody ProductRequest request) {
        auth.requireRole(token, Role.ADMIN);
        return admin.createProduct(request);
    }

    @PutMapping("/products/{id}")
    @Operation(summary = "Edit a product's category, name, description and photo (ADMIN)")
    public AdminProductResponse updateProduct(
            @RequestHeader(value = AUTH, required = false) String token,
            @PathVariable Long id,
            @Valid @RequestBody ProductRequest request) {
        auth.requireRole(token, Role.ADMIN);
        return admin.updateProduct(id, request);
    }

    @DeleteMapping("/products/{id}")
    @Operation(summary = "Delete a product; a product that was ever ordered is hidden instead (ADMIN)")
    @ApiResponse(responseCode = "200", description = "deleted=true when removed, false when only hidden")
    public Map<String, Boolean> deleteProduct(
            @RequestHeader(value = AUTH, required = false) String token, @PathVariable Long id) {
        auth.requireRole(token, Role.ADMIN);
        return Map.of("deleted", admin.deleteProduct(id));
    }

    // ---------------------------------------------------------------- prices and availability

    @PutMapping("/products/{id}/prices/{regionCode}")
    @Operation(summary = "Set the CU price and availability of a product in one region (STAFF)")
    public AdminProductResponse updatePrice(
            @RequestHeader(value = AUTH, required = false) String token,
            @PathVariable Long id,
            @PathVariable String regionCode,
            @Valid @RequestBody PriceRequest request) {
        auth.requireRole(token, Role.STAFF);
        return admin.updatePrice(id, regionCode, request);
    }

    @PatchMapping("/products/{id}/availability/{regionCode}")
    @Operation(summary = "Mark a product in or out of stock in one region (STAFF)")
    public AdminProductResponse updateAvailability(
            @RequestHeader(value = AUTH, required = false) String token,
            @PathVariable Long id,
            @PathVariable String regionCode,
            @Valid @RequestBody AvailabilityRequest request) {
        auth.requireRole(token, Role.STAFF);
        return admin.updateAvailability(id, regionCode, request);
    }

    // ---------------------------------------------------------------- regions

    @GetMapping("/regions")
    @Operation(summary = "Regions with VAT and exchange rates (VIEWER)")
    public List<AdminRegionResponse> getRegions(@RequestHeader(value = AUTH, required = false) String token) {
        auth.requireRole(token, Role.VIEWER);
        return admin.getRegions();
    }

    @PutMapping("/regions/{code}")
    @Operation(summary = "Change a region's VAT rate (fraction) and exchange rate (ADMIN)")
    public AdminRegionResponse updateRegion(
            @RequestHeader(value = AUTH, required = false) String token,
            @PathVariable String code,
            @Valid @RequestBody RegionRequest request) {
        auth.requireRole(token, Role.ADMIN);
        return admin.updateRegion(code, request);
    }

    // ---------------------------------------------------------------- users and roles

    @GetMapping("/users")
    @Operation(summary = "Emails with an assigned role (VIEWER)")
    public List<UserRoleResponse> getUserRoles(@RequestHeader(value = AUTH, required = false) String token) {
        auth.requireRole(token, Role.VIEWER);
        return admin.getUserRoles();
    }

    @PutMapping("/users")
    @Operation(summary = "Assign ADMIN, STAFF or VIEWER to an email (ADMIN)")
    public UserRoleResponse setUserRole(
            @RequestHeader(value = AUTH, required = false) String token,
            @Valid @RequestBody UserRoleRequest request) {
        AuthenticatedUser actor = auth.requireRole(token, Role.ADMIN);
        return admin.setUserRole(request, actor.email());
    }

    @DeleteMapping("/users/{email}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Remove an email's role; it becomes a plain customer again (ADMIN)")
    public void deleteUserRole(
            @RequestHeader(value = AUTH, required = false) String token, @PathVariable String email) {
        AuthenticatedUser actor = auth.requireRole(token, Role.ADMIN);
        admin.deleteUserRole(email, actor.email());
    }
}
