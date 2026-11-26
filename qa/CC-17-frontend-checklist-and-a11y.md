# CC-17 — QAF Frontend UI, Design Tokens & Accessibility Checklist

**Role:** QA Frontend (QAF)  
**Target App:** `cherrycake-frontend` (`https://cherrycake-deploy.vercel.app` / `http://localhost:5173`)  
**UI Showcase:** `/ui-kit`

---

## 1. Per-Page Verification Checklist

Apply these 8 mandatory gates to **every page** (Home, Menu & Product Modal, Cart, Checkout, Reports, Bonus Booking, UI Kit):

1. **Design Tokens Only:** Colors, typography, spacing, border radii, and shadows come exclusively from `src/styles/tokens.css` (and `dark.css` under `[data-theme="dark"]`). No un-tokenized arbitrary hex values breaking theme switching.
2. **Component States:** Interactive elements visually and semantically expose `hover`, `focus-visible`, `active`, `disabled`, and `loading` (`aria-busy="true"`). Inputs and selects show `aria-invalid="true"` and error text on validation failure.
3. **Keyboard Navigation:** All controls (Header links, Country/Language `<select>`, Theme toggle, Menu filters, Modifiers modal, Checkout steps, Booking form, Reports filters) are reachable via `Tab` / `Shift+Tab`, activatable via `Enter` / `Space`, and Modals trap focus + close on `Escape`.
4. **Contrast & Labels:** Text contrast meets WCAG AA (`>= 4.5:1`) in both Light and Dark themes. All inputs/selects have associated `<label>` elements; icon-only buttons define `aria-label`.
5. **Responsive & Zoom:** At widths `320px`, `768px`, and `1200px`, there is **no horizontal page overflow** (`document.documentElement.scrollWidth <= window.innerWidth`), cards reflow cleanly, and `200%` browser zoom keeps content legible without overlap.
6. **Touch Targets:** Interactive buttons, links, radio pills, and switches have a minimum touch target of `44 × 44 px` on mobile viewports.
7. **Automated Accessibility Audits:**
   - **Lighthouse Accessibility score:** `>= 90` on desktop and mobile.
   - **axe-core:** `0` critical or serious violations.
8. **Design Alignment:** Visual hierarchy, cherry-blossom palette (`#7b1e3c`), typography (`Plus Jakarta Sans` / `Parisienne`), and layout match approved AS design mockups.

---

## 2. `/ui-kit` Showcase Audit (`UIKit.tsx` & `UIKit.test.tsx`)

| Component | Verified States | Notes |
|---|---|---|
| `Button` | Primary, Secondary, Disabled, Loading (`aria-busy="true"`) | Click triggers toast; loading disables click |
| `Input` | Default with label, Error state, Disabled | Uses `aria-invalid` + error message rendering |
| `Select` | Region selector, Error state, Disabled | Native `<select>` for full keyboard & screen-reader support |
| `Modal` | Closed, Open (`role="dialog"`), Close button, `Escape` key | Verified in `Modal.test.tsx` and `UIKit.test.tsx` |
| `Toast` | `success`, `error`, `warning` + close | Accessible alert/status region |
| `Loader`, `Checkbox`, `Radio`, `Badge`, `EmptyState`, `ErrorState` | Checked, unchecked, disabled, semantic badges (`success`, `warning`, `error`, `neutral`), retry action | Verified via automated `UIKit.test.tsx` |

---

## 3. Running Axe & Lighthouse Locally / Against Staging

```bash
# 1. Start frontend or target staging URL
cd cherrycake-frontend
npm run build && npm run preview -- --port 4173

# 2. Run axe-core CLI accessibility scan (0 critical/serious violations expected)
npx @axe-core/cli https://cherrycake-deploy.vercel.app --tags wcag2a,wcag2aa

# 3. Run Lighthouse Accessibility audit (target score >= 90)
npx lighthouse https://cherrycake-deploy.vercel.app --only-categories=accessibility --view
```
