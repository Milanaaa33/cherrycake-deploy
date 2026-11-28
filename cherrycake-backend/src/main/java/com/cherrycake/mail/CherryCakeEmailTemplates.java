package com.cherrycake.mail;

import com.cherrycake.fulfillment.entity.FulfillmentType;
import com.cherrycake.order.dto.OrderResponse;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.DecimalFormat;
import java.text.DecimalFormatSymbols;
import java.util.Locale;

/**
 * Renders branded Dark Cherry Cake HTML and plain-text transactional emails.
 */
public final class CherryCakeEmailTemplates {

    private static final String DEFAULT_APP_URL = "http://localhost:5173";

    private CherryCakeEmailTemplates() {
    }

    public record RenderedEmail(String subject, String html, String text) {
    }

    public record OrderEmailDetails(
            OrderResponse order,
            String locationLabel,
            String timeSlotLabel) {
    }

    public static RenderedEmail loginCode(String email, String code, String appUrl) {
        String safeEmail = escapeHtml(email);
        String baseUrl = normalizeBaseUrl(appUrl);
        String encodedEmail = encodeParam(email);
        String encodedCode = encodeParam(code);
        String enterCodeUrl = baseUrl + "/account?email=" + encodedEmail + "&step=code";
        String autofillUrl = baseUrl + "/account?email=" + encodedEmail + "&code=" + encodedCode;

        String subject = code + " is your Cherry Cake sign-in code";
        String preheader = "Your Cherry Cake verification code is " + code + ". Valid for 5 minutes.";

        String hero = ""
                + "<p style=\"margin:0 0 18px;text-align:center;font-size:16px;font-weight:600;color:#f3d6e0;\">Hello There!</p>"
                + digitBoxes(code)
                + "<p style=\"margin:18px 0 4px;text-align:center;font-size:17px;font-weight:700;color:#fdf2f5;line-height:1.35;\">"
                + "Sign-in verification code"
                + "</p>"
                + "<p style=\"margin:0;text-align:center;font-size:12.5px;color:#b894a3;line-height:1.5;\">"
                + "Enter these 6 digits on Cherry Cake, or use the quick sign-in buttons below."
                + "</p>";

        String detailsBox = ""
                + "<table role=\"presentation\" width=\"100%\" cellspacing=\"0\" cellpadding=\"0\" border=\"0\" style=\"background-color:#130610;border:1px solid #3f1b36;border-radius:12px;\">"
                + "  <tr>"
                + "    <td style=\"padding:16px 18px;\">"
                + detailPair("Account", "<a href=\"mailto:" + safeEmail + "\" style=\"color:#fdf2f5;text-decoration:none;\">" + safeEmail + "</a>")
                + detailPair("Validity", "<span style=\"color:#ffb7c5;\">5 minutes &middot; Single-use</span>")
                + detailPair("Destination", "Cherry Cake Account &amp; Orders", true)
                + "    </td>"
                + "  </tr>"
                + "</table>";

        String cta = dualCtaButtons(
                enterCodeUrl, "Enter Code &amp; Sign In &rarr;",
                autofillUrl, "Autofill Code");

        String infoRows = ""
                + infoRow("&#9201;", "Expires in 5 minutes",
                        "For your security, this verification code expires automatically after 5 minutes. Never share it with anyone.")
                + infoRow("!", "Didn't request this code?",
                        "Someone entered your email on Cherry Cake. If this wasn't you, you can safely ignore this message — your account remains protected.");

        String html = wrapDarkShell(preheader, "SECURITY &amp; ACCESS", hero, detailsBox + cta, infoRows);

        String text = "Your Cherry Cake sign-in code: " + code
                + "\n\nAccount: " + email
                + "\nIt is valid for 5 minutes."
                + "\nEnter your code here: " + enterCodeUrl
                + "\nOr autofill directly: " + autofillUrl
                + "\n\nIf you did not request this code, just ignore this email.";

        return new RenderedEmail(subject, html, text);
    }

