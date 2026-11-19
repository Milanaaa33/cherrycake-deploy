package com.cherrycake.fulfillment.controller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
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
class ConcurrentSlotTests {

    private static final String EMAIL = "concurrent-slot-test@example.com";

    @Autowired
    private MockMvc mvc;

    @Autowired
    private JdbcTemplate jdbc;

    @Test
    void simultaneousOrdersNeverOverfillASlot() throws Exception {
        long slot = jdbc.queryForObject("SELECT id FROM time_slots WHERE start_time = '16:00'", Long.class);
        long zone = jdbc.queryForObject("SELECT z.id FROM delivery_zones z JOIN regions r ON r.id = z.region_id "
                + "WHERE r.code = 'UZB' AND z.name = 'Center'", Long.class);
        long tiramisu = jdbc.queryForObject("SELECT id FROM products WHERE name = 'Tiramisu'", Long.class);
        int capacity = jdbc.queryForObject("SELECT capacity FROM time_slots WHERE id = ?", Integer.class, slot);
        jdbc.update("UPDATE time_slots SET capacity = 3 WHERE id = ?", slot);
        String body = """
                {"region":"UZB","customer":{"name":"Slot race","phone":"+998901234567","email":"%s"},
                "orderDate":"%s","items":[{"productId":%d,"quantity":1}],
                "fulfillmentType":"DELIVERY","deliveryZoneId":%d,"timeSlotId":%d}
                """.formatted(EMAIL, LocalDate.now().plusDays(45), tiramisu, zone, slot);

        var pool = Executors.newFixedThreadPool(8);
        var start = new CountDownLatch(1);
        try {
            var tasks = new ArrayList<Callable<Integer>>();
            for (int i = 0; i < 8; i++) {
                tasks.add(() -> {
                    assertThat(start.await(10, TimeUnit.SECONDS)).isTrue();
                    return mvc.perform(post("/api/orders").contentType(MediaType.APPLICATION_JSON).content(body))
                            .andReturn().getResponse().getStatus();
                });
            }
            var futures = tasks.stream().map(pool::submit).toList();
            start.countDown();
            List<Integer> statuses = new ArrayList<>();
            for (var future : futures) {
                statuses.add(future.get(30, TimeUnit.SECONDS));
            }

            assertThat(statuses).filteredOn(s -> s == 201).hasSize(3);
            assertThat(statuses).filteredOn(s -> s == 409).hasSize(5);
            assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM orders WHERE email = ?", Integer.class, EMAIL))
                    .isEqualTo(3);
        } finally {
            pool.shutdownNow();
            assertThat(pool.awaitTermination(10, TimeUnit.SECONDS)).isTrue();
            jdbc.update("DELETE FROM orders WHERE email = ?", EMAIL);
            jdbc.update("UPDATE time_slots SET capacity = ? WHERE id = ?", capacity, slot);
        }
    }
}
