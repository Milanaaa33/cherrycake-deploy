---
name: Bug Report (QAJ / QAF)
about: Standardized bug report template for CherryCake API (QAJ) and Frontend (QAF) defects
title: "[BUG] <short summary>"
labels: bug
---

## Summary
<!-- Concise description of the defect -->

## Metadata
- **Module / Area:** `Catalog` | `Cart Calculation` | `Orders` | `Reports & PDF` | `Fulfillment (Pickup / Delivery / Slots)` | `Table Booking` | `Auth / Admin` | `Frontend UI / A11y / Responsive`
- **Priority:** `Critical` | `High` | `Medium` | `Low`
  - *Critical*: Blocker, crash, data corruption, wrong payment/VAT/discount calculation, 500 error on core flow
  - *High*: Major functional/validation defect, broken responsive layout, critical a11y barrier
  - *Medium*: Non-blocking visual glitch, secondary edge case, minor contract mismatch
  - *Low*: Cosmetic issue, typo, minor spacing/polish
- **Severity / Scope:** `Mandatory (Stages 1–3, 5)` | `Bonus (Stage 4)`
- **Reporter Role:** `QAJ` | `QAF`
- **Related Task ID:** e.g. `CC-16`, `CC-33`, `CC-47`, `CC-56`, `CC-74`, `CC-17`, `CC-34`, `CC-48`, `CC-57`, `CC-63`

## Environment
- **Environment URL:** `https://cherrycake-deploy.onrender.com` / `https://cherrycake-deploy.vercel.app` / `http://localhost:8080` / `http://localhost:5173`
- **Region / Currency:** e.g. `UZB (UZS)`
- **Language / Theme:** e.g. `en / light`
- **Viewport / Device / Browser:** e.g. `320px / Chrome 131 / Windows 11` or `Postman / Newman`
- **Commit / Branch:** e.g. `master`

## Steps to Reproduce
1.
2.
3.

## Expected Result
<!-- What should happen according to CC-16 / API contract / UI spec -->

## Actual Result
<!-- What actually happened -->

## Screenshot or API Request / Response
```http
POST /api/cart/calculate
Content-Type: application/json

{
  "region": "UZB",
  "items": []
}
```
```json
{
  "status": 400,
  "message": "..."
}
```
<!-- Attach screenshots or screen recordings here for UI/responsive/PDF bugs -->
