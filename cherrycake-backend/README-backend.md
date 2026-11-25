# Cherry Cake — Backend

REST API for the Cherry Cake café web application (EPAM University course project, team *Cherry Cake*).
It serves the catalog with regional prices, calculates carts and orders, handles pickup / delivery / time slots,
table bookings, passwordless sign-in, the admin panel with roles, and sales reports with PDF export.

- **Swagger UI (all endpoints, try them in the browser):** https://cherrycake-deploy.onrender.com/swagger-ui/index.html
- **OpenAPI JSON (import into Postman / Insomnia):** https://cherrycake-deploy.onrender.com/v3/api-docs
- **Frontend:** `../cherrycake-frontend`

> The API runs on a free Render instance: the first request after a period of inactivity can take 30–60 seconds while the
> service wakes up.

---

## 1. Stack

| Layer | Technology |
|---|---|
| Language / runtime | Java 17 (Dockerfile builds and runs on Temurin 21) |
| Framework | Spring Boot 3.3.4 — Web, Validation, Data JPA, Mail |
| Database | PostgreSQL 15+ (Neon in production), H2 in tests |
| Migrations | Flyway (`src/main/resources/db/migration`, V1 … V10) |
| API docs | springdoc-openapi 2.6 (Swagger UI) |
| PDF / charts | OpenPDF 2.0.3, JFreeChart 1.5.6 (headless) |
| Build / tests | Maven, JUnit 5, MockMvc, AssertJ |
| CI | GitHub Actions: `mvn clean verify` on every push and pull request |

---

## 2. Architecture

Layered by feature, each feature with the same three layers:

```
com.cherrycake
├── catalog      regions, categories, products, modifiers, regional prices      (GET /api/regions, /categories, /products)
├── pricing      PriceCalculatorService + CartCalculationService               (POST /api/cart/calculate)
├── order        order creation with server-side pricing, order history         (POST /api/orders, GET /api/orders/my)
├── fulfillment  pickup points, delivery zones, time slots                      (GET /api/pickup-points, /delivery-zones, /time-slots)
├── booking      table reservations with conflict checks                        (POST /api/bookings)
├── auth         email-code sign-in, sessions, roles (RBAC)                     (POST /api/auth/*, GET /api/auth/me)
├── admin        catalog / prices / availability / regions / roles management   (/api/admin/**)
├── report       sales aggregates, PDF export                                   (GET /api/reports/sales, /export)
└── common       GlobalExceptionHandler, ErrorResponse, CORS, OpenAPI config
```

- `controller` — HTTP only: validates the request DTO, calls a service, returns a response DTO.
- `service` — business rules and transactions (pricing, slot capacity, booking conflicts, role checks).
- `repository` — Spring Data JPA for read models; `JdbcTemplate` for auth, bookings, admin and reports.
- DTOs are Java records named `XxxRequest` / `XxxResponse`; JPA entities never leave the service layer.
- One exception handler (`GlobalExceptionHandler`) turns every error into the same `ErrorResponse` JSON.

---

## 3. Running locally

Requirements: Java 17+, Maven 3.9+, Docker (for PostgreSQL). All commands from `cherrycake-backend/`.

```bash
cp .env.example .env          # set DB_PASSWORD, ADMIN_EMAILS
docker compose up -d          # PostgreSQL 15 on localhost:5432
mvn spring-boot:run           # http://localhost:8080  (profile "dev", reads .env)
```

Flyway applies all migrations and seed data on the first start (17 regions, 3 categories, 12 products, modifiers,
discount rules, pickup points, delivery zones, time slots, tables). Swagger UI: http://localhost:8080/swagger-ui/index.html.

### Environment variables

