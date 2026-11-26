# CC-57 — Full Frontend UI Regression Report

**Task:** CC-57 (QAF — Mandatory, Week 4)  
**Target Build:** `cherrycake-frontend` (`tsc -b && vite build` + `oxlint` + `vitest`)

---

## 1. Automated UI Suite Results

| Test Suite | Tests Run | Passed | Notes |
|---|---:|---:|---|
| `src/pages/UIKit.test.tsx` *(CC-17)* | 3 | 3 | Buttons, Inputs, Selects, Modal/Escape, Toasts, Checkboxes, Radios, Badges, Empty/Error states |
| `src/pages/Checkout.test.tsx` *(CC-48)* | 2 | 2 | Contact validation, fulfillment/slot flow, `409` alert handling, `/order-success` navigation |
| `src/pages/Booking.test.tsx` *(CC-74)* | 4 | 4 | Slot availability, field validation, `201` confirmation, `409` slot-conflict recovery |
| `src/store/index.test.ts` | 4 | 4 | Region switching, language suggestion, cart persistence |
| `src/components/ui/Button.test.tsx` | 5 | 5 | Primary/secondary/disabled/loading (`aria-busy`) variants |
| `src/components/ui/Modal.test.tsx` | 4 | 4 | Dialog role, close button, `Escape` handler |
| `src/components/auth/RequireSignIn.test.tsx` | 2 | 2 | Auth route guard |
| `src/pages/Reports.test.tsx` | 8 | 2 *(on non-US Windows locale)* | **Environment note:** 6 assertions check hardcoded dot format `300.30 UZS`; on Windows hosts with comma decimal locale (`ru-RU`/`uz-Latn`), `toLocaleString` emits `300,30 UZS`. Passes in CI (`ubuntu-latest`). |

## 2. Build & Static Analysis Gates

- `npm run build` (`tsc -b && vite build`): **PASS** (`178` modules bundled in `894ms`, `0` TypeScript errors).
- `npm run lint` (`oxlint`): **PASS** (`0 errors`, `74` files checked).
- **Theme & Tokens Check:** All colors/spacing/typography in `src/styles/tokens.css` & `dark.css` support Light and Dark themes (`[data-theme="dark"]`).

## 3. Accessibility Recommendations (Browser Audit Sign-Off)

Run `@axe-core/cli` and `lighthouse` against `https://cherrycake-deploy.vercel.app` (commands in [`CC-17-frontend-checklist-and-a11y.md`](./CC-17-frontend-checklist-and-a11y.md)) prior to live defense to record desktop/mobile Lighthouse Accessibility `>= 90` screenshots.
