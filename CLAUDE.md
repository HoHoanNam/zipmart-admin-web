# Zipmart Admin Web — Project Context & Coding Conventions

## Project Context

This repo is 1 of 5 sibling repos in the Zipmart system (`zipmart-frontend-web`,
`zipmart-admin-web`, `zipmart-mobile`, `zipmart-backend-nest`,
`zipmart-backend-spring`). This repo is the **admin dashboard** — a separate
Angular app from `zipmart-frontend-web`, deployed independently (e.g. on an
`admin.zipmart.com` subdomain), so admin code/bundle never ships to public
customers. It talks only to `zipmart-backend-nest`, never directly to
`zipmart-backend-spring`. Auth is Bearer JWT (no cookies), same login endpoint
as the customer apps — any account can authenticate, only accounts with
`role: admin` get past `RolesGuard` on the backend.

Ports (local dev): `frontend-web:4200`, **`admin-web:4300`**, `backend-nest:3000`,
`backend-spring:8080`.

## Angular Coding Conventions

Same stack/conventions as `zipmart-frontend-web` (Angular 21, standalone,
**no zone.js**, Signals not NgRx, Tailwind v4 CSS-first, "2025" file naming
style) — but this is an **independent codebase**. Do not import code from
`zipmart-frontend-web`; if logic is shared conceptually (e.g. `VndCurrencyPipe`,
the JWT-decode + silent-refresh interceptor pattern), it's reimplemented here
as its own copy, not a cross-repo dependency.

- `adminAuthGuard` (`core/auth/admin-auth.guard.ts`) checks
  `isAuthenticated() && isAdmin()` — this is a **UX-only** check. The real
  enforcement is `RolesGuard` on every admin endpoint in `zipmart-backend-nest`;
  never trust the client-side role check alone.
- `AdminAuthService.login()` does not reject non-admin accounts itself — the
  `Login` component checks `isAdmin()` after a successful login and logs back
  out with an error message if it's false, so a customer account gets a clear
  "no admin access" message instead of landing on a dashboard that 403s on
  every request.
- **Native `<select>` gotcha (hit and fixed during initial build)**: binding
  `[value]="row.someField"` on a `<select>` whose `<option>`s are rendered via
  `@for` does **not** reliably pre-select the right option — Angular sets the
  select's value before the option elements exist in the DOM, so it silently
  falls back to the first option. Always use `[selected]="option === row.field"`
  on each `<option>` instead (see `orders-admin.html`, `users-admin.html`).
- Currency: always through `VndCurrencyPipe` (`shared/pipes/vnd-currency.pipe.ts`)
  — same raw-numeric-string-from-Postgres issue as `zipmart-frontend-web`.

## Backend endpoints this app depends on

These 4 endpoints were **added to `zipmart-backend-nest` during this repo's
build** specifically to support admin-web — they didn't exist before and
aren't yet reflected in the root `IMPLEMENTATION_PLAN.md`:

- `GET /api/v1/orders/admin` — all orders with `userEmail` joined in (admin-only).
- `PATCH /api/v1/orders/:id/status` — update order status (admin-only).
- `GET /api/v1/users` — all users, `passwordHash` stripped (admin-only).
- `PATCH /api/v1/users/:id/role` — change a user's role (admin-only).
- `GET /api/v1/analytics/dashboard` — today's order count/revenue, total
  users/products, low-stock products (stock < 10).
- `GET /api/v1/analytics/engagement` — `behavior_events` counts by type +
  top-5 products by view count. This is **not** the recommendation CTR the
  original plan describes (§2.4) — that needs the `recommendations` table,
  which is owned by `zipmart-backend-spring` and doesn't exist yet. Once
  `backend-spring` exists, revisit this endpoint to compute real CTR
  (`click` events on products present in `recommendations`) instead of the
  current view-count proxy.

All 6 are guarded by `JwtAuthGuard` + `RolesGuard` + `@Roles(UserRole.ADMIN)`
in `zipmart-backend-nest`, same pattern as the existing Products admin routes.

## Current State

Full admin flow implemented and visually verified (Playwright screenshots)
against a locally running `zipmart-backend-nest`: login (rejects non-admin),
dashboard (live stats), products CRUD (create/edit/delete tested end-to-end,
edit confirmed to persist), orders list + status change, users list + role
change (select-binding bug found and fixed during this verification), and
engagement analytics. Orders-admin and the order-status flow show correctly
empty because no real checkout has been completed on this database yet — not
a bug.
