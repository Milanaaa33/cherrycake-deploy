package com.cherrycake.auth.service;

import com.cherrycake.mail.CherryCakeEmailTemplates;
import com.cherrycake.mail.CherryCakeMailService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * Delivers the sign-in code using the branded Dark Cherry Cake HTML + text email template.
 */
@Component
public class MailLoginCodeSender implements LoginCodeSender {

    private final CherryCakeMailService mailService;
    private final String appPublicUrl;

    public MailLoginCodeSender(
            CherryCakeMailService mailService,
            @Value("${app.public-url:http://localhost:5173}") String appPublicUrl) {
        this.mailService = mailService;
        this.appPublicUrl = appPublicUrl;
    }

    @Override
    public void send(String email, String code) {
        mailService.sendRequired(
                email,
                CherryCakeEmailTemplates.loginCode(email, code, appPublicUrl),
                "sign-in code");
    }
}
