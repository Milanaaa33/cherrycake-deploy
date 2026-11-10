package com.cherrycake.common.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Swagger UI: http://localhost:8080/swagger-ui.html, spec: /v3/api-docs.
 */
@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI cherryCakeOpenApi() {
        return new OpenAPI().info(new Info()
                .title("Cherry Cake API")
                .version("v1")
                .description("API v1: regions, categories, products, cart calculation and guest orders. "
                        + "All endpoints are public. Rates are fractions; money is in the selected region's currency. "
                        + "Cart calculation and order creation share the BE1 calculator. "
                        + "Every error is returned as ErrorResponse."));
    }
}
