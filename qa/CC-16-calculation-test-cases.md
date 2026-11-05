# CC-16 — Cart Calculation Test Cases

**Endpoint:** `POST /api/cart/calculate`  
**Testing method:** API Testing (Postman)  
**Rounding mode:** HALF_UP, 2 decimal places.

## General Calculation Rules

### VAT Rates by Country

| Country | Region Code | VAT Rate | Currency |
|---|---|---:|---|
| Uzbekistan | UZB | 15% | UZS |
| Kazakhstan | KAZ | 20% | KZT |
| Georgia | GEO | 12% | GEL |
| Ukraine | UKR | 8% | UAH |
| China | CHN | 18% | CNY |

### Discount Rules

| Order Amount Including VAT | Discount |
|---|---:|
| 100 and above | 3% |
| 500 and above | 5% |
| 700 and above | 7% |
| 1000 and above | 10% |
| 5000 and above | 15% |

### Calculation Formulas

1. `lineTotal = (unitPrice + modifiersPrice) × quantity`
2. `subtotal = sum(lineTotal)`
3. `vatAmount = subtotal × vatRate`
4. `amountInclVat = subtotal + vatAmount`
5. `discountRate` is selected based on `amountInclVat`.
6. `discountAmount = amountInclVat × discountRate`
7. `total = amountInclVat − discountAmount + deliveryFee`

All monetary calculations must use HALF_UP rounding to 2 decimal places after each calculation step.

---

## TC-01. UZB — 10% Discount for Orders Above 1000

**Test Scenario:**

Verify VAT calculation and the application of a 10% discount when the order amount including VAT exceeds 1000.

**Request:**
- Country: UZB
- Subtotal: 1000.00
- VAT Rate: 15%
- Delivery Fee: 0.00

**Calculation Steps:**

1. subtotal = 1000.00
2. vatAmount = 1000.00 × 0.15 = 150.00
3. amountInclVat = 1000.00 + 150.00 = 1150.00
4. discountRate = 10%
5. discountAmount = 1150.00 × 0.10 = 115.00
6. total = 1150.00 − 115.00 = 1035.00

**Expected Response:**

```json
{
  "subtotal": 1000.00,
  "vatRate": 0.1500,
  "vatAmount": 150.00,
  "amountInclVat": 1150.00,
  "discountRate": 0.1000,
  "discountAmount": 115.00,
  "deliveryFee": 0.00,
  "total": 1035.00,
  "currencyCode": "UZS"
}
```

---

## TC-02. KAZ — 3% Discount for an Order Amount of 480

**Test Scenario:**

Verify that the minimum 3% discount is applied when the order amount including VAT reaches 100.

**Request:**
- Country: KAZ
- Subtotal: 400.00
- VAT Rate: 20%
- Delivery Fee: 0.00

**Calculation Steps:**

1. subtotal = 400.00
2. vatAmount = 400.00 × 0.20 = 80.00
3. amountInclVat = 480.00
4. discountRate = 3%
5. discountAmount = 480.00 × 0.03 = 14.40
6. total = 480.00 − 14.40 = 465.60

**Expected Response:**

```json
{
  "subtotal": 400.00,
  "vatRate": 0.2000,
  "vatAmount": 80.00,
  "amountInclVat": 480.00,
  "discountRate": 0.0300,
  "discountAmount": 14.40,
  "deliveryFee": 0.00,
  "total": 465.60,
  "currencyCode": "KZT"
}
```

---

## TC-03. GEO — Discount Threshold Reached Due to VAT

**Test Scenario:**

The subtotal is below 100, but the amount including VAT exceeds 100. The 3% discount must be applied because the threshold is checked using `amountInclVat`.

**Request:**
- Country: GEO
- Subtotal: 90.00
- VAT Rate: 12%
- Delivery Fee: 0.00

**Calculation Steps:**

1. subtotal = 90.00
2. vatAmount = 90.00 × 0.12 = 10.80
3. amountInclVat = 90.00 + 10.80 = 100.80
4. discountRate = 3%
5. discountAmount = 100.80 × 0.03 = 3.024 → 3.02
6. total = 100.80 − 3.02 = 97.78

**Expected Response:**

```json
{
  "subtotal": 90.00,
  "vatRate": 0.1200,
  "vatAmount": 10.80,
  "amountInclVat": 100.80,
  "discountRate": 0.0300,
  "discountAmount": 3.02,
  "deliveryFee": 0.00,
  "total": 97.78,
  "currencyCode": "GEL"
}
```

