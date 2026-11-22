package com.cherrycake.common.exception;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * Test-only endpoints that fail in every way the handler has to cover.
 */
@RestController
@RequestMapping("/api/test-errors")
class ErrorTestController {

    record Item(@NotBlank String region, @Min(1) int quantity) {
    }

    @GetMapping("/not-found")
    void notFound() {
        throw new NotFoundException("Region XYZ not found");
    }

    @GetMapping("/conflict")
    void conflict() {
        throw new ConflictException("Product 7 is out of stock in UZB");
    }

    @GetMapping("/boom")
    void boom() {
        throw new IllegalStateException("secret internal detail");
    }

    @GetMapping("/param")
    String param(@RequestParam String region, @RequestParam(defaultValue = "1") @Min(1) int quantity) {
        return region + quantity;
    }

    @PostMapping("/body")
    Item body(@Valid @RequestBody Item item) {
        return item;
    }
}
