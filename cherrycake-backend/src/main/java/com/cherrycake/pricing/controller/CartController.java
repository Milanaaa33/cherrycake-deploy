package com.cherrycake.pricing.controller;

import com.cherrycake.common.dto.ErrorResponse;
import com.cherrycake.pricing.dto.CalculateCartRequest;
import com.cherrycake.pricing.dto.CalculateCartResponse;
import com.cherrycake.pricing.service.CartCalculationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/cart")
@Tag(name = "Cart", description = "Cart totals calculated by the server")
public class CartController {

    private final CartCalculationService cartCalculationService;

    public CartController(CartCalculationService cartCalculationService) {
        this.cartCalculationService = cartCalculationService;
    }

    @PostMapping("/calculate")
    @Operation(summary = "Calculate cart lines, VAT, discount and total in the region's currency")
    @ApiResponse(responseCode = "200", description = "Calculated cart")
    @ApiResponse(responseCode = "400", description = "Missing region, empty cart, invalid quantity or modifiers",
            content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    @ApiResponse(responseCode = "404", description = "Unknown region or product",
            content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    @ApiResponse(responseCode = "409", description = "Product is out of stock",
            content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    public CalculateCartResponse calculate(@Valid @RequestBody CalculateCartRequest request) {
        return cartCalculationService.calculate(request);
    }
}
