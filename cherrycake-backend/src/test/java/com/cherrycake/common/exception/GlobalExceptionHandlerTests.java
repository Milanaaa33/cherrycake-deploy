package com.cherrycake.common.exception;

import static org.hamcrest.Matchers.not;
import static org.hamcrest.Matchers.notNullValue;
import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class GlobalExceptionHandlerTests {

    private static final String BASE = "/api/test-errors";

    @Autowired
    private MockMvc mvc;

    @Test
    void notFoundException() throws Exception {
        expectError(mvc.perform(get(BASE + "/not-found")), 404, BASE + "/not-found")
                .andExpect(jsonPath("$.message").value("Region XYZ not found"));
    }

    @Test
    void conflictException() throws Exception {
        expectError(mvc.perform(get(BASE + "/conflict")), 409, BASE + "/conflict")
                .andExpect(jsonPath("$.message").value("Product 7 is out of stock in UZB"));
    }

    @Test
    void unexpectedExceptionHidesDetails() throws Exception {
        expectError(mvc.perform(get(BASE + "/boom")), 500, BASE + "/boom")
                .andExpect(jsonPath("$.message").value("Internal server error"))
                .andExpect(jsonPath("$.message", not(containsString("secret"))));
    }

    @Test
    void invalidBodyListsFieldErrors() throws Exception {
        expectError(mvc.perform(post(BASE + "/body")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"region\": \"\", \"quantity\": 0}")), 400, BASE + "/body")
                .andExpect(jsonPath("$.message").value("Validation failed"))
                .andExpect(jsonPath("$.errors.length()").value(2))
                .andExpect(jsonPath("$.errors[?(@.field == 'quantity')].message").exists())
                .andExpect(jsonPath("$.errors[?(@.field == 'region')].message").exists());
    }

    @Test
    void invalidRequestParamListsFieldError() throws Exception {
        expectError(mvc.perform(get(BASE + "/param").param("region", "UZB").param("quantity", "0")),
                400, BASE + "/param")
                .andExpect(jsonPath("$.errors[0].field").value("quantity"));
    }

    @Test
    void missingRequestParam() throws Exception {
        expectError(mvc.perform(get(BASE + "/param")), 400, BASE + "/param")
                .andExpect(jsonPath("$.message", containsString("region")));
    }

    @Test
    void wrongParamType() throws Exception {
        expectError(mvc.perform(get(BASE + "/param").param("region", "UZB").param("quantity", "abc")),
                400, BASE + "/param");
    }

    @Test
    void malformedJson() throws Exception {
        expectError(mvc.perform(post(BASE + "/body")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{not json")), 400, BASE + "/body");
    }

    @Test
    void unknownPath() throws Exception {
        expectError(mvc.perform(get("/api/no-such-endpoint")), 404, "/api/no-such-endpoint");
    }

    @Test
    void wrongMethod() throws Exception {
        expectError(mvc.perform(delete(BASE + "/conflict")), 405, BASE + "/conflict");
    }

    @Test
    void unsupportedMediaType() throws Exception {
        expectError(mvc.perform(post(BASE + "/body")
                .contentType(MediaType.TEXT_PLAIN)
                .content("hello")), 415, BASE + "/body");
    }

    private ResultActions expectError(ResultActions result, int status, String path) throws Exception {
        return result
                .andExpect(status().is(status))
                .andExpect(jsonPath("$.status").value(status))
                .andExpect(jsonPath("$.message", notNullValue()))
                .andExpect(jsonPath("$.errors", notNullValue()))
                .andExpect(jsonPath("$.timestamp", notNullValue()))
                .andExpect(jsonPath("$.path").value(path));
    }
}
