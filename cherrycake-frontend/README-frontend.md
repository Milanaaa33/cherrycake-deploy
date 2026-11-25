# Cherry Cake — Frontend

Single-page web application of the Cherry Cake café (EPAM University course project, team *Cherry Cake*):
multi-country menu with modifiers, cart and checkout with pickup / delivery and time slots, table booking, email-code
sign-in with order history, admin panel with roles, sales reports with CSV / PDF export, 16 interface languages,
day / night theme and an interactive globe on the About page.

- **Backend API and Swagger:** https://cherrycake-deploy.onrender.com/swagger-ui/index.html
- **Backend source:** `../cherrycake-backend`

---

## 1. Stack

| Area | Technology |
|---|---|
| UI | React 19, TypeScript, Vite |
| Routing | React Router 7 |
| State | Redux Toolkit (`region`, `language`, `cart`, `ui` slices) |
| HTTP | Axios with request / response interceptors (`src/api/client.ts`) |
| Charts | Chart.js + react-chartjs-2 |
| 3D | three.js (About page globe) |
| Tests / lint | Vitest + Testing Library (jsdom), oxlint, `tsc` strict |
| CI | GitHub Actions: `npm ci`, `npm run build`, `npm test`, `npm run lint` |

---

## 2. Running locally

Requirements: Node 20+ (CI uses 24). All commands from `cherrycake-frontend/`.

```bash
cp .env.example .env      # VITE_API_BASE_URL, VITE_DEFAULT_REGION
npm install
npm run dev               # http://localhost:5173, /api is proxied to http://localhost:8080
```

| Command | Purpose |
|---|---|
| `npm run dev` | development server with hot reload |
| `npm run build` | type check (`tsc -b`) and production build into `dist/` |
| `npm run preview` | serve the production build locally |
| `npm test` | unit / component tests (Vitest, jsdom) |
| `npm run lint` | oxlint |

### Environment variables

| Name | Purpose |
|---|---|
| `VITE_API_BASE_URL` | Backend base URL including `/api`, e.g. `http://localhost:8080/api` or `https://cherrycake-deploy.onrender.com/api` |
| `VITE_DEFAULT_REGION` | Country for a first visit (ISO-3, default `UZB`) |

### Deployment

Vercel (`vercel.json` rewrites every route to `index.html` for client-side routing). Set `VITE_API_BASE_URL` in the
Vercel project settings and add the Vercel URL to the backend's `CORS_ALLOWED_ORIGINS`.

---

## 3. Project structure

```
src/
├── api/            client.ts (axios instance, auth header, error toast), reports.ts, admin.ts
├── components/
│   ├── ui/         design-system components: Button, Input, Select, Checkbox, Radio, Card, Badge,
│   │               Modal, Toast, Loader, EmptyState, ErrorState (all states: hover / focus / error / disabled / loading)
│   ├── layout/     Header (nav, country, language, theme, cart badge), Footer, CountrySwitcher, LanguageSwitcher, ThemeToggle
│   ├── auth/       RequireSignIn, RequireRole (route guards)
│   ├── about/      Globe.tsx (three.js)
│   └── common/     SakuraBackground.tsx (falling petals)
├── pages/          Home, Menu, Cart, Checkout, OrderSuccess, Booking, Account, Reports, Admin, About, UIKit
├── store/          Redux store and slices
├── i18n/           languages.ts, translations.ts, useTranslation.ts, locales/<lang>.ts (16 files)
├── hooks/          useAuthRole
├── utils/          auth.ts (session + role), clientId.ts (guest id)
├── constants/      regions.ts (offline fallback of the 17 countries), productImages.ts
├── data/           countryBoundaries.json (globe outlines)
└── styles/         tokens.css (design tokens, light + dark), dark.css, reset
```

---

## 4. How the main features work

### Country switcher and regional prices
The header `CountrySwitcher` loads `GET /api/regions` (17 countries; `constants/regions.ts` is the fallback while the API
is unreachable) and stores the choice in `localStorage` (`cc_region`). Changing the country updates the Redux `region`
slice; the menu re-requests `/api/products?region=…` and the cart re-runs `POST /api/cart/calculate`, so prices,
currency, VAT, discount and total change at once. The current currency code is always visible in the header.

