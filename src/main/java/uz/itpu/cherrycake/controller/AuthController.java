package uz.itpu.cherrycake.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import uz.itpu.cherrycake.common.exception.ResourceNotFoundException;
import uz.itpu.cherrycake.common.response.ApiResponse;
import uz.itpu.cherrycake.dto.request.LoginRequest;
import uz.itpu.cherrycake.dto.request.RegisterRequest;
import uz.itpu.cherrycake.dto.response.AuthResponse;
import uz.itpu.cherrycake.model.entity.User;
import uz.itpu.cherrycake.service.AuthService;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "User registration, authentication and JWT management")
public class AuthController
{
    private final AuthService authService;

    @PostMapping("/register")
    @Operation(summary = "Register a new user account")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request)
    {
        AuthResponse response = authService.register(request);
        return new ResponseEntity<>(ApiResponse.ok("User successfully registered", response), HttpStatus.CREATED);
    }

    @PostMapping("/login")
    @Operation(summary = "Authenticate user and receive a JWT Bearer token")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request)
    {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.ok("Authentication successful", response));
    }

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get profile information of current authenticated user")
    public ResponseEntity<ApiResponse<AuthResponse>> getCurrentUser()
    {
        User user = authService.getCurrentAuthenticatedUser();

        if (user == null)
            throw new ResourceNotFoundException("User session expired or invalid");
        
        AuthResponse profile = AuthResponse.builder()
            .userId(user.getId())
            .email(user.getEmail())
            .fullName(user.getFullName())
            .role(user.getRole())
            .build();

        return ResponseEntity.ok(ApiResponse.ok(profile));
    }
}