| Name | Required | Purpose |
|---|---|---|
| `DB_URL` | yes | JDBC URL, e.g. `jdbc:postgresql://localhost:5432/cherrycake` |
| `DB_USER`, `DB_PASSWORD` | yes | Database credentials |
| `CORS_ALLOWED_ORIGINS` | yes | Comma-separated frontend origins (`http://localhost:5173`, the Vercel URL) |
| `ADMIN_EMAILS` | recommended | Comma-separated emails that are always `ADMIN` (bootstrap of the admin panel) |
| `SPRING_MAIL_HOST`, `SPRING_MAIL_PORT`, `SPRING_MAIL_USERNAME`, `SPRING_MAIL_PASSWORD`, `MAIL_FROM` | no | SMTP for sign-in codes; without it the code is printed in the log |
| `BREVO_API_KEY` | no | HTTPS mail API for hosts that block SMTP (Render free tier) |

### Tests

```bash
mvn clean verify
```

Tests use the `test` profile with in-memory H2 (PostgreSQL mode) and run every Flyway migration, so they need neither
Docker nor `.env`. They cover: the OpenAPI contract, seed data (17 regions, prices in every region), the price
calculator (VAT, discount thresholds, rounding), guest orders and client price tampering, concurrent orders in one
time slot, bookings, sign-in codes and sessions, RBAC and the admin panel, and the sales report / PDF.

---

## 4. Deployment

- **Backend:** Docker image (`Dockerfile`, multi-stage Maven build) on Render. Set the variables from the table above in
  *Environment*; Flyway migrates the database on start. Watch the start log for
  `Migrating schema "public" to version "N"` lines.
- **Database:** Neon PostgreSQL (`DB_URL` with `sslmode=require`).
- **Frontend:** Vercel; its `VITE_API_BASE_URL` must point to `https://<backend>/api`, and the Vercel URL must be listed in
  `CORS_ALLOWED_ORIGINS`.

---

## 5. Domain rules

### Countries, currencies and VAT

17 regions, each with ISO-3 code, currency, symbol, VAT rate and exchange rate (`regions` table, seeded in V3 and V9):

| Code | Country | Currency | VAT | Code | Country | Currency | VAT |
|---|---|---|---|---|---|---|---|
| UZB | Uzbekistan | UZS | 15 % | ROU | Romania | RON | 19 % |
| KAZ | Kazakhstan | KZT | 20 % | EST | Estonia | EUR | 22 % |
| GEO | Georgia | GEL | 12 % | LVA | Latvia | EUR | 21 % |
| UKR | Ukraine | UAH | 8 % | LTU | Lithuania | EUR | 21 % |
| CHN | China | CNY | 18 % | FIN | Finland | EUR | 24 % |
| ARM | Armenia | AMD | 20 % | SWE | Sweden | SEK | 25 % |
| AZE | Azerbaijan | AZN | 18 % | BLR | Belarus | BYN | 20 % |
| TUR | Turkey | TRY | 18 % | RUS | Russia | RUB | 20 % |
| MDA | Moldova | MDL | 20 % | | | | |

Catalog prices, modifier deltas, delivery fees and discount thresholds are stored in **conventional units (CU)**;
`regional_prices` keeps a CU price and an `in_stock` flag per product and region. The API converts to the local
currency with the region's `exchange_rate` (local = CU × rate), so switching the country changes every price, the
currency and the VAT rate at once. Rates are fractions (`0.1500` = 15 %).

### Price formula (`PriceCalculatorService`, used by both the cart and order creation)

```
unitPrice      = regionalPrice + Σ modifierPriceDelta        (local currency)
subtotal       = Σ unitPrice × quantity
vatAmount      = subtotal × vatRate(region)
amountInclVat  = subtotal + vatAmount
discountRate   = rate of the highest discount_rules threshold ≤ amountInclVat (thresholds in CU × exchangeRate)
discountAmount = amountInclVat × discountRate
deliveryFee    = zone fee (DELIVERY only), added after the discount
total          = amountInclVat − discountAmount + deliveryFee
```

Discount thresholds (CU): 100 → 3 %, 500 → 5 %, 700 → 7 %, 1000 → 10 %, 5000 → 15 %.
Every step is a `BigDecimal` rounded `HALF_UP` to two decimals, so the frontend preview, the API, the order snapshot
and the PDF show identical numbers. The server ignores any prices or totals sent by the client.

### Orders

