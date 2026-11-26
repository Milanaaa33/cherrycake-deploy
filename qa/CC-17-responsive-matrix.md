# CC-17 — Responsive & Accessibility Matrix (`320 / 768 / 1200 px`)

**Legend:** `PASS (Auto + Code)` = verified by Vitest/build/CSS media-query inspection; `VERIFY ON STAGING` = manual browser DevTools / Lighthouse check target.

| Page / Screen | Route | `320px` (Mobile) | `768px` (Tablet) | `1200px` (Desktop) | Zoom `200%` | Keyboard | axe (0 critical) | Lighthouse (`>= 90`) |
|---|---|---|---|---|---|---|---|---|
| **Главная (Home)** | `/` | Stacking hero & cards; 0 horizontal scroll | 2-col layout & responsive grid | Full editorial hero + spotlight + 4-col footer | No overlap | Logical header-to-footer focus | Target `0` critical | Target `>= 90` |
| **Меню и карточки (Menu)** | `/menu` | Single-column product cards; wrapping tabs | 2-column grid | Multi-column grid | Scales cleanly | Tab between category tabs & cards | `img` alt + price labels | Target `>= 90` |
| **Окно товара с модификаторами (Product Modal)** | `/menu` (modal) | Full-width sheet / scrollable body | Centered modal dialog | Centered modal dialog | Modal scrollable | Focus trap + `Escape` close | `role="dialog"`, radio/checkbox labels | Target `>= 90` |
| **Корзина (Cart)** | `/cart` | Compact item cards + stacked totals | Side-by-side summary / responsive table | Full summary panel | Totals legible | `+`/`-`/Remove keyboard accessible | `aria-label` on quantity controls | Target `>= 90` |
| **Чекаут (Checkout)** | `/checkout` | Stacked stepper + 1-col form (`Checkout.css`) | Stacked / compact summary | 2-col form + sticky order summary | Error messages stay visible | Native inputs, `radiogroup`, `<select>` | `aria-invalid`, field `<label>`, `role="alert"` | Target `>= 90` |
| **Отчёты (Reports)** | `/reports` | Wrapped filters, scrollable table container | 2-col KPIs, side-by-side charts | Full KPI grid + Chart.js bar & line | Table & charts readable | Filter `<input>`/`<select>`/`<button>` accessible | Chart & table semantics, `Reports.test.tsx` | Target `>= 90` |
| **Бонус: получение, слоты и бронь (Fulfillment & Booking)** | `/checkout` + `/booking` | 1-col slot grid + native controls | 2-col slot grid | Centered booking form & checkout step 2 | Slot labels wrap safely | Disabled unavailable slots skipped or marked | `<Input>`/`<Select>` errors + `role="alert"` | Target `>= 90` |
| **UI Kit** | `/ui-kit` | Stacked preview cards | Grid preview | Grid preview | Clear spacing | All states tabbable (`UIKit.test.tsx`) | Labels & contrast verified | Target `>= 90` |

---

## Checkout Validation Gate (`QAF Section 5`)

Verified in `cherrycake-frontend/src/pages/Checkout.tsx` and `Checkout.test.tsx`:
- **Required fields:** `name`, `phone`, `email`, `orderDate` (+ `deliveryZoneId` / `pickupPointId`, `timeSlotId`). Empty submissions display inline error beneath the offending field and set `aria-invalid="true"`.
- **Format & past date validation:** Rejects `< 2`-char name, invalid phone outside `^\+?[1-9][0-9]{6,14}$`, malformed email, and `orderDate < today`.
- **API errors:** `400` and `409` responses render an explicit `<p role="alert">` error message instead of blank screens.
- **Total parity & button state:** Summary totals come directly from `POST /api/cart/calculate` (never calculated client-side); submit button is disabled until `calculation` resolves and while `submitting` is true.
- **Order confirmation:** Successful submission navigates to `/order-success` with `PlacedOrder` (`orderNumber` e.g. `CC-2026-000100`).
