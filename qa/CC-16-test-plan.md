# Cherry Cake — Master QA Test Plan (QAJ & QAF)

**Project:** Cherry Cake Café Web Application (ITPU Teamwork 2026 — Team 9)  
**Staging Frontend:** `https://cherrycake-deploy.vercel.app`  
**Staging Backend & Swagger UI:** `https://cherrycake-deploy.onrender.com/swagger-ui/index.html`  
**OpenAPI Spec:** `https://cherrycake-deploy.onrender.com/v3/api-docs`  
**Local Defaults:** Backend `http://localhost:8080`, Frontend `http://localhost:5173`

---

## 1. Scope Boundaries

### In Scope — Mandatory (Platform Stages 1, 2, 3, 5)
1. **Catalog & Multi-Region Pricing:** Regions (17 configured countries, currency codes, VAT rates, hidden `exchangeRate`), categories, products, and modifier groups (`SINGLE` / `MULTI`).
2. **Cart Calculation Engine (`POST /api/cart/calculate`):** Line totals `(unitPrice + modifiersPrice) * quantity`, regional VAT, `HALF_UP` 2-decimal rounding per step, threshold selection based strictly on `amountInclVat` (`100 -> 3%`, `500 -> 5%`, `700 -> 7%`, `1000 -> 10%`, `5000 -> 15%`), exchange-rate-scaled thresholds, error statuses (`400`, `404`, `409`).
3. **Guest Checkout & Orders (`POST /api/orders`, `GET /api/orders/my`, `POST /api/orders/my/claim`):** Customer validation (name, phone, email), `orderDate >= today`, server-side recalculation matching `/api/cart/calculate`, order number generation (`CC-YYYY-NNNNNN`), database persistence, and validation error handling.
4. **Sales Reports & PDF Export (`GET /api/reports/sales`, `GET /api/reports/export`):** Date/region/grouping filters (`MONTH`, `REGION`), KPIs (`ordersCount`, `subtotalSum`, `vatSum`, `discountSum`, `totalSum`, `averageOrderValue`), `MIXED` multi-currency handling, Chart.js web charts = PDF report (with JFreeChart histograms) = PostgreSQL SQL snapshot, and RBAC (`STAFF` / `ADMIN` required).
5. **Frontend UI & Accessibility (QAF):** Design tokens (`tokens.css`, `dark.css`), `/ui-kit` showcase, component states (hover, focus-visible, error, disabled, loading), keyboard navigation, WCAG AA contrast (`>= 4.5:1`), `aria-label` / `aria-invalid`, responsive breakpoints (`320px`, `768px`, `1200px`), `200%` zoom, `>= 44px` touch targets, `axe-core` and Lighthouse (`>= 90`).

### In Scope — Bonus (Platform Stage 4 — Tested Separately After Mandatory)
- **Fulfillment:** `GET /api/pickup-points`, `GET /api/delivery-zones`, `GET /api/time-slots`, delivery fee added *after* discount without shifting thresholds, slot capacity enforcement & `409 Conflict` when full.
- **Table Bookings:** `POST /api/bookings`, table capacity selection, shared time-slot quota with orders, past date / invalid guest count (`1–12`) `400` checks, and `409 Conflict` when no tables fit/remain.

### Out of Scope
- User registration/passwords, personal profiles with passwords, order status tracking workflows, promo codes. *(Note: Passwordless email-code sign-in and Admin RBAC exist in `cherrycake-deploy` and are covered by smoke/RBAC auth checks as prerequisites for `/api/reports/**`.)*

---

## 2. QA Roles & Execution Plan

| ID | Role | Task | Artifact |
|---|---|---|---|
| **CC-16** | QAJ | Test plan, bug template, >=25 calculation cases (shared with BE1), Postman collection from Swagger | `CC-16-test-plan.md`, `CC-16-bug-report-template.md`, `CC-16-calculation-test-cases.md`, `CherryCake_API.postman_collection.json` |
| **CC-17** | QAF | UI & a11y checklist, 320/768/1200 responsive matrix, `/ui-kit` verification | `CC-17-frontend-checklist-and-a11y.md`, `CC-17-responsive-matrix.md`, `UIKit.test.tsx` |
| **CC-33** | QAJ | Run calculation cases through `POST /api/cart/calculate`, verify cart math | `CC-33-cart-calculation-report.md`, `QaFormulaVerificationTests.java` |
| **CC-34** | QAF | Responsive audit of Menu and Cart on 320 / 768 / 1200 px | `CC-34-menu-cart-responsive-report.md` |
| **CC-47** | QAJ | Order API end-to-end & negative validation scenarios | `CC-47-order-api-scenarios.md` |
| **CC-48** | QAF | Checkout form validation, keyboard nav, API error banner display | `CC-48-checkout-validation-report.md`, `Checkout.test.tsx` |
| **CC-56** | QAJ | Reconcile Web (`/reports`) = PDF (`/api/reports/export`) = SQL on 3 filter sets | `CC-56-reports-reconciliation.md`, `CC-56-reconciliation-queries.sql`, `QaReportReconciliationTests.java` |
| **CC-57** | QAF | Full UI regression across all pages & themes | `CC-57-full-ui-regression-report.md` |
| **CC-74** | QAJ+QAF | Bonus API & UI tests: pickup, delivery, time slots, bookings, `409` conflicts | `CC-74-bonus-scenarios.md`, `Booking.test.tsx` |
| **CC-63** | QAJ+QAF | Final combined staging regression & release readiness sign-off | `CC-63-final-regression-report.md` |

---

## 3. Tooling & Environments

- **API Testing:** Postman (`qa/CherryCake_API.postman_collection.json`) + Newman CLI (`qa/CherryCake_Local.postman_environment.json`, `qa/CherryCake_Staging.postman_environment.json`), Swagger UI (`/swagger-ui/index.html`)
- **Backend Automated Verification:** Maven + JUnit 5 + MockMvc + AssertJ (`mvn clean verify`)
- **Frontend Automated Verification:** Vitest + React Testing Library (`npm test`), TypeScript strict (`npm run build`), `oxlint` (`npm run lint`)
- **Accessibility & Responsive:** Chrome DevTools (`320×568`, `768×1024`, `1200×800`, `200%` zoom), `@axe-core/cli` / Axe DevTools, Chrome Lighthouse
- **Database Reconciliation:** PostgreSQL / JDBC SQL queries (`qa/CC-56-reconciliation-queries.sql`)

---

## 4. Entry & Exit Criteria

**Entry Criteria:**
- Backend builds cleanly (`mvn clean test-compile`) and exposes `/v3/api-docs`.
- Frontend builds cleanly (`npm run build`) with `/ui-kit` and all target routes mounted.

**Exit Criteria (Release Gate):**
1. Zero `Critical` or `High` open bugs.
2. `25 / 25` CC-16 pricing & boundary test cases pass with `HALF_UP` 2-decimal precision.
3. All mandatory API endpoints pass status, schema, and error-contract (`ErrorResponse`) assertions.
4. `Web KPIs & Chart = Exported PDF = Independent SQL` across all 3 filter sets (`CC-56`).
5. All UI pages pass `320 / 768 / 1200 px` layout check, keyboard navigation, and Lighthouse Accessibility `>= 90` with 0 critical `axe` errors.
6. Bonus flows (fulfillment options, slot exhaustion `409`, table bookings `201` / `409`) verified independently.
