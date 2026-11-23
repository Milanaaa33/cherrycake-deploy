package com.cherrycake.admin.controller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.cherrycake.auth.service.LoginCodeSender;
import com.fasterxml.jackson.databind.ObjectMapper;
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
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

/**
 * RBAC and the admin panel: a bootstrap ADMIN (ADMIN_EMAILS), roles granted in the panel,
 * and what VIEWER, STAFF and ADMIN may do.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@TestPropertySource(properties = "app.auth.admin-emails=Boss@Example.com, ")
@Transactional
class AdminControllerTests {

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
    void adminPanelNeedsASessionAndARole() throws Exception {
        mvc.perform(get("/api/admin/products")).andExpect(status().isUnauthorized());

        String customer = signIn("customer@example.com");
        mvc.perform(get("/api/auth/me").header("Authorization", "Bearer " + customer))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.role").value("CUSTOMER"));
        mvc.perform(get("/api/admin/products").header("Authorization", "Bearer " + customer))
                .andExpect(status().isForbidden());
    }

    @Test
    void bootstrapAdminManagesRolesAndCatalog() throws Exception {
        String admin = signIn("boss@example.com");
        mvc.perform(get("/api/auth/me").header("Authorization", "Bearer " + admin))
                .andExpect(jsonPath("$.role").value("ADMIN"));

        // Grant roles.
        mvc.perform(put("/api/admin/users").header("Authorization", "Bearer " + admin)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"Staff@Example.com\",\"role\":\"STAFF\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("staff@example.com"))
                .andExpect(jsonPath("$.grantedBy").value("boss@example.com"));
        mvc.perform(put("/api/admin/users").header("Authorization", "Bearer " + admin)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"viewer@example.com\",\"role\":\"VIEWER\"}"))
                .andExpect(status().isOk());
        // CUSTOMER is not a grantable role, and the bootstrap admin cannot be demoted.
        mvc.perform(put("/api/admin/users").header("Authorization", "Bearer " + admin)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"x@example.com\",\"role\":\"CUSTOMER\"}"))
                .andExpect(status().isBadRequest());
        mvc.perform(put("/api/admin/users").header("Authorization", "Bearer " + admin)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"boss@example.com\",\"role\":\"VIEWER\"}"))
                .andExpect(status().isConflict());

        String staff = signIn("staff@example.com");
        String viewer = signIn("viewer@example.com");

        // Everyone with a role reads the catalog; every product has a price in all 17 regions.
        mvc.perform(get("/api/admin/products").header("Authorization", "Bearer " + viewer))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].prices.length()").value(17));
        mvc.perform(get("/api/admin/regions").header("Authorization", "Bearer " + viewer))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(17));

        long tiramisu = jdbc.queryForObject("SELECT id FROM products WHERE name = 'Tiramisu'", Long.class);

        // STAFF changes price and availability; VIEWER may not.
        mvc.perform(put("/api/admin/products/" + tiramisu + "/prices/KAZ").header("Authorization", "Bearer " + viewer)
                        .contentType(MediaType.APPLICATION_JSON).content("{\"price\":12.50,\"inStock\":true}"))
                .andExpect(status().isForbidden());
        mvc.perform(put("/api/admin/products/" + tiramisu + "/prices/kaz").header("Authorization", "Bearer " + staff)
                        .contentType(MediaType.APPLICATION_JSON).content("{\"price\":12.50,\"inStock\":false}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.prices[?(@.regionCode=='KAZ')].price").value(12.50))
                .andExpect(jsonPath("$.prices[?(@.regionCode=='KAZ')].localPrice").value(1500.00))
                .andExpect(jsonPath("$.prices[?(@.regionCode=='KAZ')].inStock").value(false));
        // The public catalog reflects the change.
        mvc.perform(get("/api/products/" + tiramisu).param("region", "KAZ"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.price").value(1500.00))
                .andExpect(jsonPath("$.inStock").value(false));
        mvc.perform(patch("/api/admin/products/" + tiramisu + "/availability/KAZ").header("Authorization", "Bearer " + staff)
                        .contentType(MediaType.APPLICATION_JSON).content("{\"inStock\":true}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.prices[?(@.regionCode=='KAZ')].inStock").value(true));

        // Only ADMIN creates products and categories.
        mvc.perform(post("/api/admin/categories").header("Authorization", "Bearer " + staff)
                        .contentType(MediaType.APPLICATION_JSON).content("{\"name\":\"Seasonal\",\"sortOrder\":9}"))
                .andExpect(status().isForbidden());
        String category = mvc.perform(post("/api/admin/categories").header("Authorization", "Bearer " + admin)
                        .contentType(MediaType.APPLICATION_JSON).content("{\"name\":\"Seasonal\",\"sortOrder\":9}"))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        long categoryId = objectMapper.readTree(category).get("id").asLong();

        String product = mvc.perform(post("/api/admin/products").header("Authorization", "Bearer " + admin)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"categoryId\":" + categoryId + ",\"name\":\"Pumpkin Pie\",\"price\":4.00}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.prices.length()").value(17))
                .andReturn().getResponse().getContentAsString();
        long productId = objectMapper.readTree(product).get("id").asLong();
        mvc.perform(get("/api/products").param("region", "UZB").param("categoryId", String.valueOf(categoryId)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("Pumpkin Pie"))
                .andExpect(jsonPath("$[0].price").value(12000.00));

        // A category with products cannot be deleted; a never-ordered product is removed for real.
        mvc.perform(delete("/api/admin/categories/" + categoryId).header("Authorization", "Bearer " + admin))
                .andExpect(status().isConflict());
        mvc.perform(delete("/api/admin/products/" + productId).header("Authorization", "Bearer " + admin))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.deleted").value(true));
        mvc.perform(delete("/api/admin/categories/" + categoryId).header("Authorization", "Bearer " + admin))
                .andExpect(status().isNoContent());

        // Region rates.
        mvc.perform(put("/api/admin/regions/GEO").header("Authorization", "Bearer " + admin)
                        .contentType(MediaType.APPLICATION_JSON).content("{\"vatRate\":0.1300,\"exchangeRate\":0.7000}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.vatRate").value(0.13));
        assertThat(jdbc.queryForObject("SELECT vat_rate FROM regions WHERE code = 'GEO'", java.math.BigDecimal.class))
                .isEqualByComparingTo("0.1300");

        // Revoking a role turns the user back into a customer.
        mvc.perform(delete("/api/admin/users/viewer@example.com").header("Authorization", "Bearer " + admin))
                .andExpect(status().isNoContent());
        mvc.perform(get("/api/admin/products").header("Authorization", "Bearer " + viewer))
                .andExpect(status().isForbidden());
        mvc.perform(delete("/api/admin/users/boss@example.com").header("Authorization", "Bearer " + admin))
                .andExpect(status().isConflict());
    }

    private String signIn(String email) throws Exception {
        mvc.perform(post("/api/auth/request-code").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"" + email + "\"}"))
                .andExpect(status().isNoContent());
        String body = mvc.perform(post("/api/auth/verify-code").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"" + email + "\",\"code\":\"" + SENT_CODES.get(email) + "\"}"))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        return objectMapper.readTree(body).get("token").asText();
    }
}
