package com.cherrycake.mail;

import com.cherrycake.common.exception.ServiceUnavailableException;
import com.cherrycake.mail.CherryCakeEmailTemplates.RenderedEmail;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

/**
 * Delivers multipart HTML + text transactional emails over Brevo HTTPS API or SMTP.
 */
@Service
public class CherryCakeMailService {

    private static final Logger log = LoggerFactory.getLogger(CherryCakeMailService.class);
    private static final URI BREVO_SEND_URL = URI.create("https://api.brevo.com/v3/smtp/email");
    private static final String SENDER_NAME = "Cherry Cake";
    private static final String LOGO_RESOURCE_PATH = "mail/cherry-logo.png";

    private final ObjectProvider<JavaMailSender> mailSender;
    private final ObjectMapper objectMapper;
    private final String from;
    private final String brevoApiKey;
    private final HttpClient http = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(5)).build();

    public CherryCakeMailService(
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

    /**
     * Sends an email synchronously and throws {@link ServiceUnavailableException} on failure.
     */
    public void sendRequired(String to, RenderedEmail email, String logLabel) {
        if (!brevoApiKey.isEmpty()) {
            sendWithBrevoApi(to, email, logLabel);
            return;
        }

        JavaMailSender sender = mailSender.getIfAvailable();
        if (!isSmtpConfigured(sender)) {
            log.warn("No mail is configured (BREVO_API_KEY and SPRING_MAIL_HOST are empty). Skipping {} for {}: {}",
                    logLabel, to, email.subject());
            return;
        }

        sendWithSmtp(sender, to, email, logLabel);
    }

    /**
     * Dispatches an email asynchronously on a background thread and logs any failure without failing checkout.
     */
    public void sendBestEffortAsync(String to, RenderedEmail email, String logLabel) {
        if (to == null || to.isBlank()) {
            return;
        }
        if (brevoApiKey.isEmpty() && !isSmtpConfigured(mailSender.getIfAvailable())) {
            log.info("No mail is configured. Order email preview [{}] for {}: {}",
                    logLabel, to, email.subject());
            return;
        }
        CompletableFuture.runAsync(() -> {
            try {
                sendRequired(to, email, logLabel);
            } catch (Exception ex) {
                log.warn("Best-effort {} email to {} failed: {}", logLabel, to, ex.getMessage());
            }
        });
    }

    private boolean isSmtpConfigured(JavaMailSender sender) {
        if (sender == null) return false;
        if (sender instanceof JavaMailSenderImpl impl) {
            return impl.getHost() != null && !impl.getHost().isBlank();
        }
        return true;
    }

    private void sendWithSmtp(JavaMailSender sender, String to, RenderedEmail email, String logLabel) {
        try {
            MimeMessage mimeMessage = sender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
            if (!from.isBlank()) {
                try {
                    helper.setFrom(from, SENDER_NAME);
                } catch (UnsupportedEncodingException ex) {
                    helper.setFrom(from);
                }
            }
            helper.setTo(to);
            helper.setSubject(email.subject());
            helper.setText(email.text(), email.html());

            ClassPathResource logo = new ClassPathResource(LOGO_RESOURCE_PATH);
            if (logo.exists()) {
                helper.addInline("cherryLogo", logo, "image/png");
            }

            sender.send(mimeMessage);
        } catch (MessagingException | MailException ex) {
            log.error("Could not send the {} email to {} over SMTP", logLabel, to, ex);
            throw new ServiceUnavailableException("Could not send the email. Please try again later.");
        }
    }

    private void sendWithBrevoApi(String to, RenderedEmail email, String logLabel) {
        if (from.isBlank()) {
            log.error("MAIL_FROM is empty: set it to a sender address verified in Brevo");
            throw new ServiceUnavailableException("Could not send the email. Please try again later.");
        }
        try {
            String json = objectMapper.writeValueAsString(Map.of(
                    "sender", Map.of("name", SENDER_NAME, "email", from),
                    "to", List.of(Map.of("email", to)),
                    "subject", email.subject(),
                    "htmlContent", email.html(),
                    "textContent", email.text()));
            HttpRequest request = HttpRequest.newBuilder(BREVO_SEND_URL)
                    .timeout(Duration.ofSeconds(8))
                    .header("api-key", brevoApiKey)
                    .header("accept", "application/json")
                    .header("content-type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(json))
                    .build();
            HttpResponse<String> response = http.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() / 100 != 2) {
                log.error("Brevo rejected the {} email to {}: HTTP {} {}",
                        logLabel, to, response.statusCode(), response.body());
                throw new ServiceUnavailableException("Could not send the email. Please try again later.");
            }
        } catch (IOException ex) {
            log.error("Could not reach Brevo to send the {} email to {}", logLabel, to, ex);
            throw new ServiceUnavailableException("Could not send the email. Please try again later.");
        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
            throw new ServiceUnavailableException("Could not send the email. Please try again later.");
        }
    }
}
