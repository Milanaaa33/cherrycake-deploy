package com.cherrycake.admin.dto;

import com.cherrycake.auth.model.Role;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Request and response records of the admin panel (catalog, prices, availability, regions, roles).
 * Prices are in conventional units (CU), exactly as stored; the response also shows the local-currency
 * price so the administrator sees what the customer sees.
 */
public final class AdminDtos {

    private AdminDtos() {
    }

    // ---- categories ----

    public record CategoryRequest(
            @NotBlank @Size(max = 100) String name,
            @NotNull Integer sortOrder) {
    }

    public record AdminCategoryResponse(Long id, String name, Integer sortOrder, long productCount) {
    }

    // ---- products ----

    public record ProductRequest(
            @NotNull Long categoryId,
            @NotBlank @Size(max = 150) String name,
            @Size(max = 1000) String description,
            @Size(max = 500) String photoUrl,
            /** CU price used for every region when a product is created (ignored on update). */
            @DecimalMin("0.00") @Digits(integer = 10, fraction = 2) BigDecimal price) {
    }

    public record RegionalPriceView(
            String regionCode,
            String currencyCode,
            BigDecimal price,
            BigDecimal localPrice,
            boolean inStock) {
    }

    public record AdminProductResponse(
            Long id,
            Long categoryId,
            String categoryName,
            String name,
            String description,
            String photoUrl,
            List<RegionalPriceView> prices) {
    }

    public record PriceRequest(
            @NotNull @DecimalMin("0.00") @Digits(integer = 10, fraction = 2) BigDecimal price,
            @NotNull Boolean inStock) {
    }

    public record AvailabilityRequest(@NotNull Boolean inStock) {
    }

    // ---- regions ----

    public record AdminRegionResponse(
            Long id,
            String code,
            String name,
            String currencyCode,
            String currencySymbol,
            BigDecimal vatRate,
            BigDecimal exchangeRate) {
    }

    public record RegionRequest(
            /** Fraction: 0.15 means 15 %. */
            @NotNull @DecimalMin("0.0000") @DecimalMax("0.9999") @Digits(integer = 1, fraction = 4) BigDecimal vatRate,
            /** Local currency per conventional unit. */
            @NotNull @DecimalMin(value = "0.0001") @Digits(integer = 8, fraction = 4) BigDecimal exchangeRate) {
    }

    // ---- users / roles ----

    public record UserRoleResponse(String email, Role role, String grantedBy, LocalDateTime grantedAt, boolean bootstrap) {
    }

    public record UserRoleRequest(
            @NotBlank @Email @Size(max = 150) String email,
            @NotNull Role role) {
    }
}
