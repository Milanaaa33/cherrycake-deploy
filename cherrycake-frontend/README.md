# Cherry Cake frontend

React 19 + TypeScript + Vite. `npm install`, then `npm run dev` (proxies `/api` to `http://localhost:8080`),
`npm run build`, `npm test`, `npm run lint`.

## Features added on top of the base project

- **17 countries** in the country switcher (loaded from `GET /api/regions`; `src/constants/regions.ts` is the offline fallback).
- **16 interface languages** (`src/i18n/`): a flat dictionary per language in `src/i18n/locales/`, the `useTranslation()` hook
  (`t('menu.title', 'English fallback', { params })`), a language switcher in the header, the choice is kept in
  `localStorage` (`cc_language`); switching the country suggests its language until a language is picked explicitly.
  Missing keys fall back to English, then to the inline text, so nothing ever renders blank. To add a text: add the key to
  `locales/en.ts` first, then to the other languages.
- **About us** (`/about`): story, hours, team and an interactive three.js globe of the 17 countries
  (`src/components/about/Globe.tsx`, textures in `public/assets/`, borders in `src/data/countryBoundaries.json`).
  The page is code-split (`React.lazy`), so three.js is only downloaded when it is opened.
- **Admin panel** (`/admin`, `src/pages/Admin.tsx`): catalog, prices and availability per region, VAT / exchange rates,
  users and roles. The link shows up for signed-in users with the `VIEWER`, `STAFF` or `ADMIN` role (`GET /api/auth/me`);
  `RequireRole` guards the route and the backend checks the role again on every request.


This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend enabling type-aware lint rules by installing `oxlint-tsgolint` and editing `.oxlintrc.json`:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "options": {
    "typeAware": true
  },
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
```

See the [Oxlint rules documentation](https://oxc.rs/docs/guide/usage/linter/rules) for the full list of rules and categories.