---

## TC-04. UZB — Order Amount Below the Discount Threshold

**Test Scenario:**

Verify that no discount is applied when the amount including VAT is below 100.

**Request:**
- Country: UZB
- Subtotal: 85.00
- VAT Rate: 15%
- Delivery Fee: 0.00

**Calculation Steps:**

1. subtotal = 85.00
2. vatAmount = 85.00 × 0.15 = 12.75
3. amountInclVat = 97.75
4. discountRate = 0%
5. discountAmount = 0.00
6. total = 97.75

**Expected Response:**

```json
{
  "subtotal": 85.00,
  "vatRate": 0.1500,
  "vatAmount": 12.75,
  "amountInclVat": 97.75,
  "discountRate": 0.0000,
  "discountAmount": 0.00,
  "deliveryFee": 0.00,
  "total": 97.75,
  "currencyCode": "UZS"
}
```

---

## TC-05. CHN — Maximum Discount of 15%

**Test Scenario:**

Verify that the maximum 15% discount is applied when the amount including VAT reaches 5000.

**Request:**
- Country: CHN
- Subtotal: 4300.00
- VAT Rate: 18%
- Delivery Fee: 0.00

**Calculation Steps:**

1. subtotal = 4300.00
2. vatAmount = 4300.00 × 0.18 = 774.00
3. amountInclVat = 5074.00
4. discountRate = 15%
5. discountAmount = 5074.00 × 0.15 = 761.10
6. total = 5074.00 − 761.10 = 4312.90

**Expected Response:**

```json
{
  "subtotal": 4300.00,
  "vatRate": 0.1800,
  "vatAmount": 774.00,
  "amountInclVat": 5074.00,
  "discountRate": 0.1500,
  "discountAmount": 761.10,
  "deliveryFee": 0.00,
  "total": 4312.90,
  "currencyCode": "CNY"
}
```

---

## TC-06. KAZ — Delivery Fee Does Not Affect the Discount Threshold

**Test Scenario:**

The amount including VAT is below 100, but adding the delivery fee makes the final order amount exceed 100. No discount must be applied.

**Request:**
- Country: KAZ
- Subtotal: 80.00
- VAT Rate: 20%
- Delivery Fee: 10.00

**Calculation Steps:**

1. subtotal = 80.00
2. vatAmount = 80.00 × 0.20 = 16.00
3. amountInclVat = 96.00
4. discountRate = 0%
5. discountAmount = 0.00
6. total = 96.00 + 10.00 = 106.00

**Expected Response:**

```json
{
  "subtotal": 80.00,
  "vatRate": 0.2000,
  "vatAmount": 16.00,
  "amountInclVat": 96.00,
  "discountRate": 0.0000,
  "discountAmount": 0.00,
  "deliveryFee": 10.00,
  "total": 106.00,
  "currencyCode": "KZT"
}
```

---

## TC-07. UKR — Application of the 3% Discount

**Test Scenario:**

Verify VAT and discount calculations for Ukraine when the amount including VAT exceeds 100.

**Request:**
- Country: UKR
- Subtotal: 100.00
- VAT Rate: 8%
- Delivery Fee: 0.00

**Calculation Steps:**

1. subtotal = 100.00
2. vatAmount = 100.00 × 0.08 = 8.00
3. amountInclVat = 108.00
4. discountRate = 3%
5. discountAmount = 108.00 × 0.03 = 3.24
6. total = 108.00 − 3.24 = 104.76

**Expected Response:**

```json
{
  "subtotal": 100.00,
  "vatRate": 0.0800,
  "vatAmount": 8.00,
  "amountInclVat": 108.00,
  "discountRate": 0.0300,
  "discountAmount": 3.24,
  "deliveryFee": 0.00,
  "total": 104.76,
  "currencyCode": "UAH"
}
```

---

## TC-08. GEO — Application of the 10% Discount

**Test Scenario:**

Verify that a 10% discount is applied when the amount including VAT reaches 1000.

**Request:**
- Country: GEO
- Subtotal: 1000.00
- VAT Rate: 12%
- Delivery Fee: 0.00

**Calculation Steps:**

1. subtotal = 1000.00
2. vatAmount = 120.00
3. amountInclVat = 1120.00
4. discountRate = 10%
5. discountAmount = 112.00
6. total = 1008.00

**Expected Response:**

