-- PostgreSQL reference queries for independent reconciliation.
-- Replace these literal dates/code with the exact request filters. Omit the region predicate for all countries.
-- These queries intentionally sum the saved local amounts without currency conversion.
SELECT COUNT(*) AS orders_count, COALESCE(SUM(o.subtotal), 0) AS subtotal_sum,
       COALESCE(SUM(o.vat_amount), 0) AS vat_sum, COALESCE(SUM(o.discount_amount), 0) AS discount_sum,
       COALESCE(SUM(o.total), 0) AS total_sum
FROM orders o JOIN regions r ON r.id = o.region_id
WHERE o.order_date BETWEEN DATE '2026-01-01' AND DATE '2026-06-30' AND r.code = 'UZB';

SELECT r.code AS label, COUNT(*) AS orders_count, SUM(o.total) AS total
FROM orders o JOIN regions r ON r.id = o.region_id
WHERE o.order_date BETWEEN DATE '2026-01-01' AND DATE '2026-06-30'
GROUP BY r.code ORDER BY r.code;

SELECT to_char(o.order_date, 'YYYY-MM') AS label, COUNT(*) AS orders_count, SUM(o.total) AS total
FROM orders o JOIN regions r ON r.id = o.region_id
WHERE o.order_date BETWEEN DATE '2026-01-01' AND DATE '2026-06-30' AND r.code = 'UZB'
GROUP BY to_char(o.order_date, 'YYYY-MM') ORDER BY to_char(o.order_date, 'YYYY-MM');
