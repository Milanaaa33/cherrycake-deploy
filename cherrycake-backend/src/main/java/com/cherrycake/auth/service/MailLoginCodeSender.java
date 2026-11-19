package com.cherrycake.auth.service;

import com.cherrycake.common.exception.ServiceUnavailableException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.stereotype.Component;

/**
 * Sends the code by SMTP when the mail server is configured (SPRING_MAIL_HOST is set).
 * Without it nothing is sent and the code is written to the backend log, so sign-in
 * can be tried locally without any mail account.
 */
@Component
public class MailLoginCodeSender implements LoginCodeSender {

    private static final Logger log = LoggerFactory.getLogger(MailLoginCodeSender.class);

    private final ObjectProvider<JavaMailSender> mailSender;
    private final String from;

    // Yandex (and most providers) only accept a sender equal to the login, so MAIL_FROM falls back to the username.
    public MailLoginCodeSender(
            ObjectProvider<JavaMailSender> mailSender,
            @Value("${app.mail.from:}") String from,
            @Value("${spring.mail.username:}") String username) {
        this.mailSender = mailSender;
        this.from = from.isBlank() ? username : from;
    }

    @Override
    public void send(String email, String code) {
        JavaMailSender sender = mailSender.getIfAvailable();
        boolean blankHost = sender instanceof JavaMailSenderImpl impl
                && (impl.getHost() == null || impl.getHost().isBlank());
        if (sender == null || blankHost) {
            log.warn("Mail server is not configured (SPRING_MAIL_HOST is empty). Sign-in code for {}: {}", email, code);
            return;
        }

        SimpleMailMessage message = new SimpleMailMessage();
        if (!from.isBlank()) {
            message.setFrom(from);
        }
        message.setTo(email);
        message.setSubject(code + " is your Cherry Cake sign-in code");
        message.setText("Your Cherry Cake sign-in code: " + code
                + "\n\nIt is valid for 10 minutes. If you did not request it, just ignore this email.");
        try {
            sender.send(message);
        } catch (MailException ex) {
            log.error("Could not send the sign-in email to {}", email, ex);
            throw new ServiceUnavailableException("Could not send the email. Please try again later.");
        }
    }
}