```json
{
  "subtotal": 1000.00,
  "vatRate": 0.1200,
  "vatAmount": 120.00,
  "amountInclVat": 1120.00,
  "discountRate": 0.1000,
  "discountAmount": 112.00,
  "deliveryFee": 0.00,
  "total": 1008.00,
  "currencyCode": "GEL"
}
```

---

## TC-09. CHN — 3% Discount for an Order Amount of 118

**Test Scenario:**

Verify the minimum discount calculation for China.

**Request:**
- Country: CHN
- Subtotal: 100.00
- VAT Rate: 18%
- Delivery Fee: 0.00

**Calculation Steps:**

1. subtotal = 100.00
2. vatAmount = 18.00
3. amountInclVat = 118.00
4. discountRate = 3%
5. discountAmount = 3.54
6. total = 114.46

**Expected Response:**

```json
{
  "subtotal": 100.00,
  "vatRate": 0.1800,
  "vatAmount": 18.00,
  "amountInclVat": 118.00,
  "discountRate": 0.0300,
  "discountAmount": 3.54,
  "deliveryFee": 0.00,
  "total": 114.46,
  "currencyCode": "CNY"
}
```

---

## TC-10. UZB — Application of the 5% Discount

**Test Scenario:**

Verify that a 5% discount is applied when the amount including VAT reaches 500.

**Request:**
- Country: UZB
- Subtotal: 500.00
- VAT Rate: 15%
- Delivery Fee: 0.00

**Calculation Steps:**

1. subtotal = 500.00
2. vatAmount = 75.00
3. amountInclVat = 575.00
4. discountRate = 5%
5. discountAmount = 28.75
6. total = 546.25

**Expected Response:**

```json
{
  "subtotal": 500.00,
  "vatRate": 0.1500,
  "vatAmount": 75.00,
  "amountInclVat": 575.00,
  "discountRate": 0.0500,
  "discountAmount": 28.75,
  "deliveryFee": 0.00,
  "total": 546.25,
  "currencyCode": "UZS"
}
```

---

## TC-11. UKR — 5% Discount for an Order Amount of 648

**Test Scenario:**

Verify the application of the 5% discount when the amount including VAT reaches 500.

**Request:**
- Country: UKR
- Subtotal: 600.00
- VAT Rate: 8%
- Delivery Fee: 0.00

**Calculation Steps:**

1. subtotal = 600.00
2. vatAmount = 48.00
3. amountInclVat = 648.00
4. discountRate = 5%
5. discountAmount = 32.40
6. total = 615.60

**Expected Response:**

```json
{
  "subtotal": 600.00,
  "vatRate": 0.0800,
  "vatAmount": 48.00,
  "amountInclVat": 648.00,
  "discountRate": 0.0500,
  "discountAmount": 32.40,
  "deliveryFee": 0.00,
  "total": 615.60,
  "currencyCode": "UAH"
}
```

---

## TC-12. KAZ — Verification of the 5000 Discount Threshold

**Test Scenario:**

Verify that a 10% discount is applied instead of 15% when the amount including VAT is 4800.

**Request:**
- Country: KAZ
- Subtotal: 4000.00
- VAT Rate: 20%
- Delivery Fee: 0.00

**Calculation Steps:**

1. subtotal = 4000.00
2. vatAmount = 800.00
3. amountInclVat = 4800.00
4. discountRate = 10%
5. discountAmount = 480.00
6. total = 4320.00

**Expected Response:**

```json
{
  "subtotal": 4000.00,
  "vatRate": 0.2000,
  "vatAmount": 800.00,
  "amountInclVat": 4800.00,
  "discountRate": 0.1000,
  "discountAmount": 480.00,
  "deliveryFee": 0.00,
  "total": 4320.00,
  "currencyCode": "KZT"
}
```

---

## TC-13. KAZ — Order Amount Exactly 700

**Test Scenario:**

Verify that the 7% discount is applied when the amount including VAT is exactly 700.

**Request:**
- Country: KAZ
- Subtotal: 583.33
- VAT Rate: 20%
- Delivery Fee: 0.00

**Calculation Steps:**

1. subtotal = 583.33
2. vatAmount = 583.33 × 0.20 = 116.666 → 116.67
3. amountInclVat = 700.00
4. discountRate = 7%
5. discountAmount = 49.00
6. total = 651.00

**Expected Response:**

```json
{
  "subtotal": 583.33,
  "vatRate": 0.2000,
  "vatAmount": 116.67,
  "amountInclVat": 700.00,
  "discountRate": 0.0700,
  "discountAmount": 49.00,
  "deliveryFee": 0.00,
  "total": 651.00,
  "currencyCode": "KZT"
}
```

