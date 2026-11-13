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

## API v1 contract (CC-10)

The version is `v1` in OpenAPI; all routes use the agreed `/api` prefix. Every endpoint is public.
Swagger UI: [http://localhost:8080/swagger-ui/index.html](http://localhost:8080/swagger-ui/index.html).
This address works after starting the backend locally; it is not a public deployment.

| Method | Path | Parameters or body | Response |
|---|---|---|---|
| GET | `/api/regions` | None | `RegionResponse[]` |
| GET | `/api/categories` | None | `CategoryResponse[]` |
| GET | `/api/products` | Required `region`, optional `categoryId` | `ProductResponse[]` without modifier groups |
| GET | `/api/products/{id}` | Required `region` | `ProductResponse` with modifier groups |
| POST | `/api/cart/calculate` | `CalculateCartRequest` | `CalculateCartResponse` |
| POST | `/api/orders` | `CreateOrderRequest` | `201 OrderResponse` |

Swagger includes DTO schemas, validation constraints and `ErrorResponse` for 400, 404 and 409 responses.
Regions use three-letter codes (`UZB`, `KAZ`, `GEO`, `UKR`, `CHN`); rates are fractions, for example `0.1500`.
Money uses `BigDecimal`, two decimal places and `HALF_UP`. Catalog prices and discount thresholds are
stored in conventional units and converted using BE1's region exchange rate.

## Guest order creation (CC-24)

Choose `productId` from `/api/products?region=UZB`. For products with required modifier groups, choose
`modifierIds` from `/api/products/{id}?region=UZB`. The example uses a Tiramisu product, which has no
required modifiers. Replace the product ID with the ID returned by your catalog and use today's date or later.

```json
{
  "region": "UZB",
  "customer": {
    "name": "Anvar Makhamatjonov",
    "phone": "+998901234567",
    "email": "anvar@example.com"
  },
  "orderDate": "2026-12-31",
  "items": [{"productId": 8, "quantity": 1, "modifierIds": []}]
}
```

Names and emails are required and limited to 150 characters. Spaces, hyphens and parentheses are removed
from the phone before validation and storage: `+998 (90) 123-45-67` becomes `+998901234567`.
The normalized phone must contain 7 to 15 digits, optionally prefixed with `+`.
Dates before today, empty carts, null items and quantities below 1 return 400.
Invalid modifier selections return 400, unknown regions/products return 404, and unavailable products return 409.

The server ignores client-supplied prices, taxes, discounts and totals. Both order creation and cart calculation
call BE1's `CartCalculationService`; there is no separate order pricing formula. Order and item snapshots are
saved in one transaction, including product names, chosen modifier IDs, unit prices, modifier prices and totals.

For one Tiramisu in UZB with the current seed prices, the response has this shape:

```json
{
  "orderNumber": "CC-2026-000123",
  "orderDate": "2026-12-31",
  "region": "UZB",
  "customer": {"name": "Anvar Makhamatjonov", "phone": "+998901234567", "email": "anvar@example.com"},
  "items": [{"productId": 8, "productName": "Tiramisu", "unitPrice": 90000.00,
    "modifiersPrice": 0.00, "quantity": 1, "lineTotal": 90000.00}],
  "subtotal": 90000.00,
  "vatRate": 0.1500,
  "vatAmount": 13500.00,
  "amountInclVat": 103500.00,
  "discountRate": 0.0000,
  "discountAmount": 0.00,
  "deliveryFee": 0.00,
  "total": 103500.00,
  "currencyCode": "UZS",
  "createdAt": "2026-11-11T10:30:00"
}
```

`orderNumber` uses `CC-<creation year>-<sequence padded to at least six digits>`. A database sequence makes
allocation safe across concurrent requests and application restarts. Gaps after failed transactions are expected.
`createdAt` records server time; `orderDate` is the customer's requested date.

## Order migration (CC-6)

`V2__orders.sql` adds only `orders` and `order_items`, their constraints/indexes and the order-number sequence.
It references BE1's `regions` and `products` from the unchanged `V1__catalog.sql`.
The normal clean-database order is V1 catalog, V2 orders, then the existing V3 catalog seed.
The existing `out-of-order: true` setting also allows V2 to run on a database where V3 has already been applied.
Do not edit an applied migration or run Flyway clean/repair against a shared database.

This scope contains no report, delivery, pickup, booking, slot or authentication endpoints or tables.

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
mvn clean verify
```

Tests use the `test` profile with an in-memory H2 database, so they don't need Docker or `.env`.
They cover the API contract, guest validation, client-price tampering, price snapshots, concurrent order
creation, database constraints, V1-to-V2 upgrades and adding V2 after an existing V3 seed.

## Environment variables

| Name | Purpose |
|---|---|
| `DB_URL` | PostgreSQL JDBC URL |
| `DB_USER` | Database user |
| `DB_PASSWORD` | Database password |
| `CORS_ALLOWED_ORIGINS` | Allowed frontend origins, comma-separated |
