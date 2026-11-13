package com.cherrycake;

import static org.assertj.core.api.Assertions.assertThat;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import org.flywaydb.core.Flyway;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.DriverManagerDataSource;

class OrderFlywayUpgradeTests {

    @TempDir
    Path migrations;

    @Test
    void appliesV2OverV1AndAddsOnlyTheTwoOrderTables() {
        var dataSource = database();
        Flyway.configure().dataSource(dataSource).target("1").load().migrate();
        JdbcTemplate jdbc = new JdbcTemplate(dataSource);
        Set<String> before = tables(jdbc);
        assertThat(before).doesNotContain("orders", "order_items");

        Flyway upgraded = Flyway.configure().dataSource(dataSource).target("2").load();
        assertThat(upgraded.migrate().migrationsExecuted).isEqualTo(1);
        Set<String> added = tables(jdbc);
        added.removeAll(before);
        assertThat(added).containsExactlyInAnyOrder("orders", "order_items");
        assertThat(upgraded.migrate().migrationsExecuted).isZero();
        upgraded.validate();
    }

    @Test
    void appliesV2ToAnExistingDatabaseThatAlreadyHasCatalogSeedV3() throws Exception {
        var dataSource = database();
        copyMigration("V1__catalog.sql");
        copyMigration("V3__seed.sql");
        String location = "filesystem:" + migrations.toAbsolutePath();
        Flyway.configure().dataSource(dataSource).locations(location).load().migrate();

        copyMigration("V2__orders.sql");
        Flyway upgraded = Flyway.configure().dataSource(dataSource).locations(location)
                .outOfOrder(true).load();
        assertThat(upgraded.migrate().migrationsExecuted).isEqualTo(1);
        upgraded.validate();
        assertThat(tables(new JdbcTemplate(dataSource))).contains("orders", "order_items");
        assertThat(new JdbcTemplate(dataSource).queryForObject("SELECT COUNT(*) FROM regions", Integer.class))
                .isEqualTo(5);
    }

    private void copyMigration(String name) throws Exception {
        try (var input = getClass().getResourceAsStream("/db/migration/" + name)) {
            Files.copy(java.util.Objects.requireNonNull(input), migrations.resolve(name));
        }
    }

    private static DriverManagerDataSource database() {
        return new DriverManagerDataSource("jdbc:h2:mem:" + UUID.randomUUID()
                + ";DB_CLOSE_DELAY=-1;MODE=PostgreSQL;DATABASE_TO_LOWER=TRUE", "sa", "");
    }

    private static Set<String> tables(JdbcTemplate jdbc) {
        return jdbc.queryForList("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'",
                String.class).stream().collect(Collectors.toSet());
    }
}
