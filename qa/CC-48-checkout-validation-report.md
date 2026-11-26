# CC-48 — Checkout Form Validation, Keyboard Navigation & Error Handling Report

**Task:** CC-48 (QAF — Mandatory, Week 3)  
**Route:** `/checkout` (`cherrycake-frontend/src/pages/Checkout.tsx`)  
**Automated Coverage:** `cherrycake-frontend/src/pages/Checkout.test.tsx` (`2 / 2` tests passing)

---

## 1. Verified Validation Rules (Matching QAF Section 5)

| Field / Flow | Validation Rule | UI Behavior | Status |
|---|---|---|---|
| **Full Name (`#checkout-full-name`)** | Required, `>= 2` chars | Inline error beneath field + `aria-invalid="true"` | PASS |
| **Phone (`#checkout-phone-number`)** | Required, `^\+?[1-9][0-9]{6,14}$` after stripping spaces/`()`/`-` | Inline error message + `aria-invalid="true"` | PASS |
| **Email (`#checkout-email-address`)** | Required, valid email pattern (auto-filled & `readOnly` when signed in) | Inline error message + `aria-invalid="true"` | PASS |
| **Order Date (`#checkout-order-date`)** | Required, `>= todayString()` (`min` attribute enforced) | Rejects past date with `"The order date must not be in the past."` | PASS |
| **Fulfillment & Time Slot** | Requires `deliveryZoneId` (Delivery) or `pickupPointId` (Pickup) + available `timeSlotId` | Unavailable slots are `disabled`; missing choices highlight inline errors | PASS |
| **API Error Handling (`400` / `409`)** | Slot exhaustion or stock conflict from `POST /api/orders` | Displays explicit `<p role="alert">` error message (e.g. `"Time slot is full"`); never crashes to blank screen | PASS |
| **Totals Parity & Submit Guard** | Summary rendered directly from `POST /api/cart/calculate` | **Place order** button disabled until calculation loads and while request is submitting | PASS |
| **Order Confirmation** | Successful `201 Created` response | Redirects to `/order-success` with `PlacedOrder` state (`orderNumber`) and dispatches `clearCart()` | PASS |
