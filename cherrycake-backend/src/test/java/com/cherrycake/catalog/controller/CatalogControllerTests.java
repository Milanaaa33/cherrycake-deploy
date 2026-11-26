package com.cherrycake.catalog.controller;

import static org.hamcrest.Matchers.contains;
import static org.hamcrest.Matchers.containsInAnyOrder;
import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class CatalogControllerTests {

    @Autowired
    private MockMvc mvc;

    @Autowired
    private JdbcTemplate jdbc;

    @Test
    void regionsExposeCurrencyAndVatButNotExchangeRate() throws Exception {
        mvc.perform(get("/api/regions"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(17)))
                .andExpect(jsonPath("$[0].code").value("UZB"))
                .andExpect(jsonPath("$[0].currencyCode").value("UZS"))
                .andExpect(jsonPath("$[0].currencySymbol").value("so'm"))
                .andExpect(jsonPath("$[0].vatRate").value(0.15))
                .andExpect(jsonPath("$[0].exchangeRate").doesNotExist());
    }

    @Test
    void categoriesFollowSortOrder() throws Exception {
        mvc.perform(get("/api/categories"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[*].name", contains("Cakes", "Desserts", "Drinks")))
                .andExpect(jsonPath("$[0].id").exists());
    }

    @Test
    void productsAreConvertedToRegionCurrency() throws Exception {
        mvc.perform(get("/api/products").param("region", "UZB"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(12)))
                .andExpect(jsonPath("$[?(@.name == 'Cherry Cake')].price", contains(360000.00)))
                .andExpect(jsonPath("$[?(@.name == 'Cherry Cake')].inStock", contains(true)))
                .andExpect(jsonPath("$[?(@.name == 'Cherry Cake')].photoUrl").isNotEmpty())
                .andExpect(jsonPath("$[?(@.name == 'Cherry Cake')].modifierGroups").isEmpty());

        mvc.perform(get("/api/products").param("region", "GEO"))
                .andExpect(jsonPath("$[?(@.name == 'Cherry Cake')].price", contains(85.80)));
    }

    @Test
    void productsCanBeFilteredByCategory() throws Exception {
        Long drinks = jdbc.queryForObject("SELECT id FROM categories WHERE name = 'Drinks'", Long.class);

        mvc.perform(get("/api/products").param("region", "KAZ").param("categoryId", drinks.toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[*].name", containsInAnyOrder("Cappuccino", "Latte", "Cherry Lemonade")));
    }

    @Test
    void soldOutProductStaysInListWithFlag() throws Exception {
        mvc.perform(get("/api/products").param("region", "GEO"))
                .andExpect(jsonPath("$[?(@.name == 'Napoleon Cake')].inStock", contains(false)));
    }

    @Test
    void productsRequireRegion() throws Exception {
        mvc.perform(get("/api/products"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400));
    }

    @Test
    void productsRejectUnknownRegion() throws Exception {
        mvc.perform(get("/api/products").param("region", "XYZ"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Region XYZ not found"));
    }

    @Test
    void productDetailHasModifierGroupsInRegionCurrency() throws Exception {
        mvc.perform(get("/api/products/{id}", productId("Cherry Cake")).param("region", "GEO"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.price").value(85.80))
                .andExpect(jsonPath("$.modifierGroups[*].name", containsInAnyOrder("Size", "Extras")))
                .andExpect(jsonPath("$.modifierGroups[?(@.name == 'Size')].type", contains("SINGLE")))
                .andExpect(jsonPath("$.modifierGroups[?(@.name == 'Size')].isRequired", contains(true)))
                .andExpect(jsonPath("$.modifierGroups[?(@.name == 'Extras')].type", contains("MULTI")))
                .andExpect(jsonPath("$.modifierGroups[?(@.name == 'Extras')].isRequired", contains(false)))
                .andExpect(jsonPath("$.modifierGroups[?(@.name == 'Size')].modifiers[*]", hasSize(3)))
                .andExpect(jsonPath("$.modifierGroups[?(@.name == 'Size')].modifiers[?(@.name == 'Medium, 10 slices')].priceDelta", contains(26.00)));
    }

    @Test
    void productWithoutModifiersHasEmptyGroups() throws Exception {
        mvc.perform(get("/api/products/{id}", productId("Tiramisu")).param("region", "UZB"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.modifierGroups", hasSize(0)));
    }

    @Test
    void productDetailRejectsUnknownProduct() throws Exception {
        mvc.perform(get("/api/products/{id}", 999999).param("region", "UZB"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Product 999999 not found"));
    }

    @Test
    void swaggerDescribesTheContract() throws Exception {
        mvc.perform(get("/v3/api-docs"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.paths['/api/regions'].get").exists())
                .andExpect(jsonPath("$.paths['/api/categories'].get").exists())
                .andExpect(jsonPath("$.paths['/api/products'].get").exists())
                .andExpect(jsonPath("$.paths['/api/products/{id}'].get").exists())
                .andExpect(jsonPath("$.paths['/api/cart/calculate'].post").exists())
                .andExpect(jsonPath("$.components.schemas.CalculateCartResponse").exists())
                .andExpect(jsonPath("$.components.schemas.ErrorResponse").exists());
    }

    private Long productId(String name) {
        return jdbc.queryForObject("SELECT id FROM products WHERE name = ?", Long.class, name);
    }
}
