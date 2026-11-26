# CC-34 — Menu & Cart Responsive & Functional Report (`320 / 768 / 1200 px`)

**Task:** CC-34 (QAF — Mandatory, Week 2)  
**Routes Covered:** `/menu`, Product Modifiers Modal, `/cart`  
**Verification Basis:** `cherrycake-frontend` Vitest store tests (`store/index.test.ts` — 4/4 passing), `tsc -b && vite build`, `oxlint` (`0` errors), and CSS/component inspection against [`CC-17-responsive-matrix.md`](./CC-17-responsive-matrix.md).

---

## 1. Breakpoint Verification Checklist (`320px`, `768px`, `1200px`)

| Area | `320px` | `768px` | `1200px` | Observations |
|---|---|---|---|---|
| **Menu Category Tabs & Product Grid** | Wrapping tabs, single-col cards | 2-column grid | Multi-column grid | Uses design tokens (`tokens.css`); regional prices update dynamically when changing country |
| **Product Modifiers Modal** | Full-width scrollable dialog | Centered dialog | Centered dialog | `SINGLE` required groups (`Size`) & `MULTI` optional groups (`Extras`) selectable via keyboard; `Escape` closes modal (`Modal.test.tsx`) |
| **Cart Page (`/cart`)** | Stacked item cards + totals panel | Responsive item list | 2-column layout | Totals fetched from `POST /api/cart/calculate`; never calculated client-side |

## 2. Defect Status

- **Critical / High Bugs:** `0`
- **Status:** Ready for integration & Week 4 full UI regression (`CC-57`).
