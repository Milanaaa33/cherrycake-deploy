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
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

/**
 * Automated verification of all 25+ QAJ calculation test cases (CC-16 / CC-33).
 */
class QaFormulaVerificationTests {

    private static final BigDecimal RATE_ONE = BigDecimal.ONE;
    private static final BigDecimal NO_DELIVERY = new BigDecimal("0.00");

    private PriceCalculatorService calculator;

    @BeforeEach
    void setUp() {
        DiscountRuleRepository rules = mock(DiscountRuleRepository.class);
        when(rules.findAll()).thenReturn(List.of(
                rule("100.00", "0.0300"),
                rule("500.00", "0.0500"),
                rule("700.00", "0.0700"),
                rule("1000.00", "0.1000"),
                rule("5000.00", "0.1500")));
        calculator = new PriceCalculatorService(rules);
    }

    @DisplayName("CC-16 TC-01..TC-15: Control examples and boundary precision")
    @ParameterizedTest(name = "{0}")
    @CsvSource({
        "TC-01 UZB 1000 -> 10% discount,   1000.00, 0.1500,  0.00,  150.00, 1150.00, 0.1000, 115.00, 1035.00",
        "TC-02 KAZ 400 -> 3% discount,     400.00, 0.2000,  0.00,   80.00,  480.00, 0.0300,  14.40,  465.60",
        "TC-03 GEO 90 -> crosses 100 VAT,   90.00, 0.1200,  0.00,   10.80,  100.80, 0.0300,   3.02,   97.78",
        "TC-04 UZB 85 -> below threshold,   85.00, 0.1500,  0.00,   12.75,   97.75, 0.0000,   0.00,   97.75",
        "TC-05 CHN 4300 -> 15% discount,  4300.00, 0.1800,  0.00,  774.00, 5074.00, 0.1500, 761.10, 4312.90",
        "TC-06 KAZ 80 + 10 deliv -> 0%,     80.00, 0.2000, 10.00,   16.00,   96.00, 0.0000,   0.00,  106.00",
        "TC-07 UKR 100 -> 3% discount,     100.00, 0.0800,  0.00,    8.00,  108.00, 0.0300,   3.24,  104.76",
        "TC-08 GEO 1000 -> 10% discount,  1000.00, 0.1200,  0.00,  120.00, 1120.00, 0.1000, 112.00, 1008.00",
        "TC-09 CHN 100 -> 3% discount,     100.00, 0.1800,  0.00,   18.00,  118.00, 0.0300,   3.54,  114.46",
        "TC-10 UZB 500 -> 5% discount,     500.00, 0.1500,  0.00,   75.00,  575.00, 0.0500,  28.75,  546.25",
        "TC-11 UKR 600 -> 5% discount,     600.00, 0.0800,  0.00,   48.00,  648.00, 0.0500,  32.40,  615.60",
        "TC-12 KAZ 4000 -> 10% (<5000),   4000.00, 0.2000,  0.00,  800.00, 4800.00, 0.1000, 480.00, 4320.00",
        "TC-13 KAZ 583.33 -> exact 700,    583.33, 0.2000,  0.00,  116.67,  700.00, 0.0700,  49.00,  651.00",
        "TC-14 KAZ 583.32 -> 699.98 (5%),  583.32, 0.2000,  0.00,  116.66,  699.98, 0.0500,  35.00,  664.98",
        "TC-15 UZB (100+20)x2 = 240,       240.00, 0.1500,  0.00,   36.00,  276.00, 0.0300,   8.28,  267.72"
    })
    void verifiesCoreFormulaCases(
            String label, BigDecimal subtotal, BigDecimal vatRate, BigDecimal deliveryFee,
            BigDecimal expectedVat, BigDecimal expectedInclVat,
            BigDecimal expectedDiscountRate, BigDecimal expectedDiscount, BigDecimal expectedTotal) {
        PriceBreakdown result = calculator.calculate(subtotal, vatRate, RATE_ONE, deliveryFee);

        assertThat(result.vatAmount()).as("%s vatAmount", label).isEqualByComparingTo(expectedVat);
        assertThat(result.amountInclVat()).as("%s amountInclVat", label).isEqualByComparingTo(expectedInclVat);
        assertThat(result.discountRate()).as("%s discountRate", label).isEqualByComparingTo(expectedDiscountRate);
        assertThat(result.discountAmount()).as("%s discountAmount", label).isEqualByComparingTo(expectedDiscount);
        assertThat(result.deliveryFee()).as("%s deliveryFee", label).isEqualByComparingTo(deliveryFee);
        assertThat(result.total()).as("%s total", label).isEqualByComparingTo(expectedTotal);
    }

