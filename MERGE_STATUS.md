# Cherry Cake merged delivery — status and deployment notes

## Base
This delivery is based on `cherrycake-deploy-master (9).zip`. Existing catalog, region, cart,
checkout, order history, booking, OTP email-code authentication, PostgreSQL migrations V1-V8,
Docker, Vercel and GitHub Actions files are retained.

## Changes in this delivery
- `/cart` and `/checkout` routes are no longer wrapped in `RequireSignIn`, allowing guest navigation.
  Existing deploy cart and order/client-id API implementation is retained.
- Added Flyway migration V9 for ADMIN / STAFF / VIEWER roles.
- Added `/api/admin` backend endpoints for role identity, product listing, product metadata update,
  regional price/availability update, and role assignment.
- Added initial `/admin` frontend page for regional price and availability management.
- Admin API requests send the existing OTP session token.
- First ADMIN is provisioned by setting backend environment variable `ADMIN_EMAIL` to the
  exact verified email used to sign in through OTP. Do not put it in frontend variables or Git.

## Known limitations — read before production replacement
This is a best-effort integration delivery, not a fully certified production release.
The full set of first-project-only visual features (Custom Cake Studio, language switcher,
Sakura background, Freyja Easter Egg, About Hours modal, and interactive 3D map) has NOT been
fully ported into the deploy project's Redux and API architecture in this delivery.
The Admin page currently supports regional prices and availability; full create/delete catalog
UI and role-management UI are not yet implemented, although backend role assignment and product
metadata update endpoints exist.
Guest cart and checkout routes are public, but guest order persistence/claiming still depends on
the deploy project's existing API contract and must be tested end-to-end in staging.

## Required validation before production
- Run `mvn clean verify` in `cherrycake-backend`.
- Run `npm ci && npm run build` in `cherrycake-frontend`.
- Apply V9 to a staging copy of the PostgreSQL database first.
- Test OTP sign-in, guest checkout, order claim after sign-in, booking, admin role bootstrap,
  ADMIN/STAFF/VIEWER permissions and all existing production environment variables.
- Confirm Vercel and backend host build from the same repository/branch before replacing production.

## Admin bootstrap
Set `ADMIN_EMAIL=your-real-verified-email@example.com` in the backend host environment.
After deployment and Flyway V9, sign in via OTP with that email and open `/admin`.
The first `/api/admin/me` request provisions the ADMIN role.
