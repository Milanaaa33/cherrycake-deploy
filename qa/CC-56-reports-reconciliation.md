# CC-56 — Sales Reports Reconciliation Protocol (`Web = PDF = SQL`)

**Task:** CC-56 (QAJ — Mandatory, Week 4)  
**Web Route:** `/reports` (requires signed-in user with `STAFF` or `ADMIN` role)  
**API Endpoints:** `GET /api/reports/sales` & `GET /api/reports/export?format=PDF`  
**SQL Queries:** [`CC-56-reconciliation-queries.sql`](./CC-56-reconciliation-queries.sql)  
**Automated Test Coverage:** `cherrycake-backend/src/test/java/com/cherrycake/report/QaReportReconciliationTests.java` and `ReportControllerTests.java`

---

## 1. Security & Access Precondition

In `cherrycake-deploy`, both `GET /api/reports/sales` and `GET /api/reports/export` enforce RBAC (`STAFF` or `ADMIN`):
- Unauthenticated request -> `401 Unauthorized`
- `CUSTOMER` or `VIEWER` session -> `403 Forbidden`
- `STAFF` or `ADMIN` session (`Authorization: Bearer <token>`) -> `200 OK`

---

## 2. Reconciliation Procedure (3 Required Filter Sets)

For each filter set below, run:
1. **Web UI:** Open `/reports`, set the exact filters, inspect KPI cards + Chart.js histograms + data table.
2. **PDF Export:** Click **Download PDF** (calls `GET /api/reports/export?format=PDF&...`) and verify header filters, KPI table, row labels/totals, and embedded JFreeChart images.
3. **SQL Snapshot:** Execute the corresponding query block in [`CC-56-reconciliation-queries.sql`](./CC-56-reconciliation-queries.sql) directly against PostgreSQL.

| Filter Set | `from` | `to` | `region` | `groupBy` | Expected Currency | Key Checks |
|---|---|---|---|---|---|---|
| **Set 1** | `<today - 5 months (1st)>` (e.g. `2026-06-01`) | `<today>` (e.g. `2026-11-30`) | *(All regions)* | `REGION` | `MIXED` (when multiple currencies present) | Sum of `rows[].ordersCount == kpi.ordersCount`; Web & PDF show MIXED note without fabricated USD conversion |
| **Set 2** | `<today - 5 months (1st)>` | `<today>` | `UZB` | `MONTH` | `UZS` | Chronological `YYYY-MM` buckets; `kpi.subtotalSum`, `vatSum`, `discountSum`, `totalSum`, `averageOrderValue` match SQL `ROUND(SUM/COUNT, 2)` |
| **Set 3** | `<current month 1st>` (e.g. `2026-11-01`) | `<current month end>` | *(All regions)* | `REGION` | `MIXED` / single if 1 region | Boundary dates are **inclusive** on `orders.order_date` (not `created_at`) |

---

## 3. Reconciliation Checklist Matrix

| Check Item | Set 1 (All / 6m / REGION) | Set 2 (UZB / 6m / MONTH) | Set 3 (1m / All / REGION) | Automated Proof |
|---|---|---|---|---|
| `kpi.ordersCount` matches SQL `COUNT(*)` | PASS | PASS | PASS | `QaReportReconciliationTests` |
| `kpi.subtotalSum`, `vatSum`, `discountSum`, `totalSum` match SQL `SUM(...)` | PASS | PASS | PASS | `QaReportReconciliationTests` |
| `kpi.averageOrderValue` equals `ROUND(total / count, 2)` (`HALF_UP`) | PASS | PASS | PASS | `QaReportReconciliationTests` |
| Every chart/table `row(label, ordersCount, total)` matches SQL `GROUP BY` | PASS | PASS | PASS | `QaReportReconciliationTests` |
| PDF includes exact filter summary, KPI figures, all row totals, and 2 chart images | PASS | PASS | PASS | `QaReportReconciliationTests` & `ReportControllerTests` |
| Frontend renders API numbers directly without client recalculation or `$` hardcodes | PASS | PASS | PASS | `cherrycake-frontend/src/pages/Reports.test.tsx` |
