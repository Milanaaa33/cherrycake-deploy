package com.cherrycake;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ApiContractTests {

    @Autowired
    private MockMvc mvc;

    @Autowired
    private ObjectMapper mapper;

    @Test
    void publishesOnlyTheSixAgreedEndpointsWithTypedSuccessAndErrorResponses() throws Exception {
        JsonNode spec = spec();
        Set<String> paths = new HashSet<>();
        spec.path("paths").fieldNames().forEachRemaining(paths::add);
        assertThat(paths).containsExactlyInAnyOrder("/api/regions", "/api/categories", "/api/products",
                "/api/products/{id}", "/api/cart/calculate", "/api/orders");
        assertThat(spec.at("/info/version").asText()).isEqualTo("v1");
        assertThat(spec.path("security").isMissingNode() || spec.path("security").isEmpty()).isTrue();
        assertSuccess(spec, "/api/regions", "get", "200", "RegionResponse", true);
        assertSuccess(spec, "/api/categories", "get", "200", "CategoryResponse", true);
        assertSuccess(spec, "/api/products", "get", "200", "ProductResponse", true);
        assertSuccess(spec, "/api/products/{id}", "get", "200", "ProductResponse", false);
        assertSuccess(spec, "/api/cart/calculate", "post", "200", "CalculateCartResponse", false);
        assertSuccess(spec, "/api/orders", "post", "201", "OrderResponse", false);
        for (String path : List.of("/api/products", "/api/products/{id}", "/api/cart/calculate", "/api/orders")) {
            String method = path.contains("products") ? "get" : "post";
            for (String code : List.of("400", "404")) {
                assertSuccess(spec, path, method, code, "ErrorResponse", false);
            }
        }
        assertSuccess(spec, "/api/cart/calculate", "post", "409", "ErrorResponse", false);
        assertSuccess(spec, "/api/orders", "post", "409", "ErrorResponse", false);
    }

    @Test
    void keepsCartAndOrderNestedSchemasDistinctAndDocumentsRequiredFields() throws Exception {
        JsonNode spec = spec();
        JsonNode schemas = spec.at("/components/schemas");
        assertThat(schemas.path("CreateOrderRequest").path("required").toString())
                .contains("region", "customer", "orderDate", "items");
        assertThat(schemas.path("CreateOrderRequest").at("/properties/items/items/$ref").asText())
                .isEqualTo("#/components/schemas/CalculateCartItemRequest");
        assertThat(schemas.path("OrderResponse").at("/properties/items/items/$ref").asText())
                .isEqualTo("#/components/schemas/OrderItemResponse");
        assertThat(schemas.path("CalculateCartResponse").at("/properties/items/items/$ref").asText())
                .isEqualTo("#/components/schemas/CalculateCartItemResponse");
        assertThat(schemas.path("CalculateCartItemRequest").at("/properties/quantity/minimum").asInt())
                .isEqualTo(1);
        assertThat(schemas.path("OrderCustomerRequest").path("required").toString())
                .contains("name", "phone", "email");
        assertThat(schemas.path("OrderResponse").at("/properties/createdAt/format").asText())
                .isEqualTo("date-time");
        assertThat(spec.path("paths").path("/api/orders").path("post")
                .at("/requestBody/content/application~1json/schema/$ref").asText())
                .isEqualTo("#/components/schemas/CreateOrderRequest");
        JsonNode params = spec.path("paths").path("/api/products").path("get").path("parameters");
        assertThat(params.findValuesAsText("name")).contains("region", "categoryId");
        for (JsonNode param : params) {
            assertThat(param.path("required").asBoolean()).isEqualTo(param.path("name").asText().equals("region"));
        }
    }

    private JsonNode spec() throws Exception {
        return mapper.readTree(mvc.perform(get("/v3/api-docs")).andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString());
    }

    private static void assertSuccess(JsonNode spec, String path, String method, String code,
            String schema, boolean array) {
        JsonNode response = spec.path("paths").path(path).path(method).path("responses").path(code)
                .path("content").elements().next().path("schema");
        if (array) {
            assertThat(response.path("type").asText()).isEqualTo("array");
            response = response.path("items");
        }
        assertThat(response.path("$ref").asText()).as("%s %s %s", method, path, code)
                .isEqualTo("#/components/schemas/" + schema);
    }
}
