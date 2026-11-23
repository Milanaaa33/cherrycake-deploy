package com.cherrycake.auth.service;

import com.cherrycake.common.exception.ServiceUnavailableException;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.List;
import java.util.Map;
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
 * Delivers the sign-in code, choosing the way by the environment:
 * <ol>
 *   <li>{@code BREVO_API_KEY} is set: HTTPS API of Brevo. Works on hosts that block SMTP ports
 *       (Render free web services block 25, 465 and 587).</li>
 *   <li>{@code SPRING_MAIL_HOST} is set: regular SMTP.</li>
 *   <li>Neither: nothing is sent and the code is written to the log, so sign-in can be tried without a mail account.</li>
 * </ol>
 */
@Component
public class MailLoginCodeSender implements LoginCodeSender {

    private static final Logger log = LoggerFactory.getLogger(MailLoginCodeSender.class);
    private static final URI BREVO_SEND_URL = URI.create("https://api.brevo.com/v3/smtp/email");
    private static final String SENDER_NAME = "Cherry Cake";

    private final ObjectProvider<JavaMailSender> mailSender;
    private final ObjectMapper objectMapper;
    private final String from;
    private final String brevoApiKey;
    private final HttpClient http = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(5)).build();

    // Most providers only accept a sender equal to the login or a verified sender, so MAIL_FROM falls back to the username.
    public MailLoginCodeSender(
            ObjectProvider<JavaMailSender> mailSender,
            ObjectMapper objectMapper,
            @Value("${app.mail.from:}") String from,
            @Value("${spring.mail.username:}") String username,
            @Value("${app.mail.brevo-api-key:}") String brevoApiKey) {
        this.mailSender = mailSender;
        this.objectMapper = objectMapper;
        this.from = from.isBlank() ? username : from;
        this.brevoApiKey = brevoApiKey.trim();
    }

    @Override
    public void send(String email, String code) {
        if (!brevoApiKey.isEmpty()) {
            sendWithBrevoApi(email, code);
            return;
        }

        JavaMailSender sender = mailSender.getIfAvailable();
        boolean blankHost = sender instanceof JavaMailSenderImpl impl
                && (impl.getHost() == null || impl.getHost().isBlank());
        if (sender == null || blankHost) {
            log.warn("No mail is configured (BREVO_API_KEY and SPRING_MAIL_HOST are empty). Sign-in code for {}: {}",
                    email, code);
            return;
        }

        SimpleMailMessage message = new SimpleMailMessage();
        if (!from.isBlank()) {
            message.setFrom(from);
        }
        message.setTo(email);
        message.setSubject(subject(code));
        message.setText(text(code));
        try {
            sender.send(message);
        } catch (MailException ex) {
            log.error("Could not send the sign-in email to {} over SMTP", email, ex);
            throw new ServiceUnavailableException("Could not send the email. Please try again later.");
        }
    }

    private void sendWithBrevoApi(String email, String code) {
        if (from.isBlank()) {
            log.error("MAIL_FROM is empty: set it to a sender address verified in Brevo");
            throw new ServiceUnavailableException("Could not send the email. Please try again later.");
        }
        try {
            String json = objectMapper.writeValueAsString(Map.of(
                    "sender", Map.of("name", SENDER_NAME, "email", from),
                    "to", List.of(Map.of("email", email)),
                    "subject", subject(code),
                    "textContent", text(code)));
            HttpRequest request = HttpRequest.newBuilder(BREVO_SEND_URL)
                    .timeout(Duration.ofSeconds(8))
                    .header("api-key", brevoApiKey)
                    .header("accept", "application/json")
                    .header("content-type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(json))
                    .build();
            HttpResponse<String> response = http.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() / 100 != 2) {
                log.error("Brevo rejected the sign-in email to {}: HTTP {} {}",
                        email, response.statusCode(), response.body());
                throw new ServiceUnavailableException("Could not send the email. Please try again later.");
            }
        } catch (IOException ex) {
            log.error("Could not reach Brevo to send the sign-in email to {}", email, ex);
            throw new ServiceUnavailableException("Could not send the email. Please try again later.");
        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
            throw new ServiceUnavailableException("Could not send the email. Please try again later.");
        }
    }

    private static String subject(String code) {
        return code + " is your Cherry Cake sign-in code";
    }

    private static String text(String code) {
        return "Your Cherry Cake sign-in code: " + code
                + "\n\nIt is valid for 10 minutes. If you did not request it, just ignore this email.";
    }
}
