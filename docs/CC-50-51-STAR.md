# STAR Report CC-50 and CC-51

## Situation
The Cherry Cake report page displayed mock sales figures and used browser printing for PDF export. The team needed reports based on saved orders, with matching date and country filters and grouping by region or month.

## Task
My BE2 tasks were to implement GET /api/reports/sales and GET /api/reports/export?format=PDF. The sales API had to return the agreed KPI fields and chart rows, with numbers equal to SQL sales reports. The PDF had to include the same filters and figures as the web report.

## Action
I implemented parameterized SQL aggregation over stored order snapshots, with inclusive dates and REGION/MONTH grouping. KPI components and chart rows come from a single query. I added OpenPDF and JFreeChart export with order and revenue charts, KPI values and a breakdown table. Long reports paginate without dropping rows.

I also connected the existing report page to the API, replaced the mock country and grouping controls, and wired its PDF button to the server endpoint. The page handles loading, errors, empty results and outdated responses. Mixed-currency sums are clearly labelled in both outputs.

## Result
The backend build and all 150 tests passed. All 20 frontend tests passed, and the production frontend build succeeded. I also checked 24 filter/grouping cases against independent PostgreSQL queries and inspected short and long PDF exports. Frontend lint completed with existing warnings outside the report changes.

The implementation is ready for review on branch feat/CC-50-51-sales-reports-pdf. Publishing a PR depends on available GitHub access; it has not been claimed as merged or deployed.
