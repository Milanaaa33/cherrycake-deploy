package com.cherrycake.fulfillment.service;

import com.cherrycake.catalog.entity.Region;
import com.cherrycake.catalog.service.CatalogService;
import com.cherrycake.common.exception.BadRequestException;
import com.cherrycake.common.exception.ConflictException;
import com.cherrycake.common.exception.NotFoundException;
import com.cherrycake.fulfillment.dto.DeliveryZoneResponse;
import com.cherrycake.fulfillment.dto.PickupPointResponse;
import com.cherrycake.fulfillment.dto.TimeSlotResponse;
import com.cherrycake.fulfillment.entity.DeliveryZone;
import com.cherrycake.fulfillment.entity.FulfillmentType;
import com.cherrycake.fulfillment.entity.PickupPoint;
import com.cherrycake.fulfillment.entity.TimeSlot;
import com.cherrycake.fulfillment.repository.DeliveryZoneRepository;
import com.cherrycake.fulfillment.repository.PickupPointRepository;
import com.cherrycake.fulfillment.repository.TimeSlotRepository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

/**
 * Pickup points, delivery zones and time slots (CC-25) and their checks for a new order (CC-38).
 */
@Service
@Transactional(readOnly = true)
public class FulfillmentService {

    private static final DateTimeFormatter HOURS = DateTimeFormatter.ofPattern("HH:mm");
    private static final BigDecimal NO_FEE = new BigDecimal("0.00");

    private final CatalogService catalogService;
    private final PickupPointRepository pickupPointRepository;
    private final DeliveryZoneRepository deliveryZoneRepository;
    private final TimeSlotRepository timeSlotRepository;

    public FulfillmentService(
            CatalogService catalogService,
            PickupPointRepository pickupPointRepository,
            DeliveryZoneRepository deliveryZoneRepository,
            TimeSlotRepository timeSlotRepository) {
        this.catalogService = catalogService;
        this.pickupPointRepository = pickupPointRepository;
        this.deliveryZoneRepository = deliveryZoneRepository;
        this.timeSlotRepository = timeSlotRepository;
    }

    public List<PickupPointResponse> getPickupPoints(String regionCode) {
        Region region = catalogService.getRegion(regionCode);
        return pickupPointRepository.findByRegionIdAndAvailableTrueOrderById(region.getId()).stream()
                .map(p -> new PickupPointResponse(p.getId(), p.getName(), p.getAddress(), p.getOpeningHours()))
                .toList();
    }

    public List<DeliveryZoneResponse> getDeliveryZones(String regionCode) {
        Region region = catalogService.getRegion(regionCode);
        return deliveryZoneRepository.findByRegionIdAndAvailableTrueOrderByDeliveryFeeAscIdAsc(region.getId()).stream()
                .map(z -> new DeliveryZoneResponse(
                        z.getId(), z.getName(), region.toLocalCurrency(z.getDeliveryFee()), region.getCurrencyCode()))
                .toList();
    }

    /**
     * Delivery price of a zone in the region's currency, used to show the total before the order is placed.
     */
    public BigDecimal getDeliveryFee(Long deliveryZoneId, Region region) {
        DeliveryZone zone = deliveryZoneRepository.findById(deliveryZoneId)
                .filter(z -> z.getRegionId().equals(region.getId()))
                .orElseThrow(() -> new NotFoundException(
                        "Delivery zone " + deliveryZoneId + " not found in " + region.getCode()));
        if (!zone.isAvailable()) {
            throw new ConflictException("Delivery zone " + deliveryZoneId + " is not available");
        }
        return region.toLocalCurrency(zone.getDeliveryFee());
    }