    public static RenderedEmail orderConfirmation(OrderEmailDetails details, String appUrl) {
        OrderResponse order = details.order();
        String accountUrl = normalizeBaseUrl(appUrl) + "/account";
        String customerName = order.customer().name();
        String customerPhone = order.customer().phone();
        String customerEmail = order.customer().email();
        String totalFormatted = formatMoney(order.total(), order.currencyCode());

        String subject = "Order " + order.orderNumber() + " confirmed — Cherry Cake";
        String preheader = "Thank you for your Cherry Cake order " + order.orderNumber()
                + "! Total: " + totalFormatted;

        String fulfillmentSummary;
        if (order.fulfillmentType() == FulfillmentType.DELIVERY) {
            fulfillmentSummary = "Courier Delivery"
                    + (details.locationLabel() != null && !details.locationLabel().isBlank()
                    ? " &middot; " + escapeHtml(details.locationLabel())
                    : "");
        } else if (order.fulfillmentType() == FulfillmentType.PICKUP) {
            fulfillmentSummary = "Café Pickup"
                    + (details.locationLabel() != null && !details.locationLabel().isBlank()
                    ? " &middot; " + escapeHtml(details.locationLabel())
                    : "");
        } else {
            fulfillmentSummary = "Cherry Cake Order";
        }

        String dateAndTime = escapeHtml(order.orderDate() != null ? order.orderDate().toString() : "")
                + (details.timeSlotLabel() != null && !details.timeSlotLabel().isBlank()
                ? " &middot; " + escapeHtml(details.timeSlotLabel())
                : "");

        String hero = ""
                + "<p style=\"margin:0 0 14px;font-size:15px;color:#e6c4d1;\">Thank you, "
                + escapeHtml(customerName) + "!</p>"
                + "<table role=\"presentation\" width=\"100%\" cellspacing=\"0\" cellpadding=\"0\" border=\"0\" style=\"background-color:#120610;border:1px solid #355846;border-radius:14px;\">"
                + "  <tr>"
                + "    <td style=\"padding:16px 18px;vertical-align:middle;\">"
                + "      <table role=\"presentation\" width=\"100%\" cellspacing=\"0\" cellpadding=\"0\" border=\"0\">"
                + "        <tr>"
                + "          <td style=\"width:40px;vertical-align:middle;\">"
                + "            <div style=\"width:40px;height:40px;border-radius:10px;background-color:#2f9e66;text-align:center;line-height:40px;color:#ffffff;font-size:20px;font-weight:700;\">&#10003;</div>"
                + "          </td>"
                + "          <td style=\"padding-left:14px;vertical-align:middle;font-family:'Courier New',Courier,monospace;font-size:22px;font-weight:800;letter-spacing:1px;color:#ffffff;line-height:1.15;user-select:all;-webkit-user-select:all;\">"
                + escapeHtml(order.orderNumber())
                + "</td>"
                + "          <td align=\"right\" style=\"vertical-align:middle;white-space:nowrap;\">"
                + "            <span style=\"display:inline-block;padding:5px 10px;border-radius:999px;background-color:#163626;border:1px solid #2f9e66;color:#8fe3b0;font-size:10px;font-weight:700;letter-spacing:0.8px;\">CONFIRMED</span>"
                + "          </td>"
                + "        </tr>"
                + "      </table>"
                + "    </td>"
                + "  </tr>"
                + "</table>"
                + "<p style=\"margin:16px 0 0;font-size:16px;font-weight:700;color:#fdf2f5;line-height:1.4;\">"
                + "Order confirmed — freshly crafted with love"
                + "</p>";

        String detailsBox = ""
                + "<table role=\"presentation\" width=\"100%\" cellspacing=\"0\" cellpadding=\"0\" border=\"0\" style=\"background-color:#130610;border:1px solid #3f1b36;border-radius:12px;\">"
                + "  <tr>"
                + "    <td style=\"padding:16px 18px;\">"
                + detailPair("Fulfillment", fulfillmentSummary)
                + detailPair("Schedule", dateAndTime)
                + detailPair("Contact", escapeHtml(customerName) + " &middot; " + escapeHtml(customerPhone))
                + detailPair(
                        "Email &amp; Region",
                        "<a href=\"mailto:" + escapeHtml(customerEmail) + "\" style=\"color:#fdf2f5;text-decoration:none;\">"
                                + escapeHtml(customerEmail) + "</a> &middot; " + escapeHtml(order.region()),
                        true)
                + "    </td>"
                + "  </tr>"
                + "</table>";

        StringBuilder itemsRows = new StringBuilder();
        for (int i = 0; i < order.items().size(); i++) {
            OrderResponse.Item item = order.items().get(i);
            String borderBottom = i < order.items().size() - 1 ? "border-bottom:1px solid #35142d;" : "";
            String unitText = "&times; " + item.quantity() + " &middot; "
                    + escapeHtml(formatMoney(item.unitPrice(), order.currencyCode())) + " each";
            String modifiersLine = item.modifiersPrice() != null && item.modifiersPrice().compareTo(BigDecimal.ZERO) > 0
                    ? "<div style=\"font-size:11px;color:#b894a3;margin-top:2px;\">Options: +"
                    + escapeHtml(formatMoney(item.modifiersPrice(), order.currencyCode())) + " each</div>"
                    : "";

            itemsRows.append(""
                    + "<tr>"
                    + "  <td style=\"padding:11px 0;" + borderBottom + "vertical-align:top;\">"
                    + "    <div style=\"font-size:14px;font-weight:700;color:#fdf2f5;\">" + escapeHtml(item.productName()) + "</div>"
                    + "    <div style=\"font-size:12px;color:#c9a8b8;margin-top:2px;\">" + unitText + "</div>"
                    + modifiersLine
                    + "  </td>"
                    + "  <td style=\"padding:11px 0;" + borderBottom + "vertical-align:top;text-align:right;white-space:nowrap;font-size:14px;font-weight:700;color:#fdf2f5;\">"
                    + escapeHtml(formatMoney(item.lineTotal(), order.currencyCode()))
                    + "  </td>"
                    + "</tr>");
        }

        int vatPct = percent(order.vatRate());
        int discountPct = percent(order.discountRate());

        StringBuilder totalsRows = new StringBuilder();
        totalsRows.append(summaryLine("Subtotal", formatMoney(order.subtotal(), order.currencyCode()), "#c9a8b8", "#fdf2f5"));
        totalsRows.append(summaryLine("VAT (" + vatPct + "%)", formatMoney(order.vatAmount(), order.currencyCode()), "#c9a8b8", "#fdf2f5"));
        if (order.discountAmount() != null && order.discountAmount().compareTo(BigDecimal.ZERO) > 0) {
            totalsRows.append(summaryLine(
                    "Discount (" + discountPct + "%)",
                    "-" + formatMoney(order.discountAmount(), order.currencyCode()),
                    "#c9a8b8",
                    "#ffb7c5"));
        }
        if (order.deliveryFee() != null && order.deliveryFee().compareTo(BigDecimal.ZERO) > 0) {
            totalsRows.append(summaryLine(
                    "Delivery",
                    formatMoney(order.deliveryFee(), order.currencyCode()),
                    "#c9a8b8",
                    "#fdf2f5"));
        }

        String receiptSection = ""
                + "<div style=\"margin:22px 0 8px;font-size:11px;font-weight:700;letter-spacing:1.8px;text-transform:uppercase;color:#ffb7c5;\">"
                + "Order Summary"
                + "</div>"
                + "<table role=\"presentation\" width=\"100%\" cellspacing=\"0\" cellpadding=\"0\" border=\"0\" style=\"background-color:#130610;border:1px solid #3f1b36;border-radius:12px;\">"
                + "  <tr>"
                + "    <td style=\"padding:6px 18px 16px;\">"
                + "      <table role=\"presentation\" width=\"100%\" cellspacing=\"0\" cellpadding=\"0\" border=\"0\">"
                + itemsRows
                + "      </table>"
                + "      <table role=\"presentation\" width=\"100%\" cellspacing=\"0\" cellpadding=\"0\" border=\"0\" style=\"border-top:1px dashed #4d2240;margin-top:8px;padding-top:10px;\">"
                + totalsRows
                + "        <tr>"
                + "          <td style=\"padding:12px 0 0;border-top:1px solid #3c1833;font-size:15px;font-weight:800;color:#fdf2f5;\">TOTAL</td>"
                + "          <td style=\"padding:12px 0 0;border-top:1px solid #3c1833;text-align:right;font-size:20px;font-weight:800;color:#ffb7c5;white-space:nowrap;\">"
                + escapeHtml(totalFormatted)
                + "</td>"
                + "        </tr>"
                + "      </table>"
                + "    </td>"
                + "  </tr>"
                + "</table>";

        String cta = ctaButton(accountUrl, "View Your Order &rarr;");

        String infoRows = ""
                + infoRow("&#9825;", "Freshly made with love",
                        "Our pastry chefs prepare each cake and drink fresh to order. Thank you for celebrating your sweet moment with Cherry Cake!")
                + infoRow("&#9993;", "Track anytime",
                        "Sign in on Cherry Cake with <strong><a href=\"mailto:" + escapeHtml(customerEmail)
                                + "\" style=\"color:#fdf2f5;text-decoration:none;\">" + escapeHtml(customerEmail)
                                + "</a></strong> to view your full order receipt and history on any device.");

        String html = wrapDarkShell(preheader, "ORDER RECEIPT", hero, detailsBox + receiptSection + cta, infoRows);

        StringBuilder text = new StringBuilder();
        text.append("Thank you for your Cherry Cake order, ").append(customerName).append("!\n\n")
                .append("Order number: ").append(order.orderNumber()).append('\n')
                .append("Order date: ").append(order.orderDate());
        if (details.timeSlotLabel() != null && !details.timeSlotLabel().isBlank()) {
            text.append(" (").append(details.timeSlotLabel()).append(')');
        }
        text.append('\n');
        if (order.fulfillmentType() != null) {
            text.append("Fulfillment: ").append(order.fulfillmentType());
            if (details.locationLabel() != null && !details.locationLabel().isBlank()) {
                text.append(" - ").append(details.locationLabel());
            }
            text.append('\n');
        }
        text.append("Region: ").append(order.region()).append("\n\nItems:\n");
        for (OrderResponse.Item item : order.items()) {
            text.append("- ").append(item.productName())
                    .append(" x ").append(item.quantity())
                    .append(" = ").append(formatMoney(item.lineTotal(), order.currencyCode()))
                    .append('\n');
        }
        text.append("\nSubtotal: ").append(formatMoney(order.subtotal(), order.currencyCode()))
                .append("\nVAT (").append(vatPct).append("%): ").append(formatMoney(order.vatAmount(), order.currencyCode()));
        if (order.discountAmount() != null && order.discountAmount().compareTo(BigDecimal.ZERO) > 0) {
            text.append("\nDiscount (").append(discountPct).append("%): -")
                    .append(formatMoney(order.discountAmount(), order.currencyCode()));
        }
        if (order.deliveryFee() != null && order.deliveryFee().compareTo(BigDecimal.ZERO) > 0) {
            text.append("\nDelivery: ").append(formatMoney(order.deliveryFee(), order.currencyCode()));
        }
        text.append("\nTotal: ").append(totalFormatted)
                .append("\n\nView your orders: ").append(accountUrl);

        return new RenderedEmail(subject, html, text.toString());
    }

