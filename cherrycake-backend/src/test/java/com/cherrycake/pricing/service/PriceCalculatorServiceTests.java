package com.cherrycake.pricing.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.cherrycake.pricing.entity.DiscountRule;
import com.cherrycake.pricing.repository.DiscountRuleRepository;
import com.cherrycake.pricing.service.PriceCalculatorService.PriceBreakdown;
import java.math.BigDecimal;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

class PriceCalculatorServiceTests {

    private static final BigDecimal RATE_ONE = BigDecimal.ONE;
    private static final BigDecimal NO_VAT = new BigDecimal("0.0000");
    private static final BigDecimal NO_DELIVERY = new BigDecimal("0.00");

    private PriceCalculatorService calculator;

    @BeforeEach
    void setUp() {
        DiscountRuleRepository rules = mock(DiscountRuleRepository.class);
        // Deliberately unsorted: the service has to pick the highest reached threshold itself.
        when(rules.findAll()).thenReturn(List.of(
                rule("500.00", "0.0500"),
                rule("5000.00", "0.1500"),
                rule("100.00", "0.0300"),
                rule("1000.00", "0.1000"),
                rule("700.00", "0.0700")));
        calculator = new PriceCalculatorService(rules);
    }

    /** Control examples from the specification (section CC-22), with thresholds in the same currency as prices. */
    @ParameterizedTest
    @CsvSource({
        "1000.00, 0.1500, 0.00,  150.00, 1150.00, 0.1000, 115.00, 1035.00",
        " 400.00, 0.2000, 0.00,   80.00,  480.00, 0.0300,  14.40,  465.60",
        "  90.00, 0.1200, 0.00,   10.80,  100.80, 0.0300,   3.02,   97.78",
        "  85.00, 0.1500, 0.00,   12.75,   97.75, 0.0000,   0.00,   97.75",
        "4300.00, 0.1800, 0.00,  774.00, 5074.00, 0.1500, 761.10, 4312.90",
        "  80.00, 0.2000, 10.00,  16.00,   96.00, 0.0000,   0.00,  106.00",
    })
    void matchesSpecificationControlExamples(
            BigDecimal subtotal, BigDecimal vatRate, BigDecimal delivery, BigDecimal vat, BigDecimal inclVat,
            BigDecimal discountRate, BigDecimal discount, BigDecimal total) {
        PriceBreakdown result = calculator.calculate(subtotal, vatRate, RATE_ONE, delivery);

        assertThat(result.vatAmount()).isEqualTo(vat);
        assertThat(result.amountInclVat()).isEqualTo(inclVat);
        assertThat(result.discountRate()).isEqualByComparingTo(discountRate);
        assertThat(result.discountAmount()).isEqualByComparingTo(discount);
        assertThat(result.deliveryFee()).isEqualTo(delivery);
        assertThat(result.total()).isEqualTo(total);
    }

    @ParameterizedTest
    @CsvSource({
        "99.99, 0.0000",
        "100.00, 0.0300",
        "499.99, 0.0300",
        "500.00, 0.0500",
        "699.99, 0.0500",
        "700.00, 0.0700",
        "999.99, 0.0700",
        "1000.00, 0.1000",
        "4999.99, 0.1000",
        "5000.00, 0.1500",
        "100000.00, 0.1500",
    })
    void picksDiscountAtEveryThresholdBoundary(BigDecimal amount, BigDecimal expectedRate) {
        assertThat(calculator.calculate(amount, NO_VAT, RATE_ONE, NO_DELIVERY).discountRate())
                .isEqualByComparingTo(expectedRate);
    }

    @ParameterizedTest
    @CsvSource({
        "299999.99, 3000, 0.0000",
        "300000.00, 3000, 0.0300",
        "14999999.99, 3000, 0.1000",
        "15000000.00, 3000, 0.1500",
        "11999.99, 120, 0.0000",
        "12000.00, 120, 0.0300",
        "64.99, 0.65, 0.0000",
        "65.00, 0.65, 0.0300",
        "999.99, 10, 0.0000",
        "1000.00, 10, 0.0300",
        "174.99, 1.75, 0.0000",
        "175.00, 1.75, 0.0300",
    })
    void convertsThresholdsToRegionCurrency(BigDecimal amount, BigDecimal exchangeRate, BigDecimal expectedRate) {
        assertThat(calculator.calculate(amount, NO_VAT, exchangeRate, NO_DELIVERY).discountRate())
                .isEqualByComparingTo(expectedRate);
    }

    @Test
    void thresholdIsCheckedAgainstAmountWithVat() {
        PriceBreakdown result = calculator.calculate(
                new BigDecimal("90.00"), new BigDecimal("0.1200"), RATE_ONE, NO_DELIVERY);

        assertThat(result.discountRate()).isEqualByComparingTo("0.03");
    }

    @Test
    void deliveryDoesNotReachDiscountThreshold() {
        PriceBreakdown result = calculator.calculate(
                new BigDecimal("80.00"), new BigDecimal("0.2000"), RATE_ONE, new BigDecimal("500.00"));

        assertThat(result.discountRate()).isEqualByComparingTo("0");
        assertThat(result.total()).isEqualTo(new BigDecimal("596.00"));
    }

    @Test
    void roundsHalfUpAfterEachStep() {
        PriceBreakdown result = calculator.calculate(
                new BigDecimal("87.39"), new BigDecimal("0.1500"), RATE_ONE, NO_DELIVERY);

        assertThat(result.vatAmount()).isEqualTo(new BigDecimal("13.11"));
        assertThat(result.amountInclVat()).isEqualTo(new BigDecimal("100.50"));
        assertThat(result.discountAmount()).isEqualTo(new BigDecimal("3.02"));
        assertThat(result.total()).isEqualTo(new BigDecimal("97.48"));
    }

    @Test
    void noDiscountRateKeepsFourDecimals() {
        assertThat(calculator.calculate(new BigDecimal("10.00"), NO_VAT, RATE_ONE, NO_DELIVERY).discountRate())
                .isEqualTo(new BigDecimal("0.0000"));
    }

    private static DiscountRule rule(String threshold, String rate) {
        return new DiscountRule(new BigDecimal(threshold), new BigDecimal(rate));
    }
}
