package com.cherrycake.order.controller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.Set;
import java.util.concurrent.Callable;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ConcurrentOrderTests {

    @Autowired
    private MockMvc mvc;

    @Autowired
    private JdbcTemplate jdbc;

    @Autowired
    private ObjectMapper mapper;

    @Test
    void concurrentGuestRequestsCommitDifferentOrderNumbers() throws Exception {
        long productId = jdbc.queryForObject("SELECT id FROM products WHERE name = 'Tiramisu'", Long.class);
        String body = """
                {"region":"UZB","customer":{"name":"Concurrency test","phone":"+998901234567",
                "email":"concurrent-order-test@example.com"},"orderDate":"%s",
                "items":[{"productId":%d,"quantity":1}]}
                """.formatted(LocalDate.now(), productId);
        var pool = Executors.newFixedThreadPool(8);
        var start = new CountDownLatch(1);
        try {
            var tasks = new ArrayList<Callable<String>>();
            for (int i = 0; i < 16; i++) {
                tasks.add(() -> {
                    assertThat(start.await(10, TimeUnit.SECONDS)).isTrue();
                    var response = mvc.perform(post("/api/orders").contentType(MediaType.APPLICATION_JSON).content(body))
                            .andExpect(status().isCreated()).andReturn().getResponse();
                    return mapper.readTree(response.getContentAsString()).path("orderNumber").asText();
                });
            }
            var futures = tasks.stream().map(pool::submit).toList();
            start.countDown();
            Set<String> numbers = new HashSet<>();
            for (var future : futures) {
                numbers.add(future.get(20, TimeUnit.SECONDS));
            }
            assertThat(numbers).hasSize(16);
            assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM orders WHERE email = ?", Integer.class,
                    "concurrent-order-test@example.com")).isEqualTo(16);
            assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM order_items i JOIN orders o ON o.id = i.order_id "
                    + "WHERE o.email = ?", Integer.class, "concurrent-order-test@example.com")).isEqualTo(16);
        } finally {
            pool.shutdownNow();
            assertThat(pool.awaitTermination(10, TimeUnit.SECONDS)).isTrue();
            jdbc.update("DELETE FROM orders WHERE email = ?", "concurrent-order-test@example.com");
        }
    }
}