    private static String wrapDarkShell(
            String preheader,
            String eyebrow,
            String heroContent,
            String bodyContent,
            String infoRows) {
        return "<!DOCTYPE html>"
                + "<html lang=\"en\">"
                + "<head>"
                + "  <meta charset=\"UTF-8\" />"
                + "  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" />"
                + "  <meta name=\"color-scheme\" content=\"dark\" />"
                + "  <meta name=\"supported-color-schemes\" content=\"dark\" />"
                + "  <title>Cherry Cake</title>"
                + "</head>"
                + "<body style=\"margin:0;padding:0;background-color:#0f050c;color:#fdf2f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;\">"
                + "  <div style=\"display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;\">"
                + escapeHtml(preheader)
                + "</div>"
                + "  <table role=\"presentation\" width=\"100%\" cellspacing=\"0\" cellpadding=\"0\" border=\"0\" style=\"background-color:#0f050c;padding:32px 12px;\">"
                + "    <tr>"
                + "      <td align=\"center\">"
                + "        <table role=\"presentation\" width=\"540\" cellspacing=\"0\" cellpadding=\"0\" border=\"0\" style=\"width:100%;max-width:540px;background-color:#1a0915;border:1px solid #381730;border-radius:16px;overflow:hidden;\">"
                + "          <tr>"
                + "            <td style=\"height:3px;font-size:0;line-height:0;background-color:#e63960;background-image:linear-gradient(90deg,#b81d46 0%,#ff5c8a 55%,#f4c77b 100%);\">&nbsp;</td>"
                + "          </tr>"
                + "          <tr>"
                + "            <td style=\"background-color:#2a0d22;background-image:linear-gradient(155deg,#38112d 0%,#1a0915 100%);border-bottom:1px solid #411936;padding:28px 32px 26px;\">"
                + "              <table role=\"presentation\" width=\"100%\" cellspacing=\"0\" cellpadding=\"0\" border=\"0\" style=\"margin-bottom:20px;\">"
                + "                <tr>"
                + "                  <td style=\"width:36px;vertical-align:middle;\">"
                + "                    <img src=\"cid:cherryLogo\" width=\"34\" height=\"34\" alt=\"Cherry Cake\" style=\"display:block;border:0;border-radius:8px;\" />"
                + "                  </td>"
                + "                  <td style=\"padding-left:10px;vertical-align:middle;\">"
                + "                    <div style=\"font-family:Georgia,'Times New Roman',serif;font-size:19px;font-weight:700;color:#fdf2f5;line-height:1.1;\">Cherry Cake</div>"
                + "                    <div style=\"font-size:10px;font-weight:700;letter-spacing:1.8px;text-transform:uppercase;color:#ffb7c5;margin-top:2px;\">"
                + eyebrow
                + "</div>"
                + "                  </td>"
                + "                </tr>"
                + "              </table>"
                + heroContent
                + "            </td>"
                + "          </tr>"
                + "          <tr>"
                + "            <td style=\"padding:24px 32px 24px;background-color:#1a0915;\">"
                + bodyContent
                + "            </td>"
                + "          </tr>"
                + infoRows
                + "          <tr>"
                + "            <td style=\"background-color:#130610;border-top:1px solid #35142d;padding:20px 32px 24px;\">"
                + "              <div style=\"font-size:11px;line-height:1.5;color:#8f6b7b;margin-bottom:14px;\">"
                + "This email was generated automatically by Cherry Cake. Please do not reply to this message."
                + "              </div>"
                + "              <table role=\"presentation\" width=\"100%\" cellspacing=\"0\" cellpadding=\"0\" border=\"0\">"
                + "                <tr>"
                + "                  <td style=\"width:24px;vertical-align:middle;\">"
                + "                    <img src=\"cid:cherryLogo\" width=\"20\" height=\"20\" alt=\"Cherry Cake\" style=\"display:block;border:0;border-radius:4px;\" />"
                + "                  </td>"
                + "                  <td style=\"padding-left:8px;vertical-align:middle;font-size:11px;color:#b894a3;\">"
                + "&copy; 2026 Cherry Cake &middot; Artisan Bakery &amp; Café"
                + "                  </td>"
                + "                </tr>"
                + "              </table>"
                + "            </td>"
                + "          </tr>"
                + "        </table>"
                + "      </td>"
                + "    </tr>"
                + "  </table>"
                + "</body>"
                + "</html>";
    }