    /**
     * All slots of the day with the places left; a full or closed slot stays in the list with isAvailable = false.
     * "remaining" = capacity minus everything already in the slot on that date (checkout orders and table bookings),
     * so creating an order or a booking lowers it by one. A slot is available only while remaining > 0, it is open,
     * and at least one table is still free for a booking.
     */
    public List<TimeSlotResponse> getTimeSlots(LocalDate date) {
        if (date.isBefore(LocalDate.now())) {
            throw new BadRequestException("date must not be in the past");
        }
        Map<Long, Long> taken = timeSlotRepository.countTakenBySlot(date).stream()
                .collect(Collectors.toMap(row -> ((Number) row[0]).longValue(), row -> ((Number) row[1]).longValue()));
        return timeSlotRepository.findAllByOrderByStartTime().stream()
                .map(slot -> {
                    int remaining = (int) Math.max(0, slot.getCapacity() - taken.getOrDefault(slot.getId(), 0L));
                    boolean hasFreeTable = timeSlotRepository.countAvailableTables(slot.getId(), date) > 0;
                    boolean available = slot.isAvailable() && remaining > 0 && hasFreeTable;
                    String start = format(slot.getStartTime());
                    String end = format(slot.getEndTime());
                    return new TimeSlotResponse(slot.getId(), start, available, slot.getId(), start, end,
                            slot.getCapacity(), remaining);
                })
                .toList();
    }

    /**
     * Checks the pickup or delivery fields of an order and prices the delivery in the region's currency.
     * Does not reserve the slot: call {@link #reserveSlot} right before saving the order.
     */
    public FulfillmentChoice resolve(
            FulfillmentType type, Long pickupPointId, Long deliveryZoneId, Long timeSlotId, Region region) {
        if (type == null) {
            if (pickupPointId != null || deliveryZoneId != null || timeSlotId != null) {
                throw new BadRequestException(
                        "fulfillmentType is required when pickupPointId, deliveryZoneId or timeSlotId is set");
            }
            return FulfillmentChoice.NONE;
        }
        if (timeSlotId == null) {
            throw new BadRequestException("timeSlotId is required for " + type);
        }
        TimeSlot slot = timeSlotRepository.findById(timeSlotId)
                .orElseThrow(() -> new NotFoundException("Time slot " + timeSlotId + " not found"));
        if (!slot.isAvailable()) {
            throw new ConflictException("Time slot " + describe(slot) + " is not available");
        }

        if (type == FulfillmentType.PICKUP) {
            if (pickupPointId == null) {
                throw new BadRequestException("pickupPointId is required for PICKUP");
            }
            if (deliveryZoneId != null) {
                throw new BadRequestException("deliveryZoneId is only allowed for DELIVERY");
            }
            PickupPoint point = pickupPointRepository.findById(pickupPointId)
                    .filter(p -> p.getRegionId().equals(region.getId()))
                    .orElseThrow(() -> new NotFoundException(
                            "Pickup point " + pickupPointId + " not found in " + region.getCode()));
            if (!point.isAvailable()) {
                throw new ConflictException("Pickup point " + pickupPointId + " is not available");
            }
            return new FulfillmentChoice(type, point.getId(), null, slot.getId(), NO_FEE);
        }

        if (deliveryZoneId == null) {
            throw new BadRequestException("deliveryZoneId is required for DELIVERY");
        }
        if (pickupPointId != null) {
            throw new BadRequestException("pickupPointId is only allowed for PICKUP");
        }
        DeliveryZone zone = deliveryZoneRepository.findById(deliveryZoneId)
                .filter(z -> z.getRegionId().equals(region.getId()))
                .orElseThrow(() -> new NotFoundException(
                        "Delivery zone " + deliveryZoneId + " not found in " + region.getCode()));
        if (!zone.isAvailable()) {
            throw new ConflictException("Delivery zone " + deliveryZoneId + " is not available");
        }
        return new FulfillmentChoice(
                type, null, zone.getId(), slot.getId(), region.toLocalCurrency(zone.getDeliveryFee()));
    }

    /**
     * Locks the slot until the order's transaction ends and fails with 409 when it has no places left on that date.
     * Places are counted the same way as in {@link #getTimeSlots}: orders plus table bookings.
     */
    @Transactional(propagation = Propagation.MANDATORY)
    public void reserveSlot(Long timeSlotId, LocalDate date) {
        TimeSlot slot = timeSlotRepository.findByIdForUpdate(timeSlotId)
                .orElseThrow(() -> new NotFoundException("Time slot " + timeSlotId + " not found"));
        if (timeSlotRepository.countTaken(timeSlotId, date) >= slot.getCapacity()) {
            throw new ConflictException("Time slot " + describe(slot) + " on " + date + " is full");
        }
    }

    private static String describe(TimeSlot slot) {
        return format(slot.getStartTime()) + "-" + format(slot.getEndTime());
    }

    private static String format(LocalTime time) {
        return time.format(HOURS);
    }
}
