package com.cherrycake.pricing.service;

import com.cherrycake.pricing.entity.DiscountRule;
import com.cherrycake.pricing.repository.DiscountRuleRepository;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Comparator;
import org.springframework.stereotype.Service;

/**
 * Applies the order formula to a subtotal that is already in the region's currency.
 * Every money step is rounded to 2 places with HALF_UP.
 */
@Service
public class PriceCalculatorService {

    private static final BigDecimal NO_DISCOUNT = new BigDecimal("0.0000");

    private final DiscountRuleRepository discountRuleRepository;

    public PriceCalculatorService(DiscountRuleRepository discountRuleRepository) {
        this.discountRuleRepository = discountRuleRepository;
    }

    public record PriceBreakdown(
            BigDecimal subtotal,
            BigDecimal vatRate,
            BigDecimal vatAmount,
            BigDecimal amountInclVat,
            BigDecimal discountRate,
            BigDecimal discountAmount,
            BigDecimal deliveryFee,
            BigDecimal total) {
    }

    /**
     * @param exchangeRate local currency per conventional unit, used to bring discount thresholds into local currency
     * @param deliveryFee  added last, so it never affects the discount threshold
     */
    public PriceBreakdown calculate(
            BigDecimal subtotal, BigDecimal vatRate, BigDecimal exchangeRate, BigDecimal deliveryFee) {
        BigDecimal vatAmount = round(subtotal.multiply(vatRate));
        BigDecimal amountInclVat = subtotal.add(vatAmount);
        BigDecimal discountRate = findDiscountRate(amountInclVat, exchangeRate);
        BigDecimal discountAmount = round(amountInclVat.multiply(discountRate));
        BigDecimal total = amountInclVat.subtract(discountAmount).add(deliveryFee);
        return new PriceBreakdown(
                subtotal, vatRate, vatAmount, amountInclVat, discountRate, discountAmount, deliveryFee, total);
    }

    private BigDecimal findDiscountRate(BigDecimal amountInclVat, BigDecimal exchangeRate) {
        return discountRuleRepository.findAll().stream()
                .filter(rule -> amountInclVat.compareTo(rule.getThreshold().multiply(exchangeRate)) >= 0)
                .max(Comparator.comparing(DiscountRule::getThreshold))
                .map(DiscountRule::getRate)
                .orElse(NO_DISCOUNT);
    }

    private static BigDecimal round(BigDecimal amount) {
        return amount.setScale(2, RoundingMode.HALF_UP);
    }
}