---

## TC-14. KAZ — Order Amount Slightly Below 700

**Test Scenario:**

Verify that a 5% discount is applied instead of 7% when the amount including VAT is 699.98.

**Request:**
- Country: KAZ
- Subtotal: 583.32
- VAT Rate: 20%
- Delivery Fee: 0.00

**Calculation Steps:**

1. subtotal = 583.32
2. vatAmount = 116.66
3. amountInclVat = 699.98
4. discountRate = 5%
5. discountAmount = 699.98 × 0.05 = 35.00
6. total = 664.98

**Expected Response:**

```json
{
  "subtotal": 583.32,
  "vatRate": 0.2000,
  "vatAmount": 116.66,
  "amountInclVat": 699.98,
  "discountRate": 0.0500,
  "discountAmount": 35.00,
  "deliveryFee": 0.00,
  "total": 664.98,
  "currencyCode": "KZT"
}
```

---

## TC-15. UZB — Product with Modifier and Quantity

**Test Scenario:**

Verify the calculation of multiple product units with an additional modifier price.

**Request:**
- Country: UZB
- Product Price: 100.00
- Modifier Price: +20.00
- Quantity: 2
- VAT Rate: 15%
- Delivery Fee: 0.00

**Calculation Steps:**

1. lineTotal = (100.00 + 20.00) × 2 = 240.00
2. subtotal = 240.00
3. vatAmount = 36.00
4. amountInclVat = 276.00
5. discountRate = 3%
6. discountAmount = 8.28
7. total = 267.72

**Expected Response:**

```json
{
  "subtotal": 240.00,
  "vatRate": 0.1500,
  "vatAmount": 36.00,
  "amountInclVat": 276.00,
  "discountRate": 0.0300,
  "discountAmount": 8.28,
  "deliveryFee": 0.00,
  "total": 267.72,
  "currencyCode": "UZS"
}
```

---

## TC-16. Product Quantity Is Zero or Negative

**Test Scenario:**

Verify quantity validation. The quantity must be an integer greater than or equal to 1.

**Request:**
- Country: UZB
- Product ID: Existing product
- Quantity: 0

**Additional Validation:**
- Quantity: -1

**Expected Response:**

- HTTP Status: `400 Bad Request`
- An `ErrorResponse` object is returned.
- The error message indicates that the quantity is invalid.
- Cart calculation is not performed.

---

## TC-17. Country Code Is Missing

**Test Scenario:**

Verify that the `region` parameter is required.

**Request:**

```json
{
  "items": [
    {
      "productId": "<EXISTING_PRODUCT_ID>",
      "quantity": 1,
      "modifierIds": []
    }
  ]
}
```

**Expected Response:**

- HTTP Status: `400 Bad Request`
- An `ErrorResponse` object is returned.
- Validation indicates that the required `region` parameter is missing.
- Cart calculation is not performed.

---

## TC-18. Unknown Country Code

**Test Scenario:**

Verify the handling of an unsupported country code.

**Request:**
- Region: XYZ
- Items: Existing product, quantity 1

**Expected Response:**

- HTTP Status: `404 Not Found`
- An `ErrorResponse` object is returned.
- The requested country is not found.
- VAT rate and currency cannot be determined.
- Cart calculation is not performed.

---

## TC-19. Product Is Out of Stock

**Test Scenario:**

Verify the handling of a product that is unavailable.

**Request:**
- Region: UZB
- Product ID: Existing product with `inStock = false`
- Quantity: 1

**Expected Response:**

- HTTP Status: `409 Conflict`
- An `ErrorResponse` object is returned.
- The response indicates that the product is unavailable.
- Cart calculation is not performed.

---

## TC-20. Empty Shopping Cart

**Test Scenario:**

Verify that an empty shopping cart is rejected.

**Request:**

```json
{
  "region": "UZB",
  "items": []
}
```

**Expected Response:**

- HTTP Status: `400 Bad Request`
- An `ErrorResponse` object is returned.
- The error message indicates that the cart is empty.
- Cart calculation is not performed.

---

## TC-21. Discount Threshold Boundary Tests for All Countries

**Test Scenario:**

Verify discount behavior below, exactly at, and above the 100 threshold for all five countries.

**Conditions:**
- Delivery Fee: 0.00
- All prices are specified in the respective country's currency.
- Each row represents a separate API request.

### UZB — VAT 15%, UZS

