package com.cherrycake.mail;

import static org.assertj.core.api.Assertions.assertThat;

import com.cherrycake.fulfillment.entity.FulfillmentType;
import com.cherrycake.mail.CherryCakeEmailTemplates.OrderEmailDetails;
import com.cherrycake.mail.CherryCakeEmailTemplates.RenderedEmail;
import com.cherrycake.order.dto.OrderResponse;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import org.junit.jupiter.api.Test;

class CherryCakeEmailTemplatesTests {

    @Test
    void rendersDarkCherryCakeLoginCodeEmailWithSixDigitLetterboxes() {
        RenderedEmail rendered = CherryCakeEmailTemplates.loginCode(
                "adrian@example.com",
                "482913",
                "https://cherrycake.uz/");

        assertThat(rendered.subject()).isEqualTo("482913 is your Cherry Cake sign-in code");
        assertThat(rendered.html())
                .contains("#0f050c")
                .contains("#1a0915")
                .contains("Hello There!")
                .contains("cid:cherryLogo")
                .contains("width:48px;height:58px;line-height:58px")
                .contains(">4<")
                .contains(">8<")
                .contains(">2<")
                .contains(">9<")
                .contains(">1<")
                .contains(">3<")
                .doesNotContain("5 MIN")
                .contains("adrian@example.com")
                .contains("5 minutes &middot; Single-use")
                .contains("https://cherrycake.uz/account?email=adrian%40example.com&amp;step=code")
                .contains("https://cherrycake.uz/account?email=adrian%40example.com&amp;code=482913")
                .contains("Enter Code &amp; Sign In")
                .contains("Autofill Code");
        assertThat(rendered.text())
                .contains("482913")
                .contains("5 minutes")
                .contains("https://cherrycake.uz/account?email=adrian%40example.com&step=code")
                .contains("https://cherrycake.uz/account?email=adrian%40example.com&code=482913");
    }

    @Test
    void rendersDetailedDarkCherryCakeOrderConfirmationAndEscapesHtml() {
        OrderResponse order = new OrderResponse(
                "CC-2026-000042",
                LocalDate.of(2026, 11, 29),
                "GEO",
                new OrderResponse.Customer("Adrian <Finch>", "+998977483161", "adrian@example.com"),
                List.of(
                        new OrderResponse.Item(
                                3L,
                                "Red Velvet Cake",
                                new BigDecimal("89.38"),
                                new BigDecimal("9.10"),
                                1,
                                new BigDecimal("98.48")),
                        new OrderResponse.Item(
                                11L,
                                "Latte",
                                new BigDecimal("10.73"),
                                new BigDecimal("6.51"),
                                2,
                                new BigDecimal("34.48"))),
                new BigDecimal("132.96"),
                new BigDecimal("0.12"),
                new BigDecimal("15.96"),
                new BigDecimal("148.92"),
                new BigDecimal("0.03"),
                new BigDecimal("4.47"),
                new BigDecimal("3.25"),
                new BigDecimal("147.70"),
                "GEL",
                LocalDateTime.of(2026, 11, 29, 0, 5),
                FulfillmentType.DELIVERY,
                null,
                1L,
                2L);

        RenderedEmail rendered = CherryCakeEmailTemplates.orderConfirmation(
                new OrderEmailDetails(order, "City Center", "16:00-17:00"),
                "http://localhost:5173");

        assertThat(rendered.subject()).isEqualTo("Order CC-2026-000042 confirmed — Cherry Cake");
        assertThat(rendered.html())
                .contains("#0f050c")
                .contains("#1a0915")
                .contains("cid:cherryLogo")
                .contains("CC-2026-000042")
                .contains("CONFIRMED")
                .contains("Adrian &lt;Finch&gt;")
                .contains("Courier Delivery")
                .contains("City Center")
                .contains("16:00-17:00")
                .contains("Red Velvet Cake")
                .contains("Latte")
                .contains("VAT (12%)")
                .contains("Discount (3%)")
                .contains("147.70 GEL")
                .contains("http://localhost:5173/account")
                .doesNotContain("<Finch>");
        assertThat(rendered.text())
                .contains("CC-2026-000042")
                .contains("Red Velvet Cake x 1 = 98.48 GEL")
                .contains("Total: 147.70 GEL");
    }
}
