package com.cherrycake.auth.controller;

import com.cherrycake.auth.dto.AuthResponse;
import com.cherrycake.auth.dto.RequestCodeRequest;
import com.cherrycake.auth.dto.VerifyCodeRequest;
import com.cherrycake.auth.service.AuthService;
import com.cherrycake.common.dto.ErrorResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Auth", description = "Passwordless sign-in: a one-time code is sent to the customer's email")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/request-code")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Send a 6-digit sign-in code to the email (valid for 10 minutes)")
    @ApiResponse(responseCode = "204", description = "Code sent (or written to the backend log when no mail server is configured)")
    @ApiResponse(responseCode = "400", description = "Invalid email",
            content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    @ApiResponse(responseCode = "429", description = "A code was requested less than a minute ago, or too many codes in the last hour",
            content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    @ApiResponse(responseCode = "503", description = "The email could not be sent",
            content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    public void requestCode(@Valid @RequestBody RequestCodeRequest request) {
        authService.requestCode(request.email());
    }

    @PostMapping("/verify-code")
    @Operation(summary = "Check the code and return a session token")
    @ApiResponse(responseCode = "200", description = "Signed in")
    @ApiResponse(responseCode = "400", description = "Wrong, expired or already used code (5 wrong attempts burn the code)",
            content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    public AuthResponse verifyCode(@Valid @RequestBody VerifyCodeRequest request) {
        return authService.verifyCode(request.email(), request.code());
    }

    @PostMapping("/logout")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Sign out: invalidate the session token from the Authorization header")
    @ApiResponse(responseCode = "204", description = "Signed out")
    public void logout(@RequestHeader(value = "Authorization", required = false) String authorization) {
        authService.logout(authorization);
    }
}