    @DisplayName("CC-16 TC-21: Boundary 100 across all 5 core countries (Below / Exact / Above)")
    @ParameterizedTest(name = "{0} {1}")
    @CsvSource({
        "UZB, Below, 86.95, 0.1500, 13.04,  99.99, 0.0000, 0.00, 99.99",
        "UZB, Exact, 86.96, 0.1500, 13.04, 100.00, 0.0300, 3.00, 97.00",
        "UZB, Above, 86.97, 0.1500, 13.05, 100.02, 0.0300, 3.00, 97.02",
        "KAZ, Below, 83.32, 0.2000, 16.66,  99.98, 0.0000, 0.00, 99.98",
        "KAZ, Exact, 83.33, 0.2000, 16.67, 100.00, 0.0300, 3.00, 97.00",
        "KAZ, Above, 83.34, 0.2000, 16.67, 100.01, 0.0300, 3.00, 97.01",
        "GEO, Below, 89.28, 0.1200, 10.71,  99.99, 0.0000, 0.00, 99.99",
        "GEO, Exact, 89.29, 0.1200, 10.71, 100.00, 0.0300, 3.00, 97.00",
        "GEO, Above, 89.30, 0.1200, 10.72, 100.02, 0.0300, 3.00, 97.02",
        "UKR, Below, 92.58, 0.0800,  7.41,  99.99, 0.0000, 0.00, 99.99",
        "UKR, Exact, 92.59, 0.0800,  7.41, 100.00, 0.0300, 3.00, 97.00",
        "UKR, Above, 92.60, 0.0800,  7.41, 100.01, 0.0300, 3.00, 97.01",
        "CHN, Below, 84.74, 0.1800, 15.25,  99.99, 0.0000, 0.00, 99.99",
        "CHN, Above, 84.75, 0.1800, 15.26, 100.01, 0.0300, 3.00, 97.01"
    })
    void verifiesCountry100ThresholdBoundaries(
            String country, String boundary, BigDecimal subtotal, BigDecimal vatRate,
            BigDecimal expectedVat, BigDecimal expectedInclVat,
            BigDecimal expectedDiscountRate, BigDecimal expectedDiscount, BigDecimal expectedTotal) {
        PriceBreakdown result = calculator.calculate(subtotal, vatRate, RATE_ONE, NO_DELIVERY);

        assertThat(result.vatAmount()).as("%s %s vat", country, boundary).isEqualByComparingTo(expectedVat);
        assertThat(result.amountInclVat()).as("%s %s inclVat", country, boundary).isEqualByComparingTo(expectedInclVat);
        assertThat(result.discountRate()).isEqualByComparingTo(expectedDiscountRate);
        assertThat(result.discountAmount()).isEqualByComparingTo(expectedDiscount);
        assertThat(result.total()).isEqualByComparingTo(expectedTotal);
    }

