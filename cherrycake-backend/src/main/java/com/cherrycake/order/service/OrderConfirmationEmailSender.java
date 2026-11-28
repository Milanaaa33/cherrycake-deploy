package com.cherrycake.order.service;

import com.cherrycake.mail.CherryCakeEmailTemplates;
import com.cherrycake.mail.CherryCakeEmailTemplates.OrderEmailDetails;
import com.cherrycake.mail.CherryCakeMailService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * Dispatches detailed Dark Cherry Cake order receipt emails after an order commits.
 */
@Component
public class OrderConfirmationEmailSender {

    private final CherryCakeMailService mailService;
    private final String appPublicUrl;

    public OrderConfirmationEmailSender(
            CherryCakeMailService mailService,
            @Value("${app.public-url:http://localhost:5173}") String appPublicUrl) {
        this.mailService = mailService;
        this.appPublicUrl = appPublicUrl;
    }

    public void sendOrderConfirmation(OrderEmailDetails details) {
        String email = details.order().customer().email();
        mailService.sendBestEffortAsync(
                email,
                CherryCakeEmailTemplates.orderConfirmation(details, appPublicUrl),
                "order confirmation " + details.order().orderNumber());
    }
}
