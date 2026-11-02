package uz.itpu.cherrycake.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uz.itpu.cherrycake.common.exception.ResourceNotFoundException;
import uz.itpu.cherrycake.dto.response.*;
import uz.itpu.cherrycake.model.entity.*;
import uz.itpu.cherrycake.repository.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CatalogService
{
    private final RegionRepository regionRepository;
    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final ProductPriceRepository productPriceRepository;
    private final PickupPointRepository pickupPointRepository;
    private final DeliveryZoneRepository deliveryZoneRepository;

    public List<RegionDto> getAllActiveRegions()
    { return regionRepository.findAllByActiveTrue().stream().map(this::mapToRegionDto).collect(Collectors.toList()); }

    public List<CategoryDto> getAllCategories()
    { return categoryRepository.findAllByOrderByDisplayOrderAsc().stream().map(this::mapToCategoryDto).collect(Collectors.toList()); }

    public List<ProductDto> getProducts(String regionCode, Long categoryId)
    {
        Region region = regionRepository.findByCodeIgnoreCase(regionCode).orElseThrow(() -> new ResourceNotFoundException("Region not found: " + regionCode));

        List<Product> products = (categoryId != null) ? productRepository.findByCategoryIdAndAvailableTrue(categoryId) : productRepository.findAllByAvailableTrue();

        return products.stream().map(p -> mapToProductDto(p, region)).collect(Collectors.toList());
    }

    public ProductDto getProductById(Long productId, String regionCode)
    {
        Region region = regionRepository.findByCodeIgnoreCase(regionCode).orElseThrow(() -> new ResourceNotFoundException("Region not found: " + regionCode));

        Product product = productRepository.findById(productId).orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + productId));

        return mapToProductDto(product, region);
    }

    public List<PickupPointDto> getPickupPoints(String regionCode)
    {
        return pickupPointRepository.findByRegionCodeIgnoreCaseAndActiveTrue(regionCode).stream().map
        (p -> PickupPointDto.builder()
            .id(p.getId())
            .regionId(p.getRegion().getId())
            .name(p.getName())
            .address(p.getAddress())
            .workingHours(p.getWorkingHours())
            .build()
        ).collect(Collectors.toList());
    }

    public List<DeliveryZoneDto> getDeliveryZones(String regionCode)
    {
        return deliveryZoneRepository.findByRegionCodeIgnoreCaseAndActiveTrue(regionCode).stream().map
        (z -> DeliveryZoneDto.builder()
            .id(z.getId())
            .regionId(z.getRegion().getId())
            .name(z.getName())
            .deliveryFee(z.getDeliveryFee())
            .estimatedMinutes(z.getEstimatedMinutes())
            .build()
        ).collect(Collectors.toList());
    }

    private RegionDto mapToRegionDto(Region region)
    {
        return RegionDto.builder()
            .id(region.getId())
            .code(region.getCode())
            .name(region.getName())
            .currencyCode(region.getCurrencyCode())
            .currencySymbol(region.getCurrencySymbol())
            .vatRate(region.getVatRate())
            .active(region.isActive())
            .build();
    }

    private CategoryDto mapToCategoryDto(Category category)
    {
        return CategoryDto.builder()
            .id(category.getId())
            .code(category.getCode())
            .name(category.getName())
            .description(category.getDescription())
            .displayOrder(category.getDisplayOrder())
            .build();
    }

    private ProductDto mapToProductDto(Product product, Region region)
    {
        BigDecimal price = productPriceRepository.findByProductIdAndRegionId(product.getId(), region.getId()).map(ProductPrice::getPrice).orElse(BigDecimal.ZERO);

        List<ProductModifierDto> modifierDtos = product.getModifiers().stream().map
        (m -> ProductModifierDto.builder()
            .id(m.getId())
            .name(m.getName())
            .priceDelta(m.getPriceDelta())
            .isDefault(m.isDefault())
            .build()
        ).collect(Collectors.toList());

        return ProductDto.builder()
            .id(product.getId())
            .code(product.getCode())
            .name(product.getName())
            .description(product.getDescription())
            .imageUrl(product.getImageUrl())
            .categoryId(product.getCategory().getId())
            .categoryName(product.getCategory().getName())
            .price(price)
            .currency(region.getCurrencyCode())
            .currencySymbol(region.getCurrencySymbol())
            .available(product.isAvailable())
            .modifiers(modifierDtos)
            .build();
    }
}