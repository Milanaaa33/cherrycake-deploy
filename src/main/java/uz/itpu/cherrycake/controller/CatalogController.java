package uz.itpu.cherrycake.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import uz.itpu.cherrycake.common.response.ApiResponse;
import uz.itpu.cherrycake.dto.response.*;
import uz.itpu.cherrycake.service.CatalogService;

import java.util.List;

@RestController
@RequestMapping("/api/v1/catalog")
@RequiredArgsConstructor
@Tag(name = "Catalog", description = "Endpoints for regions, categories, products, pickup points, and delivery zones")
public class CatalogController
{
    private final CatalogService catalogService;

    @GetMapping("/regions")
    @Operation(summary = "Get list of available active regions with VAT rates and currencies")
    public ResponseEntity<ApiResponse<List<RegionDto>>> getRegions()
    { return ResponseEntity.ok(ApiResponse.ok(catalogService.getAllActiveRegions())); }

    @GetMapping("/categories")
    @Operation(summary = "Get list of product categories")
    public ResponseEntity<ApiResponse<List<CategoryDto>>> getCategories()
    { return ResponseEntity.ok(ApiResponse.ok(catalogService.getAllCategories())); }

    @GetMapping("/products")
    @Operation(summary = "Get products filtered by country/region and optional category")
    public ResponseEntity<ApiResponse<List<ProductDto>>> getProducts
    (
        @RequestParam(defaultValue = "UZB") String region,
        @RequestParam(required = false) Long categoryId
    ) { return ResponseEntity.ok(ApiResponse.ok(catalogService.getProducts(region, categoryId))); }

    @GetMapping("/products/{id}")
    @Operation(summary = "Get product details with modifiers and regional price")
    public ResponseEntity<ApiResponse<ProductDto>> getProduct
    (
        @PathVariable Long id,
        @RequestParam(defaultValue = "UZB") String region
    ) { return ResponseEntity.ok(ApiResponse.ok(catalogService.getProductById(id, region))); }

    @GetMapping("/pickup-points")
    @Operation(summary = "Get pickup locations for the specified region")
    public ResponseEntity<ApiResponse<List<PickupPointDto>>> getPickupPoints(@RequestParam(defaultValue = "UZB") String region)
    { return ResponseEntity.ok(ApiResponse.ok(catalogService.getPickupPoints(region))); }

    @GetMapping("/delivery-zones")
    @Operation(summary = "Get delivery zones and rates for the specified region")
    public ResponseEntity<ApiResponse<List<DeliveryZoneDto>>> getDeliveryZones(@RequestParam(defaultValue = "UZB") String region)
    { return ResponseEntity.ok(ApiResponse.ok(catalogService.getDeliveryZones(region))); }
}