    private static String digitBoxes(String code) {
        String raw = code == null ? "" : code.trim();
        StringBuilder cells = new StringBuilder();
        for (int i = 0; i < raw.length(); i++) {
            String ch = escapeHtml(String.valueOf(raw.charAt(i)));
            cells.append(""
                    + "<td style=\"padding:0 4px;vertical-align:middle;\">"
                    + "  <div style=\"width:48px;height:58px;line-height:58px;text-align:center;"
                    + "background-color:#120610;border:1.5px solid #5c264a;border-radius:12px;"
                    + "font-family:'Courier New',Courier,monospace;font-size:28px;font-weight:800;color:#fff6f8;\">"
                    + ch
                    + "</div>"
                    + "</td>");
        }
        return ""
                + "<table role=\"presentation\" width=\"100%\" cellspacing=\"0\" cellpadding=\"0\" border=\"0\">"
                + "  <tr>"
                + "    <td align=\"center\">"
                + "      <table role=\"presentation\" cellspacing=\"0\" cellpadding=\"0\" border=\"0\">"
                + "        <tr>" + cells + "</tr>"
                + "      </table>"
                + "    </td>"
                + "  </tr>"
                + "</table>";
    }

    private static String ctaButton(String url, String labelHtml) {
        return ""
                + "<table role=\"presentation\" width=\"100%\" cellspacing=\"0\" cellpadding=\"0\" border=\"0\" style=\"margin-top:22px;\">"
                + "  <tr>"
                + "    <td align=\"center\">"
                + "      <a href=\"" + escapeHtml(url) + "\" target=\"_blank\" rel=\"noopener\" "
                + "style=\"display:inline-block;background-color:#d62857;color:#ffffff;font-size:14px;font-weight:700;text-decoration:none;padding:13px 30px;border-radius:999px;border:1px solid #f0658a;\">"
                + labelHtml
                + "</a>"
                + "    </td>"
                + "  </tr>"
                + "</table>";
    }

