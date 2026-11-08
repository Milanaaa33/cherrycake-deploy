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

API docs: Swagger UI at http://localhost:8080/swagger-ui.html, OpenAPI spec at http://localhost:8080/v3/api-docs.

## Errors

Every failed request returns the same JSON:

```json
{
  "status": 400,
  "message": "Validation failed",
  "errors": [{ "field": "quantity", "message": "must be greater than or equal to 1" }],
  "timestamp": "2026-11-05T06:00:00Z",
  "path": "/api/cart/calculate"
}
```

`errors` is empty unless request fields failed validation. Status codes: 400 validation, 404 not found, 409 conflict (for example, out of stock), 500 unexpected error. In code, throw `NotFoundException`, `ConflictException` or `BadRequestException` from `com.cherrycake.common.exception`.

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
