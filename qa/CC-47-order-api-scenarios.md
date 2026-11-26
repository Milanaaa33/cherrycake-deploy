# CC-47 — Order API Scenarios (`POST /api/orders`, `GET /api/orders/my`, `POST /api/orders/my/claim`)

**Controller:** `OrderController` (`/api/orders`)  
**Swagger Tag:** `Orders`  
**Requirement:** Mandatory (Week 3) — Guest checkout validation, server-side recalculation, and persistence.

---

## 1. Happy Path Scenarios

| ID | Scenario | Endpoint & Headers | Payload Highlights | Expected Status & Assertions |
|---|---|---|---|---|
| **ORD-01** | Create guest order in Georgia (with `SINGLE` + `MULTI` modifiers) | `POST /api/orders` (`X-Client-Id: <uuid>`) | `region: "GEO"`, `Cherry Cake x2` + `Medium, 10 slices` + `Fresh cherries`, future `orderDate` | `201 Created`; `orderNumber` matches `^CC-\d{4}-\d+$`; `subtotal: 234.00`, `vatAmount: 28.08`, `discountAmount: 7.86`, `deliveryFee: 0.00`, `total: 254.22`, `currencyCode: "GEL"` |
| **ORD-02** | Server recalculates price (never trusts client) | `POST /api/orders` | Valid order in `TUR` (`Cherry Cake x1` + `Medium, 10 slices`) | `201 Created`; totals match `POST /api/cart/calculate` (`subtotal: 1360.00`, `vatAmount: 244.80`, `total: 1556.66`, `TRY`) |
| **ORD-03** | Retrieve browser guest order history | `GET /api/orders/my` (`X-Client-Id: <uuid>`) | Same `X-Client-Id` used in `ORD-01` | `200 OK`; JSON array contains newly created order, newest first |
| **ORD-04** | Claim earlier guest orders into current browser history | `POST /api/orders/my/claim` (`X-Client-Id: <new-uuid>`) | `{ "email": "nino@example.com", "phone": "+995599112233" }` | `200 OK`; attaches unclaimed matching orders and returns updated list |
| **ORD-05** | Phone formatting normalization | `POST /api/orders` | `"phone": "+998 (90) 123-45-67"` | `201 Created`; spaces/hyphens/parentheses stripped before regex validation; persisted cleanly |

---

## 2. Negative & Validation Scenarios (`ErrorResponse` Contract)

Every error response must conform to `ErrorResponse`: `{ timestamp, status, error, message, errors[] }`.

| ID | Scenario | Request Mutation | Expected HTTP Status | Expected Validation / Message |
|---|---|---|---|---|
| **ORD-N01** | Blank customer name | `customer.name = ""` | `400 Bad Request` | `errors[].field` includes `customer.name` |
| **ORD-N02** | Invalid customer email | `customer.email = "not-an-email"` | `400 Bad Request` | `errors[].field` includes `customer.email` |
| **ORD-N03** | Invalid customer phone (too short / letters) | `customer.phone = "123abc"` | `400 Bad Request` | `errors[].field` includes `customer.phone` |
| **ORD-N04** | Past order date | `orderDate = "2020-01-01"` | `400 Bad Request` | `errors[].field` includes `orderDate` (`must not be in the past`) |
| **ORD-N05** | Empty items array | `items = []` | `400 Bad Request` | `errors[].field` includes `items` |
| **ORD-N06** | Missing `region` | Omit `region` | `400 Bad Request` | `errors[].field` includes `region` |
| **ORD-N07** | Unknown `region` | `region = "XYZ"` | `404 Not Found` | `message` mentions region `XYZ` not found |
| **ORD-N08** | Unknown `productId` | `items[0].productId = 999999` | `404 Not Found` | `message` mentions product not found |
| **ORD-N09** | Out-of-stock product (`Napoleon Cake` in `GEO`, `Macarons Box` in `CHN`) | `region = "GEO"`, `productId = <Napoleon>` | `409 Conflict` | `message` indicates product is out of stock |
| **ORD-N10** | Missing required `Size` modifier on cake | `Cherry Cake` with `modifierIds: []` | `400 Bad Request` | `message` indicates modifier group `Size` is required |
| **ORD-N11** | Order history without `X-Client-Id` or `Authorization` | `GET /api/orders/my` (no headers) | `400 Bad Request` | Explains missing `X-Client-Id` header |
| **ORD-N12** | Order history with invalid `Authorization` token | `GET /api/orders/my` (`Authorization: Bearer bad-token`) | `401 Unauthorized` | Invalid or expired session token |

---

## 3. Database Persistence Verification

After executing `ORD-01` locally:

```sql
SELECT o.order_number, o.order_date, r.code AS region,
       o.subtotal, o.vat_amount, o.discount_amount, o.delivery_fee, o.total, o.currency_code
FROM orders o
JOIN regions r ON r.id = o.region_id
ORDER BY o.id DESC
LIMIT 5;

SELECT oi.product_name, oi.quantity, oi.unit_price, oi.modifiers_price, oi.line_total
FROM order_items oi
WHERE oi.order_id = (SELECT MAX(id) FROM orders);
```

Automated coverage verified in `OrderControllerTests.java` and `OrderFlywayUpgradeTests.java`.
