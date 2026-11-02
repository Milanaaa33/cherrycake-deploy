package uz.itpu.cherrycake.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import uz.itpu.cherrycake.common.response.ApiResponse;
import uz.itpu.cherrycake.dto.request.CartCalculateRequest;
import uz.itpu.cherrycake.dto.response.CartCalculateResponse;
import uz.itpu.cherrycake.service.PriceCalculatorService;

@RestController
@RequestMapping("/api/v1/cart")
@RequiredArgsConstructor
@Tag(name = "Cart", description = "Cart calculation and recalculation endpoints")
public class CartController
{
    private final PriceCalculatorService priceCalculatorService;

    @PostMapping("/calculate")
    @Operation(summary = "Calculate order subtotal, regional VAT, discounts, delivery fee, and final total")
    public ResponseEntity<ApiResponse<CartCalculateResponse>> calculateCart(@Valid @RequestBody CartCalculateRequest request)
    {
        CartCalculateResponse response = priceCalculatorService.calculateCart(request);
        return ResponseEntity.ok(ApiResponse.ok("Cart successfully calculated", response));
    }
}