    private static String dualCtaButtons(
            String primaryUrl,
            String primaryLabelHtml,
            String secondaryUrl,
            String secondaryLabelHtml) {
        return ""
                + "<table role=\"presentation\" width=\"100%\" cellspacing=\"0\" cellpadding=\"0\" border=\"0\" style=\"margin-top:22px;\">"
                + "  <tr>"
                + "    <td align=\"center\">"
                + "      <a href=\"" + escapeHtml(primaryUrl) + "\" target=\"_blank\" rel=\"noopener\" "
                + "style=\"display:inline-block;background-color:#d62857;color:#ffffff;font-size:14px;font-weight:700;text-decoration:none;padding:13px 24px;border-radius:999px;border:1px solid #f0658a;margin:4px 5px;\">"
                + primaryLabelHtml
                + "</a>"
                + "      <a href=\"" + escapeHtml(secondaryUrl) + "\" target=\"_blank\" rel=\"noopener\" "
                + "style=\"display:inline-block;background-color:#290e22;color:#ffd6e0;font-size:13.5px;font-weight:700;text-decoration:none;padding:13px 22px;border-radius:999px;border:1px solid #6b2d55;margin:4px 5px;\">"
                + secondaryLabelHtml
                + "</a>"
                + "    </td>"
                + "  </tr>"
                + "</table>";
    }

