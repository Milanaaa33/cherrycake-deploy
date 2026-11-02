package uz.itpu.cherrycake.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uz.itpu.cherrycake.common.exception.ResourceNotFoundException;
import uz.itpu.cherrycake.dto.request.CartCalculateRequest;
import uz.itpu.cherrycake.dto.request.CartItemDto;
import uz.itpu.cherrycake.dto.response.CartCalculateResponse;
import uz.itpu.cherrycake.dto.response.CartCalculateResponse.CalculatedItemDto;
import uz.itpu.cherrycake.model.entity.*;
import uz.itpu.cherrycake.model.enums.DiscountType;
import uz.itpu.cherrycake.model.enums.OrderType;
import uz.itpu.cherrycake.repository.*;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/**
 * Well ... it is a core pricing calculation engine for Cherry Cake Bakery & Café.
 * Strictly adheres to the project calculation specification:
 * 1. Subtotal = Σ(Price_i * Quantity_i) + Σ(Modifier_j * Quantity_i)
 * 2. VAT = Subtotal * (VAT_rate / 100)
 * 3. Amount_incl_VAT = Subtotal + VAT
 * 4. Discount = Amount_incl_VAT * (Discount_rate / 100) (threshold based on Amount_incl_VAT or promo code)
 * 5. Total = Amount_incl_VAT - Discount + Delivery fee (applied last)
 * All operations use BigDecimal with RoundingMode.HALF_UP to 2 decimal places.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PriceCalculatorService
{
    private static final int SCALE = 2;
    private static final RoundingMode ROUNDING = RoundingMode.HALF_UP;
    private static final BigDecimal ONE_HUNDRED = new BigDecimal("100");

    private final RegionRepository regionRepository;
    private final ProductRepository productRepository;
    private final ProductPriceRepository productPriceRepository;
    private final ProductModifierRepository productModifierRepository;
    private final DiscountRepository discountRepository;
    private final DeliveryZoneRepository deliveryZoneRepository;

    public CartCalculateResponse calculateCart(CartCalculateRequest request)
    {
        // 1. Resolve the Region & VAT
        Region region = regionRepository.findByCodeIgnoreCase(request.getRegionCode())
            .orElseThrow(() -> new ResourceNotFoundException("Region not found for code: " + request.getRegionCode()));

        BigDecimal vatRate = region.getVatRate().setScale(SCALE, ROUNDING);

        // 2. Calculate the Line Items and Subtotal
        BigDecimal subtotal = BigDecimal.ZERO.setScale(SCALE, ROUNDING);
        List<CalculatedItemDto> calculatedItems = new ArrayList<>();

        for (CartItemDto item : request.getItems())
        {
            Product product = productRepository.findById(item.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + item.getProductId()));

            // Find the regional price
            ProductPrice productPrice = productPriceRepository
                .findByProductIdAndRegionId(product.getId(), region.getId())
                .orElseThrow(() -> new ResourceNotFoundException(String.format("Price not configured for product '%s' in region '%s'", product.getName(), region.getCode())));

            BigDecimal baseUnitPrice = productPrice.getPrice().setScale(SCALE, ROUNDING);
            BigDecimal quantity = BigDecimal.valueOf(item.getQuantity());

            // Calculate the modifiers cost
            BigDecimal modifiersPerUnit = BigDecimal.ZERO.setScale(SCALE, ROUNDING);
            List<String> modifierNames = new ArrayList<>();

            if (item.getModifierIds() != null && !item.getModifierIds().isEmpty())
            {
                List<ProductModifier> modifiers = productModifierRepository.findAllById(item.getModifierIds());
                for (ProductModifier modifier : modifiers)
                {
                    modifiersPerUnit = modifiersPerUnit.add(modifier.getPriceDelta());
                    modifierNames.add(modifier.getName());
                }
            }
            modifiersPerUnit = modifiersPerUnit.setScale(SCALE, ROUNDING);

            BigDecimal effectiveUnitPrice = baseUnitPrice.add(modifiersPerUnit).setScale(SCALE, ROUNDING);
            BigDecimal itemTotal = effectiveUnitPrice.multiply(quantity).setScale(SCALE, ROUNDING);

            subtotal = subtotal.add(itemTotal).setScale(SCALE, ROUNDING);

            calculatedItems.add(CalculatedItemDto.builder()
                .productId(product.getId())
                .productName(product.getName())
                .quantity(item.getQuantity())
                .unitPrice(baseUnitPrice)
                .modifiersPrice(modifiersPerUnit)
                .lineTotal(itemTotal)
                .modifierNames(modifierNames)
                .build());
        }

        // 3. VAT Computation: VAT = Subtotal * (vatRate / 100)
        BigDecimal vatAmount = subtotal.multiply(vatRate).divide(ONE_HUNDRED, SCALE, ROUNDING);

        // 4. Amount_incl_VAT = Subtotal + VAT
        BigDecimal amountInclVat = subtotal.add(vatAmount).setScale(SCALE, ROUNDING);

        // 5. Discount calculation (Threshold by Amount_incl_VAT or Promo code)
        BigDecimal discountRate = BigDecimal.ZERO.setScale(SCALE, ROUNDING);
        BigDecimal discountAmount = BigDecimal.ZERO.setScale(SCALE, ROUNDING);
        String discountDescription = "No discount applied";

        // Check promo code first if provided
        if (request.getPromoCode() != null && !request.getPromoCode().trim().isEmpty())
        {
            Optional<Discount> promoOpt = discountRepository.findByCodeIgnoreCaseAndActiveTrue(request.getPromoCode().trim());
            if (promoOpt.isPresent())
            {
                Discount promo = promoOpt.get();
                if (promo.getDiscountType() == DiscountType.PROMO_CODE)
                {
                    if (promo.getPercentage().compareTo(BigDecimal.ZERO) > 0)
                    {
                        discountRate = promo.getPercentage().setScale(SCALE, ROUNDING);
                        discountAmount = amountInclVat.multiply(discountRate).divide(ONE_HUNDRED, SCALE, ROUNDING);
                        discountDescription = promo.getName() + " (" + discountRate + "%)";
                    }
                    else if (promo.getFixedAmount().compareTo(BigDecimal.ZERO) > 0)
                    {
                        discountAmount = promo.getFixedAmount().min(amountInclVat).setScale(SCALE, ROUNDING);
                        discountDescription = promo.getName() + " (Fixed " + discountAmount + " " + region.getCurrencyCode() + ")";
                    }
                }
            }
        }

        // If no promo discount applied, we check threshold discounts based on Amount_incl_VAT
        if (discountAmount.compareTo(BigDecimal.ZERO) == 0)
        {
            List<Discount> thresholdDiscounts = discountRepository.findByDiscountTypeAndActiveTrue(DiscountType.THRESHOLD);
            for (Discount threshold : thresholdDiscounts)
            {
                if (amountInclVat.compareTo(threshold.getMinSubtotal()) >= 0)
                {
                    if (threshold.getPercentage().compareTo(discountRate) > 0)
                    {
                        discountRate = threshold.getPercentage().setScale(SCALE, ROUNDING);
                        discountAmount = amountInclVat.multiply(discountRate).divide(ONE_HUNDRED, SCALE, ROUNDING);
                        discountDescription = threshold.getName() + " (" + discountRate + "%)";
                    }
                }
            }
        }

        // 6. Delivery Fee (applied last, if delivery)
        BigDecimal deliveryFee = BigDecimal.ZERO.setScale(SCALE, ROUNDING);
        if (request.getOrderType() == OrderType.DELIVERY && request.getDeliveryZoneId() != null)
        {
            DeliveryZone zone = deliveryZoneRepository.findById(request.getDeliveryZoneId())
                .orElseThrow(() -> new ResourceNotFoundException("Delivery zone not found with id: " + request.getDeliveryZoneId()));
            deliveryFee = zone.getDeliveryFee().setScale(SCALE, ROUNDING);
        }

        // 7. Total = Amount_incl_VAT - Discount + Delivery Fee
        BigDecimal finalTotal = amountInclVat.subtract(discountAmount).add(deliveryFee).setScale(SCALE, ROUNDING);

        if (finalTotal.compareTo(BigDecimal.ZERO) < 0) finalTotal = BigDecimal.ZERO.setScale(SCALE, ROUNDING);

        return CartCalculateResponse.builder()
            .regionCode(region.getCode())
            .currency(region.getCurrencyCode())
            .currencySymbol(region.getCurrencySymbol())
            .subtotal(subtotal)
            .vatRate(vatRate)
            .vatAmount(vatAmount)
            .amountInclVat(amountInclVat)
            .discountRate(discountRate)
            .discountAmount(discountAmount)
            .discountDescription(discountDescription)
            .deliveryFee(deliveryFee)
            .finalTotal(finalTotal)
            .items(calculatedItems)
            .build();
    }
}