    @Test
    @DisplayName("CC-16 TC-22: Composite MULTI modifiers combined into line subtotal")
    void verifiesCompositeMultiModifierCalculation() {
        // Cherry Cake (120) + Medium Size (40) + Fresh cherries (8) + Chocolate drip (6) = 174.00
        BigDecimal unitPrice = new BigDecimal("120.00");
        BigDecimal multiModifiers = new BigDecimal("40.00")
                .add(new BigDecimal("8.00"))
                .add(new BigDecimal("6.00"));
        BigDecimal subtotal = unitPrice.add(multiModifiers);

        PriceBreakdown result = calculator.calculate(subtotal, new BigDecimal("0.1500"), RATE_ONE, NO_DELIVERY);

        assertThat(result.subtotal()).isEqualByComparingTo("174.00");
        assertThat(result.vatAmount()).isEqualByComparingTo("26.10");
        assertThat(result.amountInclVat()).isEqualByComparingTo("200.10");
        assertThat(result.discountRate()).isEqualByComparingTo("0.0300");
        assertThat(result.discountAmount()).isEqualByComparingTo("6.00");
        assertThat(result.total()).isEqualByComparingTo("194.10");
    }

    @DisplayName("CC-16 TC-23: Switching country recalculates same cart with regional VAT")
    @ParameterizedTest(name = "{0} -> total {4}")
    @CsvSource({
        "UZB, 0.1500, 15.00, 115.00, 3.45, 111.55",
        "KAZ, 0.2000, 20.00, 120.00, 3.60, 116.40",
        "GEO, 0.1200, 12.00, 112.00, 3.36, 108.64",
        "UKR, 0.0800,  8.00, 108.00, 3.24, 104.76",
        "CHN, 0.1800, 18.00, 118.00, 3.54, 114.46"
    })
    void verifiesCountrySwitchForSameCart(
            String country, BigDecimal vatRate,
            BigDecimal expectedVat, BigDecimal expectedInclVat, BigDecimal expectedDiscount, BigDecimal expectedTotal) {
        PriceBreakdown result = calculator.calculate(new BigDecimal("100.00"), vatRate, RATE_ONE, NO_DELIVERY);

        assertThat(result.vatAmount()).as(country).isEqualByComparingTo(expectedVat);
        assertThat(result.amountInclVat()).as(country).isEqualByComparingTo(expectedInclVat);
        assertThat(result.discountAmount()).as(country).isEqualByComparingTo(expectedDiscount);
        assertThat(result.total()).as(country).isEqualByComparingTo(expectedTotal);
    }

    @Test
    @DisplayName("CC-16 TC-24: Delivery fee added after discount without affecting discount tier")
    void verifiesDeliveryCombinedWithDiscount() {
        PriceBreakdown result = calculator.calculate(
                new BigDecimal("1000.00"), new BigDecimal("0.1500"), RATE_ONE, new BigDecimal("25.00"));

        assertThat(result.vatAmount()).isEqualByComparingTo("150.00");
        assertThat(result.amountInclVat()).isEqualByComparingTo("1150.00");
        assertThat(result.discountRate()).isEqualByComparingTo("0.1000");
        assertThat(result.discountAmount()).isEqualByComparingTo("115.00");
        assertThat(result.deliveryFee()).isEqualByComparingTo("25.00");
        assertThat(result.total()).isEqualByComparingTo("1060.00");
    }

    @Test
    @DisplayName("CC-16 TC-25: Step-by-step HALF_UP rounding on borderline fractions")
    void verifiesHalfUpRoundingAfterEachStep() {
        PriceBreakdown result = calculator.calculate(
                new BigDecimal("87.39"), new BigDecimal("0.1500"), RATE_ONE, NO_DELIVERY);

        assertThat(result.vatAmount()).isEqualByComparingTo("13.11");
        assertThat(result.amountInclVat()).isEqualByComparingTo("100.50");
        assertThat(result.discountRate()).isEqualByComparingTo("0.0300");
        assertThat(result.discountAmount()).isEqualByComparingTo("3.02");
        assertThat(result.total()).isEqualByComparingTo("97.48");
    }

    private static DiscountRule rule(String threshold, String rate) {
        return new DiscountRule(new BigDecimal(threshold), new BigDecimal(rate));
    }
}