### Cart, pricing and validation
Line items (product, quantity, modifiers) live in the `cart` slice and `localStorage` (`cc_cart`). Totals are never
computed on the client: every change calls the backend calculator and the summary shows `subtotal → VAT → amount incl.
VAT → discount → delivery fee → total`, rounded to two decimals exactly like the API. Quantity accepts only integers ≥ 1;
checkout validates name, phone, email, order date (today or later), pickup point / delivery zone and time slot, shows the
message next to the field and blocks submission while the form is invalid. Backend validation errors (`ErrorResponse.errors`)
are mapped to the same fields.

### Checkout, pickup / delivery and time slots
Three steps: contact → fulfillment (pickup point or delivery zone, the fee appears in the summary after the discount)
→ date and time slot (full slots are disabled) → confirmation with the order number. A 409 from a slot that filled up in the
meantime returns the customer to the slot step.

### Sign-in, order history and roles
Passwordless: the Account page requests a 6-digit code by email and exchanges it for a session token
(`utils/auth.ts`, `localStorage`: `cc_auth_token`, `cc_auth_email`, `cc_auth_role`). The token is attached to
`/orders`, `/auth/me`, `/admin` and `/reports` requests. `useAuthRole()` re-reads the role from `GET /api/auth/me` once
per page load. Guests keep their orders by browser (`X-Client-Id`), signed-in customers see the orders of their email.

| Role | What the UI shows |
|---|---|
| `CUSTOMER` | menu, cart, checkout, booking, account |
| `VIEWER` | + **Admin** link, read-only panel |
| `STAFF` | + editing prices / availability, **Reports** link |
| `ADMIN` | + categories, products, regions, users & roles |

`RequireRole` guards `/admin` (VIEWER+) and `/reports` (STAFF+); the backend checks the role again on every request.

### Admin panel (`/admin`)
Four tabs: *Catalog* (categories and products), *Prices & availability* (price in conventional units, the resulting
customer price and an in-stock switch per region), *Regions & VAT* (VAT and exchange rate), *Users & roles*. Changes are
visible in the menu immediately.

### Reports (`/reports`)
Filters (period, country, group by month / region), KPI cards, orders histogram and revenue chart (Chart.js), a table of
the same rows, CSV export built from the loaded rows and the server PDF with the active filters. Loading, empty and error
states are explicit; exports are disabled until data is loaded.

### Languages
`useTranslation()` returns `t(key, englishFallback, params)`. Dictionaries are flat key → text maps in
`src/i18n/locales/<lang>.ts` (en, ru, uz, kk, ka, uk, zh, tr, hy, az, ro, et, lv, lt, fi, sv — the same 424 keys each).
Lookup order: current language → English → inline fallback, so a missing key never renders blank. The choice is saved as
`cc_language`; switching the country suggests its language until a language is picked explicitly. `<html lang>` follows
the language. To add a text: add the key to `locales/en.ts`, then to the other locales. Product and category names come
from the backend and are not translated.

### Theme and animation
The moon / sun button toggles `data-theme="dark"` on `<html>` (saved as `cc_theme`; a first visit follows the system
setting). Dark values of the design tokens are in `styles/tokens.css`, page-specific overrides in `styles/dark.css`.
`SakuraBackground` draws falling petals on a canvas, pauses in hidden tabs and is disabled for users with
"reduce motion".

### About page and globe
`/about` is lazy-loaded (`React.lazy`), so three.js (~600 KB) and the country outlines are downloaded only when the page
is opened. The globe highlights the 17 countries; clicking a hub switches the shop to that country.

---

## 5. Design system and accessibility

- Colors, typography, spacing and radii are CSS custom properties in `styles/tokens.css`; no page uses ad-hoc values.
- Every interactive component has hover, focus-visible, active, disabled and loading states; forms show error and help
  text with `aria-invalid` / `aria-describedby`; icons-only buttons carry `aria-label`; modals trap focus and close on Esc.
- Keyboard navigation works end to end (country and language switchers are native `<select>` elements).
- Text contrast meets WCAG AA in both themes; touch targets are at least 44 × 44 px.
- Breakpoints 320 / 768 / 1200: cards reflow, tables scroll inside their container, the header wraps on narrow screens.
- Long operations show loaders, results and errors show toasts.

---

## 6. Tests

`npm test` runs Vitest with jsdom: Redux slices (`store/index.test.ts`), UI components (Button, Modal), the sign-in guard
and the Reports page (filters, states, export buttons). `npm run build` also type-checks the whole project
(`tsc -b`, strict).
