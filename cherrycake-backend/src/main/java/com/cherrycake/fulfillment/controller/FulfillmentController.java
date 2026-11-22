package com.cherrycake.fulfillment.controller;

import com.cherrycake.common.dto.ErrorResponse;
import com.cherrycake.fulfillment.dto.DeliveryZoneResponse;
import com.cherrycake.fulfillment.dto.PickupPointResponse;
import com.cherrycake.fulfillment.dto.TimeSlotResponse;
import com.cherrycake.fulfillment.service.FulfillmentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.time.LocalDate;
import java.util.List;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
@Tag(name = "Fulfillment", description = "Pickup points, delivery zones and time slots for checkout")
public class FulfillmentController {

    private final FulfillmentService fulfillmentService;

    public FulfillmentController(FulfillmentService fulfillmentService) {
        this.fulfillmentService = fulfillmentService;
    }

    @GetMapping("/pickup-points")
    @Operation(summary = "Open pickup points of a region")
    @ApiResponse(responseCode = "200", description = "Pickup points")
    @ApiResponse(responseCode = "400", description = "Region is missing",
            content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    @ApiResponse(responseCode = "404", description = "Unknown region",
            content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    public List<PickupPointResponse> getPickupPoints(@Parameter(example = "UZB") @RequestParam String region) {
        return fulfillmentService.getPickupPoints(region);
    }

    @GetMapping("/delivery-zones")
    @Operation(summary = "Delivery zones of a region with the delivery price in the region's currency")
    @ApiResponse(responseCode = "200", description = "Delivery zones, cheapest first")
    @ApiResponse(responseCode = "400", description = "Region is missing",
            content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    @ApiResponse(responseCode = "404", description = "Unknown region",
            content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    public List<DeliveryZoneResponse> getDeliveryZones(@Parameter(example = "UZB") @RequestParam String region) {
        return fulfillmentService.getDeliveryZones(region);
    }

    @GetMapping("/time-slots")
    @Operation(summary = "Time slots of a date with the places left")
    @ApiResponse(responseCode = "200", description = "All slots of the day; full ones have isAvailable = false")
    @ApiResponse(responseCode = "400", description = "Date is missing, malformed or in the past",
            content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    public List<TimeSlotResponse> getTimeSlots(
            @Parameter(example = "2026-12-31") @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate date) {
        return fulfillmentService.getTimeSlots(date);
    }
}
