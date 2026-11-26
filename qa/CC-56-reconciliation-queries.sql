-- CC-56: SQL Reconciliation Queries for Sales Reports (Web = PDF = SQL)
-- Matches the exact SQL semantics of SalesReportRepository.java in cherrycake-backend.
-- Note: Replace date literals / region code when reconciling specific filter combinations.

-- ============================================================================
-- FILTER SET 1: All countries, 6-month window, grouped by REGION
-- Equivalent API calls:
--   GET /api/reports/sales?from=2026-06-01&to=2026-11-30&groupBy=REGION
--   GET /api/reports/export?format=PDF&from=2026-06-01&to=2026-11-30&groupBy=REGION
-- ============================================================================

-- 1A. KPI Totals (All Regions, 6 Months)
SELECT
    COUNT(*)                                                                  AS orders_count,
    COALESCE(SUM(o.subtotal), 0.00)                                           AS subtotal_sum,
    COALESCE(SUM(o.vat_amount), 0.00)                                         AS vat_sum,
    COALESCE(SUM(o.discount_amount), 0.00)                                    AS discount_sum,
    COALESCE(SUM(o.total), 0.00)                                              AS total_sum,
    CASE
        WHEN COUNT(*) = 0 THEN 0.00
        ELSE ROUND(SUM(o.total) / COUNT(*), 2)
    END                                                                       AS average_order_value,
    CASE
        WHEN COUNT(DISTINCT o.currency_code) = 0 THEN NULL
        WHEN COUNT(DISTINCT o.currency_code) = 1 THEN MIN(o.currency_code)
        ELSE 'MIXED'
    END                                                                       AS currency_code
FROM orders o
JOIN regions r ON r.id = o.region_id
WHERE o.order_date >= DATE '2026-06-01'
  AND o.order_date <= DATE '2026-11-30';

-- 1B. Chart / Table Rows Grouped by Region
SELECT
    r.code                                                                    AS label,
    COUNT(*)                                                                  AS orders_count,
    SUM(o.total)                                                              AS total
FROM orders o
JOIN regions r ON r.id = o.region_id
WHERE o.order_date >= DATE '2026-06-01'
  AND o.order_date <= DATE '2026-11-30'
GROUP BY r.code
ORDER BY r.code;


-- ============================================================================
-- FILTER SET 2: Single country (UZB), 6-month window, grouped by MONTH
-- Equivalent API calls:
--   GET /api/reports/sales?from=2026-06-01&to=2026-11-30&region=UZB&groupBy=MONTH
--   GET /api/reports/export?format=PDF&from=2026-06-01&to=2026-11-30&region=UZB&groupBy=MONTH
-- ============================================================================

-- 2A. KPI Totals (UZB, 6 Months)
SELECT
    COUNT(*)                                                                  AS orders_count,
    COALESCE(SUM(o.subtotal), 0.00)                                           AS subtotal_sum,
    COALESCE(SUM(o.vat_amount), 0.00)                                         AS vat_sum,
    COALESCE(SUM(o.discount_amount), 0.00)                                    AS discount_sum,
    COALESCE(SUM(o.total), 0.00)                                              AS total_sum,
    CASE
        WHEN COUNT(*) = 0 THEN 0.00
        ELSE ROUND(SUM(o.total) / COUNT(*), 2)
    END                                                                       AS average_order_value,
    'UZS'                                                                     AS currency_code
FROM orders o
JOIN regions r ON r.id = o.region_id
WHERE r.code = 'UZB'
  AND o.order_date >= DATE '2026-06-01'
  AND o.order_date <= DATE '2026-11-30';

-- 2B. Chart / Table Rows Grouped by Year-Month (YYYY-MM)
SELECT
    TO_CHAR(o.order_date, 'YYYY-MM')                                          AS label,
    COUNT(*)                                                                  AS orders_count,
    SUM(o.total)                                                              AS total
FROM orders o
JOIN regions r ON r.id = o.region_id
WHERE r.code = 'UZB'
  AND o.order_date >= DATE '2026-06-01'
  AND o.order_date <= DATE '2026-11-30'
GROUP BY EXTRACT(YEAR FROM o.order_date), EXTRACT(MONTH FROM o.order_date), TO_CHAR(o.order_date, 'YYYY-MM')
ORDER BY EXTRACT(YEAR FROM o.order_date), EXTRACT(MONTH FROM o.order_date);


-- ============================================================================
-- FILTER SET 3: Single calendar month, all countries, grouped by REGION
-- Equivalent API calls:
--   GET /api/reports/sales?from=2026-11-01&to=2026-11-30&groupBy=REGION
--   GET /api/reports/export?format=PDF&from=2026-11-01&to=2026-11-30&groupBy=REGION
-- ============================================================================

-- 3A. KPI Totals (Single Month)
SELECT
    COUNT(*)                                                                  AS orders_count,
    COALESCE(SUM(o.subtotal), 0.00)                                           AS subtotal_sum,
    COALESCE(SUM(o.vat_amount), 0.00)                                         AS vat_sum,
    COALESCE(SUM(o.discount_amount), 0.00)                                    AS discount_sum,
    COALESCE(SUM(o.total), 0.00)                                              AS total_sum,
    CASE
        WHEN COUNT(*) = 0 THEN 0.00
        ELSE ROUND(SUM(o.total) / COUNT(*), 2)
    END                                                                       AS average_order_value,
    CASE
        WHEN COUNT(DISTINCT o.currency_code) = 0 THEN NULL
        WHEN COUNT(DISTINCT o.currency_code) = 1 THEN MIN(o.currency_code)
        ELSE 'MIXED'
    END                                                                       AS currency_code
FROM orders o
JOIN regions r ON r.id = o.region_id
WHERE o.order_date >= DATE '2026-11-01'
  AND o.order_date <= DATE '2026-11-30';

-- 3B. Chart / Table Rows Grouped by Region (Single Month)
SELECT
    r.code                                                                    AS label,
    COUNT(*)                                                                  AS orders_count,
    SUM(o.total)                                                              AS total
FROM orders o
JOIN regions r ON r.id = o.region_id
WHERE o.order_date >= DATE '2026-11-01'
  AND o.order_date <= DATE '2026-11-30'
GROUP BY r.code
ORDER BY r.code;