    private static String infoRow(String iconHtml, String title, String htmlBody) {
        return ""
                + "<tr>"
                + "  <td style=\"border-top:1px solid #35142d;padding:18px 32px;background-color:#1a0915;\">"
                + "    <table role=\"presentation\" width=\"100%\" cellspacing=\"0\" cellpadding=\"0\" border=\"0\">"
                + "      <tr>"
                + "        <td style=\"width:36px;vertical-align:top;padding-top:2px;\">"
                + "          <div style=\"width:32px;height:32px;border-radius:50%;background-color:#2c1024;border:1px solid #4d2240;text-align:center;line-height:32px;color:#ffb7c5;font-size:14px;font-weight:700;\">"
                + iconHtml
                + "</div>"
                + "        </td>"
                + "        <td style=\"padding-left:14px;vertical-align:top;font-size:12.5px;line-height:1.55;color:#c9a8b8;\">"
                + "          <strong style=\"color:#fdf2f5;display:block;margin-bottom:2px;\">" + escapeHtml(title) + "</strong>"
                + htmlBody
                + "        </td>"
                + "      </tr>"
                + "    </table>"
                + "  </td>"
                + "</tr>";
    }

    private static String detailPair(String label, String safeValueHtml) {
        return detailPair(label, safeValueHtml, false);
    }