| Scenario | Subtotal | VAT | Amount Incl. VAT | Discount | Discount Amount | Total |
|---|---:|---:|---:|---:|---:|---:|
| Below | 86.95 | 13.04 | 99.99 | 0% | 0.00 | 99.99 |
| Exactly at threshold | 86.96 | 13.04 | 100.00 | 3% | 3.00 | 97.00 |
| Above | 86.97 | 13.05 | 100.02 | 3% | 3.00 | 97.02 |

### KAZ — VAT 20%, KZT

| Scenario | Subtotal | VAT | Amount Incl. VAT | Discount | Discount Amount | Total |
|---|---:|---:|---:|---:|---:|---:|
| Below | 83.32 | 16.66 | 99.98 | 0% | 0.00 | 99.98 |
| Exactly at threshold | 83.33 | 16.67 | 100.00 | 3% | 3.00 | 97.00 |
| Above | 83.34 | 16.67 | 100.01 | 3% | 3.00 | 97.01 |

### GEO — VAT 12%, GEL

| Scenario | Subtotal | VAT | Amount Incl. VAT | Discount | Discount Amount | Total |
|---|---:|---:|---:|---:|---:|---:|
| Below | 89.28 | 10.71 | 99.99 | 0% | 0.00 | 99.99 |
| Exactly at threshold | 89.29 | 10.71 | 100.00 | 3% | 3.00 | 97.00 |
| Above | 89.30 | 10.72 | 100.02 | 3% | 3.00 | 97.02 |

### UKR — VAT 8%, UAH

| Scenario | Subtotal | VAT | Amount Incl. VAT | Discount | Discount Amount | Total |
|---|---:|---:|---:|---:|---:|---:|
| Below | 92.58 | 7.41 | 99.99 | 0% | 0.00 | 99.99 |
| Exactly at threshold | 92.59 | 7.41 | 100.00 | 3% | 3.00 | 97.00 |
| Above | 92.60 | 7.41 | 100.01 | 3% | 3.00 | 97.01 |

### CHN — VAT 18%, CNY

| Scenario | Subtotal | VAT | Amount Incl. VAT | Discount | Discount Amount | Total |
|---|---:|---:|---:|---:|---:|---:|
| Below | 84.74 | 15.25 | 99.99 | 0% | 0.00 | 99.99 |
| Closest value above | 84.75 | 15.26 | 100.01 | 3% | 3.00 | 97.01 |

**Expected Results:**

- No discount is applied when `amountInclVat` is below 100.
- A 3% discount is applied when `amountInclVat` is equal to or greater than 100.
- Delivery fees are excluded from discount threshold calculations.
- VAT rates and currencies must match the selected country.

**Note:** With monetary values limited to two decimal places and VAT rounded using HALF_UP, an exact `amountInclVat` value of 100.00 is not achievable for CHN around this threshold. Therefore, the closest transition is tested: 99.99 → 100.01.

---

## TC-22. MULTI — Multiple Modifiers for One Product

**Test Scenario:**

Verify that multiple modifier prices are summed correctly and multiplied by the product quantity.

**Request:**
- Country: UZB
- Product Price: 100.00
- Modifier 1: +10.00
- Modifier 2: +20.00
- Quantity: 2
- VAT Rate: 15%
- Delivery Fee: 0.00

**Calculation Steps:**

1. modifiersPrice = 10.00 + 20.00 = 30.00
2. lineTotal = (100.00 + 30.00) × 2 = 260.00
3. subtotal = 260.00
4. vatAmount = 260.00 × 0.15 = 39.00
5. amountInclVat = 299.00
6. discountRate = 3%
7. discountAmount = 299.00 × 0.03 = 8.97
8. total = 290.03

**Expected Response:**

```json
{
  "subtotal": 260.00,
  "vatRate": 0.1500,
  "vatAmount": 39.00,
  "amountInclVat": 299.00,
  "discountRate": 0.0300,
  "discountAmount": 8.97,
  "deliveryFee": 0.00,
  "total": 290.03,
  "currencyCode": "UZS"
}
```

---

## TC-23. Change Country for the Same Shopping Cart

**Test Scenario:**

Verify that the same shopping cart is recalculated when the selected country changes. The product has different regional prices.

**Initial Data:**
- Same Product ID.
- Quantity: 1.
- Modifiers: None.
- Regional price UZB: 100.00 UZS.
- Regional price GEO: 90.00 GEL.

### First Request — UZB

**Calculation Steps:**

