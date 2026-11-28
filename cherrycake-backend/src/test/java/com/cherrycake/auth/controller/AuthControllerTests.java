package com.cherrycake.auth.controller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.cherrycake.auth.service.LoginCodeSender;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class AuthControllerTests {

    // Captures the code instead of emailing it.
    static final Map<String, String> SENT_CODES = new HashMap<>();

    @TestConfiguration
    static class CapturingSenderConfig {
        @Bean
        @Primary
        LoginCodeSender capturingSender() {
            return SENT_CODES::put;
        }
    }

    @Autowired
    private MockMvc mvc;

    @Autowired
    private JdbcTemplate jdbc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void signInByEmailCodeShowsAllOrdersWithThatEmailWithoutClientId() throws Exception {
        String email = "login.test@example.com";
        // An order placed earlier as a guest, in another browser (no client id).
        mvc.perform(post("/api/orders").contentType(MediaType.APPLICATION_JSON).content(orderJson(email)))
                .andExpect(status().isCreated());

        mvc.perform(post("/api/auth/request-code").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"Login.Test@Example.com\"}"))
                .andExpect(status().isNoContent());
        String code = SENT_CODES.get(email);
        assertThat(code).matches("[0-9]{6}");
        // The code itself is never stored.
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM auth_codes WHERE code_hash = ?", Integer.class, code))
                .isZero();

        String wrong = code.equals("000000") ? "111111" : "000000";
        mvc.perform(post("/api/auth/verify-code").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"" + email + "\",\"code\":\"" + wrong + "\"}"))
                .andExpect(status().isBadRequest());

        String body = mvc.perform(post("/api/auth/verify-code").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"" + email + "\",\"code\":\"" + code + "\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value(email))
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andReturn().getResponse().getContentAsString();
        String token = objectMapper.readTree(body).get("token").asText();

        // The code works once.
        mvc.perform(post("/api/auth/verify-code").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"" + email + "\",\"code\":\"" + code + "\"}"))
                .andExpect(status().isBadRequest());

        // No X-Client-Id needed when signed in; the order is found by its email.
        mvc.perform(get("/api/orders/my").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].customer.email").value(email));

        mvc.perform(post("/api/auth/logout").header("Authorization", "Bearer " + token))
                .andExpect(status().isNoContent());
        mvc.perform(get("/api/orders/my").header("Authorization", "Bearer " + token))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void rejectsUnknownTokenAndThrottlesCodeRequests() throws Exception {
        mvc.perform(get("/api/orders/my").header("Authorization", "Bearer not-a-real-token"))
                .andExpect(status().isUnauthorized());

        String request = "{\"email\":\"throttle.test@example.com\"}";
        mvc.perform(post("/api/auth/request-code").contentType(MediaType.APPLICATION_JSON).content(request))
                .andExpect(status().isNoContent());
        mvc.perform(post("/api/auth/request-code").contentType(MediaType.APPLICATION_JSON).content(request))
                .andExpect(status().isTooManyRequests());

        mvc.perform(post("/api/auth/request-code").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"not-an-email\"}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void codeIsBurnedAfterFiveWrongAttempts() throws Exception {
        String email = "attempts.test@example.com";
        mvc.perform(post("/api/auth/request-code").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"" + email + "\"}"))
                .andExpect(status().isNoContent());
        String code = SENT_CODES.get(email);
        String wrong = code.equals("000000") ? "111111" : "000000";

        for (int i = 0; i < 5; i++) {
            mvc.perform(post("/api/auth/verify-code").contentType(MediaType.APPLICATION_JSON)
                            .content("{\"email\":\"" + email + "\",\"code\":\"" + wrong + "\"}"))
                    .andExpect(status().isBadRequest());
        }
        // Even the correct code no longer works.
        mvc.perform(post("/api/auth/verify-code").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"" + email + "\",\"code\":\"" + code + "\"}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void expiredCodeIsRejected() throws Exception {
        String email = "expired.test@example.com";
        mvc.perform(post("/api/auth/request-code").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"" + email + "\"}"))
                .andExpect(status().isNoContent());
        String code = SENT_CODES.get(email);

        jdbc.update("UPDATE auth_codes SET expires_at = ? WHERE email = ?",
                LocalDateTime.now().minusSeconds(1), email);

        mvc.perform(post("/api/auth/verify-code").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"" + email + "\",\"code\":\"" + code + "\"}"))
                .andExpect(status().isBadRequest());
    }

    private String orderJson(String email) {
        long productId = jdbc.queryForObject("SELECT id FROM products WHERE name = 'Tiramisu'", Long.class);
        return """
                {"region":"UZB","customer":{"name":"Login Test","phone":"+998900000009","email":"%s"},
                "orderDate":"%s","items":[{"productId":%d,"quantity":1}]}
                """.formatted(email, LocalDate.now(), productId);
    }
}
