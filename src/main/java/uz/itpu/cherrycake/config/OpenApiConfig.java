package uz.itpu.cherrycake.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig
{
    @Bean
    public OpenAPI customOpenAPI()
    {
        final String securitySchemeName = "bearerAuth";

        return new OpenAPI().info
        (
            new Info()
            .title("Cherry Cake Bakery & Café REST API")
            .description
            (
                "Official backend REST API documentation for Cherry Cake Café web application. " +
                "Provides multi-region catalog, dynamic currency and VAT calculations, cart recalculation, " +
                "checkout, time-slot pickup, delivery calculation, table booking, and admin reporting."
            ).version("1.0.0").contact
            (
                new Contact()
                .name("Cherry Cake Team 9")
                .email("team9@cherrycake.com")
            )
        ).addSecurityItem(new SecurityRequirement().addList(securitySchemeName))
        .components
        (
            new Components().addSecuritySchemes
            (
                securitySchemeName, new SecurityScheme()
                .name(securitySchemeName)
                .type(SecurityScheme.Type.HTTP)
                .scheme("bearer")
                .bearerFormat("JWT")
            )
        );
    }
}