1. subtotal = 100.00
2. vatAmount = 15.00
3. amountInclVat = 115.00
4. discountRate = 3%
5. discountAmount = 3.45
6. total = 111.55

**Expected Response:**

```json
{
  "subtotal": 100.00,
  "vatRate": 0.1500,
  "vatAmount": 15.00,
  "amountInclVat": 115.00,
  "discountRate": 0.0300,
  "discountAmount": 3.45,
  "deliveryFee": 0.00,
  "total": 111.55,
  "currencyCode": "UZS"
}
```

### Second Request — GEO

**Calculation Steps:**

1. subtotal = 90.00
2. vatAmount = 10.80
3. amountInclVat = 100.80
4. discountRate = 3%
5. discountAmount = 3.02
6. total = 97.78

**Expected Response:**

```json
{
  "subtotal": 90.00,
  "vatRate": 0.1200,
  "vatAmount": 10.80,
  "amountInclVat": 100.80,
  "discountRate": 0.0300,
  "discountAmount": 3.02,
  "deliveryFee": 0.00,
  "total": 97.78,
  "currencyCode": "GEL"
}
```

**Expected Results:**

- VAT is recalculated according to the selected country.
- The regional product price is used.
- The discount is recalculated.
- The response currency changes.
- Previous calculation values are not reused.

---

## TC-24. Delivery Fee Combined with a Discount

**Test Scenario:**

Verify the correct calculation when both a discount and a delivery fee are applied.

**Request:**
- Country: KAZ
- Subtotal: 500.00
- VAT Rate: 20%
- Delivery Fee: 25.00

**Calculation Steps:**

1. subtotal = 500.00
2. vatAmount = 500.00 × 0.20 = 100.00
3. amountInclVat = 600.00
4. discountRate = 5%
5. discountAmount = 600.00 × 0.05 = 30.00
6. deliveryFee = 25.00
7. total = 600.00 − 30.00 + 25.00 = 595.00

**Expected Response:**

```json
{
  "subtotal": 500.00,
  "vatRate": 0.2000,
  "vatAmount": 100.00,
  "amountInclVat": 600.00,
  "discountRate": 0.0500,
  "discountAmount": 30.00,
  "deliveryFee": 25.00,
  "total": 595.00,
  "currencyCode": "KZT"
}
```

**Expected Results:**

- The discount is determined only by `amountInclVat`.
- `deliveryFee` does not affect discount selection.
- The delivery fee is added after the discount is subtracted.

---

## TC-25. HALF_UP Rounding Verification

**Test Scenario:**

Verify rounding behavior when the discount calculation produces a third decimal digit equal to 5.

**Request:**
- Country: UZB
- Subtotal: 87.39
- VAT Rate: 15%
- Delivery Fee: 0.00

**Calculation Steps:**

1. subtotal = 87.39
2. vatAmount = 87.39 × 0.15 = 13.1085 → 13.11
3. amountInclVat = 87.39 + 13.11 = 100.50
4. discountRate = 3%
5. discountAmount = 100.50 × 0.03 = 3.015 → 3.02 (HALF_UP)
6. total = 100.50 − 3.02 = 97.48

**Expected Response:**

```json
{
  "subtotal": 87.39,
  "vatRate": 0.1500,
  "vatAmount": 13.11,
  "amountInclVat": 100.50,
  "discountRate": 0.0300,
  "discountAmount": 3.02,
  "deliveryFee": 0.00,
  "total": 97.48,
  "currencyCode": "UZS"
}
```

**Expected Results:**

- VAT is rounded to two decimal places using HALF_UP.
- The amount including VAT is calculated using the rounded VAT amount.
- The discount amount 3.015 is rounded to 3.02.
- The final amount is 97.48.

---

## Final Test Execution Criteria

1. All 25 test cases have been executed.
2. VAT values match the selected country.
3. Discount thresholds are determined exclusively by `amountInclVat`.
4. The correct discount rate is applied at every threshold.
5. All monetary calculations use HALF_UP rounding to two decimal places.
6. Product modifiers are correctly included in product prices.
7. Changing the country triggers a complete cart recalculation.
8. Delivery fees do not affect discount threshold selection.
9. Invalid requests return the expected HTTP status codes.
10. The response currency matches the selected country.

### Test Execution Summary

**Test Result:** PASS / FAIL

**Passed Test Cases:** ___ / 25

**Failed Test Cases:** ___ / 25

**Bugs Found:** ___

**Bug Reports:** ___
