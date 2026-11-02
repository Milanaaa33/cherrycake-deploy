package uz.itpu.cherrycake.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import uz.itpu.cherrycake.common.exception.BadRequestException;
import uz.itpu.cherrycake.common.response.ApiResponse;
import uz.itpu.cherrycake.dto.request.OrderCreateRequest;
import uz.itpu.cherrycake.dto.response.OrderResponse;
import uz.itpu.cherrycake.model.entity.User;
import uz.itpu.cherrycake.service.AuthService;
import uz.itpu.cherrycake.service.OrderService;

import java.util.List;

@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
@Tag(name = "Orders", description = "Order placement and tracking endpoints")
public class OrderController
{
    private final OrderService orderService;
    private final AuthService authService;

    @PostMapping
    @Operation(summary = "Place a new order with server-side price recalculation")
    public ResponseEntity<ApiResponse<OrderResponse>> createOrder(@Valid @RequestBody OrderCreateRequest request)
    {
        User currentUser = authService.getCurrentAuthenticatedUser();
        OrderResponse orderResponse = orderService.createOrder(request, currentUser);
        return new ResponseEntity<>(ApiResponse.ok("Order successfully placed", orderResponse), HttpStatus.CREATED);
    }

    @GetMapping("/{orderNumber}")
    @Operation(summary = "Get order details by order tracking number")
    public ResponseEntity<ApiResponse<OrderResponse>> getOrderByNumber(@PathVariable String orderNumber)
    { return ResponseEntity.ok(ApiResponse.ok(orderService.getOrderByNumber(orderNumber))); }

    @GetMapping("/my")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get current authenticated user's order history")
    public ResponseEntity<ApiResponse<List<OrderResponse>>> getMyOrders()
    {
        User currentUser = authService.getCurrentAuthenticatedUser();

        if (currentUser == null)
            throw new BadRequestException("User not authenticated");

        return ResponseEntity.ok(ApiResponse.ok(orderService.getUserOrders(currentUser.getId())));
    }
}