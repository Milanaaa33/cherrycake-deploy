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
Regions use three-letter codes; there are 17 of them (`UZB`, `KAZ`, `GEO`, `UKR`, `CHN` from V3 and `ARM`, `AZE`, `TUR`,
`MDA`, `ROU`, `EST`, `LVA`, `LTU`, `FIN`, `SWE`, `BLR`, `RUS` from V9); rates are fractions, for example `0.1500`.
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

The order migration contains no delivery, pickup, booking, slot or authentication tables.

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
| `ADMIN_EMAILS` | Comma-separated emails that are always `ADMIN` (bootstrap for the admin panel). Optional |


## Sales reports and PDF export (CC-50 / CC-51)

```text
GET /api/reports/sales?from=2026-01-01&to=2026-06-30&region=UZB&groupBy=MONTH
GET /api/reports/export?format=PDF&from=2026-01-01&to=2026-06-30&region=UZB&groupBy=MONTH
```

Both endpoints are public. They accept exactly the same reporting filters:

| Parameter | Meaning | Default |
|---|---|---|
| `from` | Inclusive `order_date`, ISO `YYYY-MM-DD` | First day five months before `to` |
| `to` | Inclusive `order_date`, ISO `YYYY-MM-DD` | Today on the server |
| `region` | Three-letter country code; case-insensitive | All countries when omitted |
| `groupBy` | `REGION` or `MONTH` | `MONTH` |
| `format` | PDF endpoint only; `PDF` | `PDF` |

The sales response is `{kpi, rows, currencyCode}`. `kpi` has `ordersCount`, `subtotalSum`,
`vatSum`, `discountSum`, and `totalSum`; each row has `label`, `ordersCount`, and `total`.
Region labels are country codes, month labels are `YYYY-MM`, sorted chronologically.
Only buckets with matching orders are returned. Empty results contain zero KPI amounts and `rows: []`.
An invalid date range, malformed filters or unsupported grouping/format returns 400 in `ErrorResponse`;
an unknown country returns 404. Filtering uses the stored order date, not `created_at`.

Amounts are sums of saved order snapshots, never recalculated using current catalog prices or taxes.
`currencyCode` identifies the stored currency, is `MIXED` when more than one is present, and can be null
when an all-country report has no sales. An all-country sum combines local amounts; it is **not** a
converted common-currency revenue measure. The UI defaults to UZB and both UI/PDF warn on `MIXED`.
No exchange-rate conversion or historical-rate assumptions are introduced.

SQL aggregation reads `orders` joined to `regions`, without joining item rows (which would multiply
orders). One grouped statement produces the KPI components and chart rows from the same snapshot.
See [independent reconciliation SQL](docs/sales-report-reconciliation.sql).

The PDF is an `application/pdf` attachment with filters, all KPI fields, an orders bar chart, a revenue
line chart, and the exact chart rows in a table. It calls the same report service as JSON. Long reports
split charts into 12-bucket pages and repeat breakdown table headers across pages; no rows are dropped.
Charts use OpenPDF 2.0.3 and JFreeChart 1.5.6 with headless Java2D. The runtime Docker image includes
fontconfig and DejaVu fonts so charts also render in a minimal deployment container.

The existing report page now loads the API, uses country and REGION/MONTH filters, displays actual
KPI/charts, and downloads the server PDF with the active filters. CSV export also uses loaded data.
Loading, empty and error states are explicit; exports are disabled until the current filters have data,
and late responses from older filter selections are ignored. Browser print is no longer the PDF path.

Run `mvn clean verify` for backend/SQL/PDF tests and `npm test`, `npm run build`, `npm run lint`
in `cherrycake-frontend` for frontend verification. PDF regression fixtures are generated under backend
`target/` for visual inspection. Tests use isolated data; no reporting seed migration is added to production.


## Admin panel and roles (RBAC)

Sign-in stays passwordless (email code). Every signed-in email is a plain `CUSTOMER` unless it has a role:

| Role | Can |
|---|---|
| `VIEWER` | open the admin panel and read catalog, prices, regions and roles |
| `STAFF` | also change prices and availability per region |
| `ADMIN` | also create, edit and delete categories and products, change VAT / exchange rates, grant and revoke roles |

Bootstrap: put the first administrator's email into `ADMIN_EMAILS` (`.env` locally, environment variable on the host),
sign in on *Orders / Account* with that email, and the **Admin** link appears in the header. Further roles are granted
in *Admin → Users & roles* and stored in the `user_roles` table (migration V10). Reports stay public, as before.

Endpoints: `GET /api/auth/me` returns the email and role of the session; `/api/admin/**` (see Swagger, tag *Admin*)
answers `401` without a session and `403` when the role is too low. Prices in the admin API are in conventional units
(CU) and shown next to the local price; `DELETE /api/admin/products/{id}` hides a product that was ever ordered
instead of deleting it, so order history stays intact.
