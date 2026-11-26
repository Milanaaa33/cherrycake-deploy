# CC-33 — Cart Calculation Verification Report (`POST /api/cart/calculate`)

**Task:** CC-33 (QAJ — Mandatory, Week 2)  
**Target Endpoint:** `POST /api/cart/calculate`  
**Verified Against:**
- Unit formula suite: `PriceCalculatorServiceTests` + `QaFormulaVerificationTests`
- Live Staging API: `https://cherrycake-deploy.onrender.com/api/cart/calculate` via Newman (`03 - Cart Calculations` & `04 - Fulfillment Read Endpoints`)

---

## 1. Execution Summary

| Verification Layer | Executed | Passed | Failed | Scope Covered |
|---|---:|---:|---:|---|
| **JUnit 5 (`QaFormulaVerificationTests`)** | 37 | 37 | 0 | All 25+ CC-16 scenarios: TC-01..TC-15, TC-21 (5-country 100 boundaries), TC-22 (`MULTI` modifiers), TC-23 (country switch), TC-24 (delivery + discount), TC-25 (`HALF_UP` step rounding) |
| **JUnit 5 (`PriceCalculatorServiceTests`)** | 33 | 33 | 0 | Existing BE1 formula unit suite |
| **Newman Live Staging (`03 - Cart Calculations`)** | 14 requests | 14 | 0 | `CALC-01`..`CALC-14`: UZB/GEO/KAZ/UKR/CHN/TUR calculations, MULTI modifiers, `400` qty `0`/`-1`/empty/missing-region/duplicate-modifier, `404` `XYZ`, `409` out-of-stock Napoleon in GEO |
| **Newman Live Staging (`04` delivery fee checks)** | 2 requests | 2 | 0 | Center (`+15000.00 UZS`) after 3% discount & Suburbs (`+25000.00 UZS`) without shifting discount threshold |

---

## 2. Key Verifications Confirmed

1. **HALF_UP Rounding:** Verified step-by-step rounding (`subtotal -> vatAmount -> amountInclVat -> discountAmount -> total`) to 2 decimals.
2. **VAT Before Discount Tier Selection:** `GEO` subtotal `90.00` + `12% VAT (10.80)` = `100.80` -> `3%` discount (`3.02`) -> `97.78`.
3. **Delivery Exclusion:** Adding delivery fee (`15000.00` or `25000.00 UZS`) does not promote `amountInclVat` (`207000.00 UZS`) over the `300000.00 UZS` threshold.
4. **Error Contract (`ErrorResponse`):** All `400`, `404`, and `409` cases return structured `ErrorResponse` payloads cleanly.
5. **Open Bugs:** None in calculation logic (`0 Critical`, `0 High`).