`POST /api/orders` validates the customer (name, phone 7–15 digits, email), `orderDate` (today or later), fulfillment
(`PICKUP` with a pickup point or `DELIVERY` with a zone) and the time slot; the slot's capacity is checked inside the
transaction (pessimistic row lock on the slot), so parallel orders cannot overbook it (409). All amounts, product names and
modifier choices are stored as a snapshot; later price changes never alter order history. Order numbers are
`CC-<year>-<sequence>`.

Guests are tied to the browser by the `X-Client-Id` header; signed-in customers see the orders of their email
(`GET /api/orders/my`). Signing in with another email on the same browser never shows the previous account's orders.

### Bookings

`POST /api/bookings` picks the smallest free table (capacity ≥ guests) at the pickup point for the date and slot;
a conflict returns 409 and a success returns a booking number.

### Sign-in and roles (RBAC)

Passwordless: `POST /api/auth/request-code` emails a 6-digit code (10 minutes, rate-limited),
`POST /api/auth/verify-code` returns a session token (30 days) and the role. Only token hashes are stored.

| Role | Access |
|---|---|
| `CUSTOMER` | default for every email: catalog, cart, orders, bookings, own order history |
| `VIEWER` | + read-only admin panel |
| `STAFF` | + prices and availability per region, sales reports |
| `ADMIN` | + categories and products, VAT / exchange rates, granting and revoking roles |

Bootstrap: emails in `ADMIN_EMAILS` are `ADMIN` as soon as they sign in; further roles are granted in the admin panel
(`user_roles` table, V10). Protected endpoints answer `401` without a session and `403` with an insufficient role.

### Admin panel API (`/api/admin/**`)

Categories (CRUD), products (CRUD; a product that was ever ordered is hidden instead of deleted), price and
`inStock` per product and region, region VAT / exchange rate, user roles. A new product receives the same CU price
in all 17 regions and can then be priced per region.

### Sales reports (`STAFF` / `ADMIN`)

`GET /api/reports/sales?from&to&region&groupBy=REGION|MONTH` returns KPI (orders, subtotal, VAT, discount, total)
and chart rows aggregated by one SQL statement over stored order snapshots; `GET /api/reports/export?format=PDF`
renders the same data as a PDF (filters, KPI, orders bar chart, revenue line chart, table). CSV export is produced by
the frontend from the same rows. `docs/sales-report-reconciliation.sql` is an independent query for checking the
figures.

---

## 6. Error format

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

| Status | When |
|---|---|
| 400 | validation failed, bad filters, invalid promo / modifier selection |
| 401 | session token missing or expired |
| 403 | role too low for the action |
| 404 | unknown region, product, order, category |
| 409 | product out of stock in the region, time slot full, table taken, category not empty |
| 429 | too many sign-in codes requested |
| 500 | unexpected error (no stack trace is exposed) |

---

## 7. Database migrations

| Version | Content |
|---|---|
| V1 | catalog: regions, categories, products, regional_prices, modifier groups / modifiers, discount_rules |
| V2 | orders, order_items, order-number sequence |
| V3 | seed: 5 regions, 3 categories, 12 products, prices, modifiers, discount rules |
| V4 | `orders.client_id` (guest history) |
| V5 | pickup_points, delivery_zones, time_slots, dining_tables + seeds |
| V6 | auth_codes, auth_sessions (hashes only) |
| V7 / V8 | bookings, hourly time slots, 6 tables per pickup point |
| V9 | 12 more regions with prices, modifier prices, pickup points, zones, tables (idempotent) |
| V10 | user_roles (RBAC) |

Never edit an applied migration; add a new version instead. `out-of-order: true` is enabled.

---

## 8. Project files

```
cherrycake-backend/
├── src/main/java/com/cherrycake/...       feature packages (see Architecture)
├── src/main/resources/application*.yml     profiles dev / test, springdoc, mail, CORS
├── src/main/resources/db/migration/        Flyway V1–V10
├── src/test/java/...                       unit, MockMvc and migration tests
├── docs/                                   ER diagram, reconciliation SQL, STAR write-up
├── Dockerfile, docker-compose.yml, .env.example
```
