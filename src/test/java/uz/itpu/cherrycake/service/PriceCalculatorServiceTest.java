package uz.itpu.cherrycake.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import uz.itpu.cherrycake.dto.request.CartCalculateRequest;
import uz.itpu.cherrycake.dto.request.CartItemDto;
import uz.itpu.cherrycake.dto.response.CartCalculateResponse;
import uz.itpu.cherrycake.model.entity.*;
import uz.itpu.cherrycake.model.enums.DiscountType;
import uz.itpu.cherrycake.model.enums.OrderType;
import uz.itpu.cherrycake.repository.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PriceCalculatorServiceTest
{
    @Mock
    private RegionRepository regionRepository;
    @Mock
    private ProductRepository productRepository;
    @Mock
    private ProductPriceRepository productPriceRepository;
    @Mock
    private ProductModifierRepository productModifierRepository;
    @Mock
    private DiscountRepository discountRepository;
    @Mock
    private DeliveryZoneRepository deliveryZoneRepository;

    @InjectMocks
    private PriceCalculatorService priceCalculatorService;

    private Region uzbekistan;
    private Region georgia;
    private Region ukraine;
    private Product cake;
    private ProductPrice uzbCakePrice;
    private ProductPrice geoCakePrice;
    private ProductPrice ukrCakePrice;
    private ProductModifier extraCompote;

    @BeforeEach
    void setUp()
    {
        // Stage 3 Reference Table: UZB VAT = 15%, GEO VAT = 12%, UKR VAT = 8%
        uzbekistan = Region.builder()
            .id(1L)
            .code("UZB")
            .name("Uzbekistan")
            .currencyCode("UZS")
            .currencySymbol("soʻm")
            .vatRate(new BigDecimal("15.00"))
            .active(true)
            .build();

        georgia = Region.builder()
            .id(3L)
            .code("GEO")
            .name("Georgia")
            .currencyCode("GEL")
            .currencySymbol("₾")
            .vatRate(new BigDecimal("12.00"))
            .active(true)
            .build();

        ukraine = Region.builder()
            .id(4L)
            .code("UKR")
            .name("Ukraine")
            .currencyCode("UAH")
            .currencySymbol("₴")
            .vatRate(new BigDecimal("8.00"))
            .active(true)
            .build();

        cake = Product.builder()
            .id(10L)
            .code("CHERRY_BLOSSOM")
            .name("Cherry Blossom Signature Cake")
            .available(true)
            .build();

        uzbCakePrice = ProductPrice.builder()
            .id(100L)
            .product(cake)
            .region(uzbekistan)
            .price(new BigDecimal("200000.00"))
            .build();

        geoCakePrice = ProductPrice.builder()
            .id(101L)
            .product(cake)
            .region(georgia)
            .price(new BigDecimal("45.00"))
            .build();

        ukrCakePrice = ProductPrice.builder()
            .id(102L)
            .product(cake)
            .region(ukraine)
            .price(new BigDecimal("650.00"))
            .build();

        extraCompote = ProductModifier.builder()
            .id(50L)
            .product(cake)
            .name("Extra Cherry Compote")
            .priceDelta(new BigDecimal("15000.00"))
            .build();
    }

    @Test
    @DisplayName("Stage 3: Should calculate Subtotal, UZB 15% VAT, and Total")
    void testBasicCalculationUzbekistan()
    {
        // Given
        when(regionRepository.findByCodeIgnoreCase("UZB")).thenReturn(Optional.of(uzbekistan));
        when(productRepository.findById(10L)).thenReturn(Optional.of(cake));
        when(productPriceRepository.findByProductIdAndRegionId(10L, 1L)).thenReturn(Optional.of(uzbCakePrice));
        when(discountRepository.findByDiscountTypeAndActiveTrue(DiscountType.THRESHOLD)).thenReturn(List.of());

        CartCalculateRequest request = CartCalculateRequest.builder()
            .regionCode("UZB")
            .orderType(OrderType.PICKUP)
            .items(List.of(CartItemDto.builder().productId(10L).quantity(2).build()))
            .build();

        // When
        CartCalculateResponse response = priceCalculatorService.calculateCart(request);

        // Then
        // Subtotal = 200,000 * 2 = 400,000.00
        // VAT = 400,000 * 15% = 60,000.00
        // Amount_incl_VAT = 400,000 + 60,000 = 460,000.00
        // Total = 460,000.00
        assertThat(response.getCurrency()).isEqualTo("UZS");
        assertThat(response.getSubtotal()).isEqualByComparingTo(new BigDecimal("400000.00"));
        assertThat(response.getVatRate()).isEqualByComparingTo(new BigDecimal("15.00"));
        assertThat(response.getVatAmount()).isEqualByComparingTo(new BigDecimal("60000.00"));
        assertThat(response.getAmountInclVat()).isEqualByComparingTo(new BigDecimal("460000.00"));
        assertThat(response.getDiscountAmount()).isEqualByComparingTo(BigDecimal.ZERO);
        assertThat(response.getFinalTotal()).isEqualByComparingTo(new BigDecimal("460000.00"));
    }

    @Test
    @DisplayName("Stage 3: Threshold discount applied on Amount_incl_VAT (Cost >= 700 -> 7% discount)")
    void testStage3ThresholdDiscountOnAmountInclVat()
    {
        // Given
        when(regionRepository.findByCodeIgnoreCase("UKR")).thenReturn(Optional.of(ukraine));
        when(productRepository.findById(10L)).thenReturn(Optional.of(cake));
        when(productPriceRepository.findByProductIdAndRegionId(10L, 4L)).thenReturn(Optional.of(ukrCakePrice));

        // Threshold tier: >= 700.00 -> 7%
        Discount threshold7 = Discount.builder()
            .id(3L)
            .name("Tier 3 (Cost >= 700)")
            .discountType(DiscountType.THRESHOLD)
            .minSubtotal(new BigDecimal("700.00"))
            .percentage(new BigDecimal("7.00"))
            .active(true)
            .build();
        when(discountRepository.findByDiscountTypeAndActiveTrue(DiscountType.THRESHOLD)).thenReturn(List.of(threshold7));

        CartCalculateRequest request = CartCalculateRequest.builder()
            .regionCode("UKR")
            .orderType(OrderType.PICKUP)
            .items(List.of(CartItemDto.builder().productId(10L).quantity(1).build()))
            .build();

        // When
        CartCalculateResponse response = priceCalculatorService.calculateCart(request);

        // Then
        // Subtotal = 650.00
        // VAT = 650.00 * 8% = 52.00
        // Amount_incl_VAT = 650.00 + 52.00 = 702.00
        // Since 702.00 >= 700.00, Tier 3 threshold discount (7%) activates!
        // Discount = 702.00 * 7% = 49.14
        // Total = 702.00 - 49.14 = 652.86
        assertThat(response.getSubtotal()).isEqualByComparingTo(new BigDecimal("650.00"));
        assertThat(response.getVatRate()).isEqualByComparingTo(new BigDecimal("8.00"));
        assertThat(response.getVatAmount()).isEqualByComparingTo(new BigDecimal("52.00"));
        assertThat(response.getAmountInclVat()).isEqualByComparingTo(new BigDecimal("702.00"));
        assertThat(response.getDiscountRate()).isEqualByComparingTo(new BigDecimal("7.00"));
        assertThat(response.getDiscountAmount()).isEqualByComparingTo(new BigDecimal("49.14"));
        assertThat(response.getFinalTotal()).isEqualByComparingTo(new BigDecimal("652.86"));
    }

    @Test
    @DisplayName("Stage 4: Delivery fee is added last and does not affect discount threshold")
    void testDeliveryFeeAddedLast()
    {
        // Given
        when(regionRepository.findByCodeIgnoreCase("GEO")).thenReturn(Optional.of(georgia));
        when(productRepository.findById(10L)).thenReturn(Optional.of(cake));
        when(productPriceRepository.findByProductIdAndRegionId(10L, 3L)).thenReturn(Optional.of(geoCakePrice));
        when(discountRepository.findByDiscountTypeAndActiveTrue(DiscountType.THRESHOLD)).thenReturn(List.of());

        DeliveryZone geoZone = DeliveryZone.builder()
            .id(77L)
            .region(georgia)
            .name("Tbilisi Central")
            .deliveryFee(new BigDecimal("6.00"))
            .build();
        when(deliveryZoneRepository.findById(77L)).thenReturn(Optional.of(geoZone));

        CartCalculateRequest request = CartCalculateRequest.builder()
            .regionCode("GEO")
            .orderType(OrderType.DELIVERY)
            .deliveryZoneId(77L)
            .items(List.of(CartItemDto.builder().productId(10L).quantity(2).build()))
            .build();

        // When
        CartCalculateResponse response = priceCalculatorService.calculateCart(request);

        // Then
        // Subtotal = 90.00 GEL
        // VAT = 90.00 * 12% = 10.80 GEL
        // Amount_incl_VAT = 100.80 GEL
        // Delivery fee = 6.00 GEL (applied last)
        // Total = 100.80 + 6.00 = 106.80 GEL
        assertThat(response.getCurrency()).isEqualTo("GEL");
        assertThat(response.getSubtotal()).isEqualByComparingTo(new BigDecimal("90.00"));
        assertThat(response.getVatAmount()).isEqualByComparingTo(new BigDecimal("10.80"));
        assertThat(response.getAmountInclVat()).isEqualByComparingTo(new BigDecimal("100.80"));
        assertThat(response.getDeliveryFee()).isEqualByComparingTo(new BigDecimal("6.00"));
        assertThat(response.getFinalTotal()).isEqualByComparingTo(new BigDecimal("106.80"));
    }
}