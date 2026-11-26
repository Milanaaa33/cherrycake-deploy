# Cherry Cake — QA Suite Directory (`/qa`)

Complete Quality Assurance documentation, Postman/Newman suites, SQL reconciliation scripts, and bug templates for **QA Java (QAJ)** and **QA Frontend (QAF)**.

---

## 1. Files Index

| File | Task ID | Role | Purpose |
|---|---|---|---|
| `CC-16-test-plan.md` | CC-16 | QAJ + QAF | Master test plan, scope boundaries, tooling, exit criteria |
| `CC-16-bug-report-template.md` & `.github/ISSUE_TEMPLATE/bug_report.md` | CC-16 / CC-17 | QAJ + QAF | Standardized GitHub Issues bug template |
| `CC-16-calculation-test-cases.md` | CC-16 | QAJ | 25+ detailed pricing, VAT, discount & boundary cases |
| `generate_postman_collection.js` | CC-16 | QAJ | Generator script for Postman v2.1.0 collection & environments |
| `CherryCake_API.postman_collection.json` | CC-16 | QAJ | 8-folder Postman API suite (OpenAPI, Catalog, Cart, Fulfillment, Auth/RBAC, Orders, Bookings, Reports/PDF) |
| `CherryCake_Local.postman_environment.json` | CC-16 | QAJ | Localhost (`http://localhost:8080`) environment |
| `CherryCake_Staging.postman_environment.json` | CC-16 | QAJ | Render staging (`https://cherrycake-deploy.onrender.com`) environment |
| `CC-33-cart-calculation-report.md` | CC-33 | QAJ | Verification report for `/api/cart/calculate` |
| `CC-47-order-api-scenarios.md` | CC-47 | QAJ | Order creation, validation, `X-Client-Id` & persistence scenarios |
| `CC-56-reconciliation-queries.sql` | CC-56 | QAJ | Independent SQL queries for the 3 report filter sets |
| `CC-56-reports-reconciliation.md` | CC-56 | QAJ | `Web = PDF = SQL` verification protocol |
| `CC-74-bonus-scenarios.md` | CC-74 | QAJ + QAF | Stage 4 bonus scenarios (fulfillment, slots, table bookings, `409` conflicts) |
| `CC-17-frontend-checklist-and-a11y.md` | CC-17 | QAF | UI tokens, accessibility gates, `/ui-kit` audit & axe/Lighthouse commands |
| `CC-17-responsive-matrix.md` | CC-17 | QAF | `320 / 768 / 1200 px` & WCAG coverage matrix |
| `CC-34-menu-cart-responsive-report.md` | CC-34 | QAF | Menu & Cart responsive audit |
| `CC-48-checkout-validation-report.md` | CC-48 | QAF | Checkout validation & API error handling report |
| `CC-57-full-ui-regression-report.md` | CC-57 | QAF | Full frontend UI regression summary |
| `CC-63-final-regression-report.md` | CC-63 | QAJ + QAF | Combined final staging regression & release readiness sign-off |

---

## 2. Automated QA Tests in Codebase

### Backend (`cherrycake-backend/src/test/java`)
- `com.cherrycake.pricing.service.QaFormulaVerificationTests` — 37 automated assertions covering all 25+ CC-16 pricing & boundary cases.
- `com.cherrycake.report.QaReportReconciliationTests` — MockMvc + JDBC + PDF text extraction reconciling `Web JSON = Exported PDF = SQL` across all 3 CC-56 filter sets.

### Frontend (`cherrycake-frontend/src/pages`)
- `UIKit.test.tsx` (CC-17)
- `Checkout.test.tsx` (CC-48)
- `Booking.test.tsx` (CC-74)

---

## 3. Quick Run Commands

```bash
# Regenerate Postman artifacts
node qa/generate_postman_collection.js

# Run read-only + stateless API verification against Staging (safe for prod DB)
newman run qa/CherryCake_API.postman_collection.json \
  -e qa/CherryCake_Staging.postman_environment.json \
  --folder "01 - System & OpenAPI Contract" \
  --folder "02 - Catalog & Modifiers" \
  --folder "03 - Cart Calculations (CC-16 & CC-33)" \
  --folder "04 - Fulfillment Read Endpoints & Delivery Fee Calc (CC-74 Bonus)" \
  --folder "05 - Auth & RBAC Security Smoke"

# Run full collection against a local test database (includes Orders, Bookings, and Reports if authToken is set)
newman run qa/CherryCake_API.postman_collection.json -e qa/CherryCake_Local.postman_environment.json

# Run backend QA tests
cd cherrycake-backend && mvn --batch-mode clean verify

# Run frontend QA tests, build & lint
cd cherrycake-frontend && npm run build && npm test && npm run lint
```
