package com.cherrycake.pricing.service;

import com.cherrycake.catalog.entity.Modifier;
import com.cherrycake.catalog.entity.ModifierGroup;
import com.cherrycake.catalog.entity.ModifierRegionalPrice;
import com.cherrycake.catalog.entity.ModifierType;
import com.cherrycake.catalog.entity.Region;
import com.cherrycake.catalog.entity.RegionalPrice;
import com.cherrycake.catalog.repository.ModifierGroupRepository;
import com.cherrycake.catalog.repository.ModifierRegionalPriceRepository;
import com.cherrycake.catalog.repository.ModifierRepository;
import com.cherrycake.catalog.repository.RegionalPriceRepository;
import com.cherrycake.catalog.service.CatalogService;
import com.cherrycake.common.exception.BadRequestException;
import com.cherrycake.common.exception.ConflictException;
import com.cherrycake.common.exception.NotFoundException;
import com.cherrycake.pricing.dto.CalculateCartRequest;
import com.cherrycake.pricing.dto.CalculateCartResponse;
import com.cherrycake.pricing.service.PriceCalculatorService.PriceBreakdown;
import java.math.BigDecimal;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Prices a cart: loads and validates its lines, converts them to the region's currency and applies the formula.
 */
@Service
@Transactional(readOnly = true)
public class CartCalculationService {

    private static final BigDecimal NO_MONEY = new BigDecimal("0.00");

    private final CatalogService catalogService;
    private final RegionalPriceRepository regionalPriceRepository;
    private final ModifierGroupRepository modifierGroupRepository;
    private final ModifierRepository modifierRepository;
    private final ModifierRegionalPriceRepository modifierRegionalPriceRepository;
    private final PriceCalculatorService priceCalculatorService;

    public CartCalculationService(
            CatalogService catalogService,
            RegionalPriceRepository regionalPriceRepository,
            ModifierGroupRepository modifierGroupRepository,
            ModifierRepository modifierRepository,
            ModifierRegionalPriceRepository modifierRegionalPriceRepository,
            PriceCalculatorService priceCalculatorService) {
        this.catalogService = catalogService;
        this.regionalPriceRepository = regionalPriceRepository;
        this.modifierGroupRepository = modifierGroupRepository;
        this.modifierRepository = modifierRepository;
        this.modifierRegionalPriceRepository = modifierRegionalPriceRepository;
        this.priceCalculatorService = priceCalculatorService;
    }

    public CalculateCartResponse calculate(CalculateCartRequest request) {
        Region region = catalogService.getRegion(request.region());
        CartCatalog catalog = loadCatalog(region, request.items());

        List<CalculateCartResponse.Item> lines = request.items().stream()
                .map(item -> priceLine(item, region, catalog))
                .toList();
        BigDecimal subtotal = lines.stream()
                .map(CalculateCartResponse.Item::lineTotal)
                .reduce(NO_MONEY, BigDecimal::add);

        PriceBreakdown price = priceCalculatorService.calculate(
                subtotal, region.getVatRate(), region.getExchangeRate(), NO_MONEY);
        return new CalculateCartResponse(
                lines,
                price.subtotal(),
                price.vatRate(),
                price.vatAmount(),
                price.amountInclVat(),
                price.discountRate(),
                price.discountAmount(),
                price.deliveryFee(),
                price.total(),
                region.getCurrencyCode());
    }

    private record CartCatalog(
            Map<Long, RegionalPrice> prices,
            Map<Long, List<ModifierGroup>> groupsByProduct,
            Map<Long, Modifier> modifiers,
            Map<Long, BigDecimal> deltas) {
    }

    private CartCatalog loadCatalog(Region region, List<CalculateCartRequest.Item> items) {
        List<Long> productIds = items.stream().map(CalculateCartRequest.Item::productId).distinct().toList();
        Map<Long, RegionalPrice> prices = regionalPriceRepository
                .findByRegionIdAndProductIdIn(region.getId(), productIds).stream()
                .collect(Collectors.toMap(RegionalPrice::getProductId, Function.identity()));
        List<ModifierGroup> groups = modifierGroupRepository.findByProductIdInOrderById(productIds);
        Map<Long, Modifier> modifiers = modifierRepository
                .findByGroupIdInOrderById(groups.stream().map(ModifierGroup::getId).toList()).stream()
                .collect(Collectors.toMap(Modifier::getId, Function.identity()));
        Map<Long, BigDecimal> deltas = modifierRegionalPriceRepository
                .findByRegionIdAndModifierIdIn(region.getId(), modifiers.keySet()).stream()
                .collect(Collectors.toMap(
                        ModifierRegionalPrice::getModifierId, ModifierRegionalPrice::getPriceDelta));
        return new CartCatalog(
                prices, groups.stream().collect(Collectors.groupingBy(ModifierGroup::getProductId)), modifiers, deltas);
    }

    private CalculateCartResponse.Item priceLine(CalculateCartRequest.Item item, Region region, CartCatalog catalog) {
        RegionalPrice price = catalog.prices().get(item.productId());
        if (price == null) {
            throw new NotFoundException("Product " + item.productId() + " not found in " + region.getCode());
        }
        if (!price.isInStock()) {
            throw new ConflictException("Product " + item.productId() + " is out of stock in " + region.getCode());
        }
        BigDecimal unitPrice = region.toLocalCurrency(price.getPrice());
        BigDecimal modifiersPrice = priceModifiers(item, region, catalog);
        BigDecimal lineTotal = unitPrice.add(modifiersPrice).multiply(BigDecimal.valueOf(item.quantity()));
        return new CalculateCartResponse.Item(item.productId(), unitPrice, modifiersPrice, item.quantity(), lineTotal);
    }

    private BigDecimal priceModifiers(CalculateCartRequest.Item item, Region region, CartCatalog catalog) {
        Long productId = item.productId();
        if (new HashSet<>(item.modifierIds()).size() != item.modifierIds().size()) {
            throw new BadRequestException("Product " + productId + " has a duplicate modifier");
        }
        List<ModifierGroup> groups = catalog.groupsByProduct().getOrDefault(productId, List.of());
        Map<Long, Integer> selectedPerGroup = new HashMap<>();
        BigDecimal modifiersPrice = NO_MONEY;
        for (Long modifierId : item.modifierIds()) {
            Modifier modifier = catalog.modifiers().get(modifierId);
            BigDecimal delta = catalog.deltas().get(modifierId);
            if (modifier == null || delta == null
                    || groups.stream().noneMatch(g -> g.getId().equals(modifier.getGroupId()))) {
                throw new BadRequestException(
                        "Modifier " + modifierId + " is not available for product " + productId);
            }
            selectedPerGroup.merge(modifier.getGroupId(), 1, Integer::sum);
            modifiersPrice = modifiersPrice.add(region.toLocalCurrency(delta));
        }
        for (ModifierGroup group : groups) {
            int selected = selectedPerGroup.getOrDefault(group.getId(), 0);
            if (group.isRequired() && selected == 0) {
                throw new BadRequestException(
                        "Modifier group " + group.getName() + " is required for product " + productId);
            }
            if (group.getType() == ModifierType.SINGLE && selected > 1) {
                throw new BadRequestException(
                        "Modifier group " + group.getName() + " allows one choice for product " + productId);
            }
        }
        return modifiersPrice;
    }
}
