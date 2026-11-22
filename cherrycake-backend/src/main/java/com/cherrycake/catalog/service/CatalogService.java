package com.cherrycake.catalog.service;

import com.cherrycake.catalog.dto.CategoryResponse;
import com.cherrycake.catalog.dto.ProductResponse;
import com.cherrycake.catalog.dto.RegionResponse;
import com.cherrycake.catalog.entity.Modifier;
import com.cherrycake.catalog.entity.ModifierGroup;
import com.cherrycake.catalog.entity.ModifierRegionalPrice;
import com.cherrycake.catalog.entity.Product;
import com.cherrycake.catalog.entity.Region;
import com.cherrycake.catalog.entity.RegionalPrice;
import com.cherrycake.catalog.repository.CategoryRepository;
import com.cherrycake.catalog.repository.ModifierGroupRepository;
import com.cherrycake.catalog.repository.ModifierRegionalPriceRepository;
import com.cherrycake.catalog.repository.ModifierRepository;
import com.cherrycake.catalog.repository.ProductRepository;
import com.cherrycake.catalog.repository.RegionRepository;
import com.cherrycake.catalog.repository.RegionalPriceRepository;
import com.cherrycake.common.exception.NotFoundException;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class CatalogService {

    private final RegionRepository regionRepository;
    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final RegionalPriceRepository regionalPriceRepository;
    private final ModifierGroupRepository modifierGroupRepository;
    private final ModifierRepository modifierRepository;
    private final ModifierRegionalPriceRepository modifierRegionalPriceRepository;

    public CatalogService(
            RegionRepository regionRepository,
            CategoryRepository categoryRepository,
            ProductRepository productRepository,
            RegionalPriceRepository regionalPriceRepository,
            ModifierGroupRepository modifierGroupRepository,
            ModifierRepository modifierRepository,
            ModifierRegionalPriceRepository modifierRegionalPriceRepository) {
        this.regionRepository = regionRepository;
        this.categoryRepository = categoryRepository;
        this.productRepository = productRepository;
        this.regionalPriceRepository = regionalPriceRepository;
        this.modifierGroupRepository = modifierGroupRepository;
        this.modifierRepository = modifierRepository;
        this.modifierRegionalPriceRepository = modifierRegionalPriceRepository;
    }

    public List<RegionResponse> getRegions() {
        return regionRepository.findAllByOrderById().stream()
                .map(r -> new RegionResponse(
                        r.getId(), r.getCode(), r.getName(), r.getCurrencyCode(), r.getCurrencySymbol(), r.getVatRate()))
                .toList();
    }

    public List<CategoryResponse> getCategories() {
        return categoryRepository.findAllByOrderBySortOrder().stream()
                .map(c -> new CategoryResponse(c.getId(), c.getName()))
                .toList();
    }

    public List<ProductResponse> getProducts(String regionCode, Long categoryId) {
        Region region = getRegion(regionCode);
        Map<Long, RegionalPrice> prices = regionalPriceRepository.findByRegionId(region.getId()).stream()
                .collect(Collectors.toMap(RegionalPrice::getProductId, Function.identity()));
        List<Product> products = categoryId == null
                ? productRepository.findAllByOrderById()
                : productRepository.findByCategoryIdOrderById(categoryId);
        return products.stream()
                .filter(p -> prices.containsKey(p.getId()))
                .map(p -> toResponse(p, prices.get(p.getId()), region, null))
                .toList();
    }

    public ProductResponse getProduct(Long id, String regionCode) {
        Region region = getRegion(regionCode);
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Product " + id + " not found"));
        RegionalPrice price = regionalPriceRepository.findById(new RegionalPrice.Key(id, region.getId()))
                .orElseThrow(() -> new NotFoundException("Product " + id + " is not sold in " + regionCode));
        return toResponse(product, price, region, getModifierGroups(id, region));
    }

    public Region getRegion(String code) {
        return regionRepository.findByCode(code)
                .orElseThrow(() -> new NotFoundException("Region " + code + " not found"));
    }

    private List<ProductResponse.ModifierGroup> getModifierGroups(Long productId, Region region) {
        List<ModifierGroup> groups = modifierGroupRepository.findByProductIdInOrderById(List.of(productId));
        List<Modifier> modifiers = modifierRepository.findByGroupIdInOrderById(
                groups.stream().map(ModifierGroup::getId).toList());
        Map<Long, BigDecimal> deltas = modifierRegionalPriceRepository.findByRegionIdAndModifierIdIn(
                        region.getId(), modifiers.stream().map(Modifier::getId).toList()).stream()
                .collect(Collectors.toMap(
                        ModifierRegionalPrice::getModifierId, ModifierRegionalPrice::getPriceDelta));
        return groups.stream()
                .map(g -> new ProductResponse.ModifierGroup(
                        g.getId(), g.getName(), g.getType(), g.isRequired(),
                        modifiers.stream()
                                .filter(m -> m.getGroupId().equals(g.getId()) && deltas.containsKey(m.getId()))
                                .map(m -> new ProductResponse.Modifier(
                                        m.getId(), m.getName(), region.toLocalCurrency(deltas.get(m.getId()))))
                                .toList()))
                .toList();
    }

    private static ProductResponse toResponse(
            Product product, RegionalPrice price, Region region, List<ProductResponse.ModifierGroup> modifierGroups) {
        return new ProductResponse(
                product.getId(),
                product.getName(),
                product.getDescription(),
                product.getPhotoUrl(),
                region.toLocalCurrency(price.getPrice()),
                price.isInStock(),
                modifierGroups);
    }
}
