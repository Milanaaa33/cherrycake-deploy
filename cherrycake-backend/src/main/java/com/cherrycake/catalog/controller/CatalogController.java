package com.cherrycake.catalog.controller;

import com.cherrycake.catalog.dto.CategoryResponse;
import com.cherrycake.catalog.dto.ProductResponse;
import com.cherrycake.catalog.dto.RegionResponse;
import com.cherrycake.catalog.service.CatalogService;
import com.cherrycake.common.dto.ErrorResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
@Tag(name = "Catalog", description = "Regions, categories and products with prices in the region's currency")
public class CatalogController {

    private final CatalogService catalogService;

    public CatalogController(CatalogService catalogService) {
        this.catalogService = catalogService;
    }

    @GetMapping("/regions")
    @Operation(summary = "Regions with currency and VAT rate")
    public List<RegionResponse> getRegions() {
        return catalogService.getRegions();
    }

    @GetMapping("/categories")
    @Operation(summary = "Categories for the menu tabs")
    public List<CategoryResponse> getCategories() {
        return catalogService.getCategories();
    }

    @GetMapping("/products")
    @Operation(summary = "Product cards for a region, optionally filtered by category")
    @ApiResponse(responseCode = "200", description = "Product cards without modifier groups")
    @ApiResponse(responseCode = "400", description = "Region is missing",
            content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    @ApiResponse(responseCode = "404", description = "Unknown region",
            content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    public List<ProductResponse> getProducts(
            @Parameter(example = "UZB") @RequestParam String region,
            @RequestParam(required = false) Long categoryId) {
        return catalogService.getProducts(region, categoryId);
    }

    @GetMapping("/products/{id}")
    @Operation(summary = "Product card with modifier groups and prices for a region")
    @ApiResponse(responseCode = "200", description = "Product card with modifier groups")
    @ApiResponse(responseCode = "400", description = "Region is missing",
            content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    @ApiResponse(responseCode = "404", description = "Unknown region or product",
            content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    public ProductResponse getProduct(
            @PathVariable Long id,
            @Parameter(example = "UZB") @RequestParam String region) {
        return catalogService.getProduct(id, region);
    }
}
