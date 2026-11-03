# Cherry Cake backend

Spring Boot 3 API for the Cherry Cake café. It needs Java 17, Maven and Docker.

Run all commands from the `cherrycake-backend` folder.

## Start the database

```bash
cp .env.example .env
docker compose up -d
```

Set your own `DB_PASSWORD` in `.env` before you start the database. Git ignores `.env`, so it never reaches the repository.

## Start the application

```bash
mvn spring-boot:run
```

The application uses the `dev` profile by default, reads `.env` and listens on http://localhost:8080.

## Run the tests

```bash
mvn test
```

Tests use the `test` profile with an in-memory H2 database, so they don't need Docker or `.env`.

## Environment variables

| Name | Purpose |
|---|---|
| `DB_URL` | PostgreSQL JDBC URL |
| `DB_USER` | Database user |
| `DB_PASSWORD` | Database password |
| `CORS_ALLOWED_ORIGINS` | Allowed frontend origins, comma-separated |