    private static String detailPair(String label, String safeValueHtml, boolean last) {
        String pad = last ? "0" : "8px";
        return ""
                + "<div style=\"padding-bottom:" + pad + ";font-size:13px;line-height:1.5;\">"
                + "  <span style=\"color:#b894a3;\">" + label + ": </span>"
                + "  <strong style=\"color:#fdf2f5;\">" + safeValueHtml + "</strong>"
                + "</div>";
    }

    private static String summaryLine(String label, String value, String labelColor, String valueColor) {
        return ""
                + "<tr>"
                + "  <td style=\"padding:4px 0;font-size:13px;color:" + labelColor + ";\">" + escapeHtml(label) + "</td>"
                + "  <td style=\"padding:4px 0;text-align:right;font-size:13px;font-weight:600;color:" + valueColor + ";white-space:nowrap;\">"
                + escapeHtml(value) + "</td>"
                + "</tr>";
    }

    private static String normalizeBaseUrl(String appUrl) {
        if (appUrl == null || appUrl.isBlank()) {
            return DEFAULT_APP_URL;
        }
        String trimmed = appUrl.trim();
        return trimmed.endsWith("/") ? trimmed.substring(0, trimmed.length() - 1) : trimmed;
    }

    private static String encodeParam(String value) {
        return URLEncoder.encode(value == null ? "" : value.trim(), StandardCharsets.UTF_8);
    }

    private static int percent(BigDecimal rate) {
        if (rate == null) return 0;
        return rate.multiply(BigDecimal.valueOf(100)).setScale(0, RoundingMode.HALF_UP).intValue();
    }

    static String formatMoney(BigDecimal amount, String currencyCode) {
        BigDecimal safe = amount == null ? BigDecimal.ZERO : amount;
        DecimalFormatSymbols symbols = DecimalFormatSymbols.getInstance(Locale.US);
        DecimalFormat format = new DecimalFormat("#,##0.00", symbols);
        String code = currencyCode == null || currencyCode.isBlank() ? "" : " " + currencyCode.trim();
        return format.format(safe) + code;
    }

    static String escapeHtml(String value) {
        if (value == null) return "";
        StringBuilder out = new StringBuilder(value.length() + 16);
        for (int i = 0; i < value.length(); i++) {
            char c = value.charAt(i);
            switch (c) {
                case '&' -> out.append("&amp;");
                case '<' -> out.append("&lt;");
                case '>' -> out.append("&gt;");
                case '"' -> out.append("&quot;");
                case '\'' -> out.append("&#39;");
                default -> out.append(c);
            }
        }
        return out.toString();
    }
}
