# CENTRAL ADMIN — TASK 03 STABILIZATION REPORT

## A — Root cause

Development startup owned the same port from both explicit Kestrel configuration and `launchSettings.json` (`applicationUrl`/`ASPNETCORE_URLS`), causing duplicate binding attempts.

## B — Binding fix

`Program.cs` is now the single development URL owner on port `5235`; duplicate profile URL settings were removed. A fresh runtime starts once on `http://127.0.0.1:5235` without address-in-use errors.

## C — Health

The portal health contract `/api/health` returned HTTP 200 and `Healthy` during UAT. The separate aggregate `/health` endpoint still reports 503 in this development setup because the existing FileStore health check cannot reach its configured storage target.

## D — Authentication and session

The local administrator successfully logged in, restored an authenticated session after reload, logged out to `/login`, and recovered after a backend restart. An invalidated JWT produced a backend 401 and returned the UI to login.

## E — TypeScript baseline

All seven baseline TypeScript errors were fixed, including role ID normalization, missing translation hooks, the reputation-rule patch payload, and the trust DTO field mismatch.

## F — TypeScript validation

`npx tsc --noEmit` passed with zero errors.

## G — Route policy

Added `src/core/routeRegistry.ts` as the central canonical route-policy registry. App guards and navigation metadata now consume the registry rather than duplicating route ownership and permission rules.

## H — Canonical route ownership

Global and FOPX canonical route metadata is registered and aligned with the live shell, permissions, component keys, and availability states.

## I — Legacy aliases

Authenticated checks passed for `/dashboard`, `/clients`, `/groups`, `/roles`, `/system-config`, operations, reference-data, `/admin-support`, and `/company-finance`. The `/support` alias remains defined in the route table, but direct navigation was blocked by the in-app browser client; the support surface was verified through `/admin-support`.

## J — Global navigation

`/admin`, `/admin/users`, `/admin/access`, and `/admin/system` rendered inside the authenticated central shell.

## K — FOPX navigation

`/admin/fopx`, `/admin/fopx/overview`, and `/admin/fopx/users` rendered with FOPX workspace context and navigation.

## L — 403 behavior

The seeded administrator is a super-admin, so the live account did not enter a denied branch. The browser-level DOM regression test verifies that a missing permission renders the accessible 403 state and does not render protected content.

## M — 404 behavior

`/admin/definitely-not-a-route` rendered a clear 404 page with “Page not found” and “Return to administration”; the raw translation-key defect was removed.

## N — Backend unavailable

With the API stopped, the authenticated shell displayed `Unavailable` and an accessible “Backend unavailable” alert/banner. After restart, the shell recovered to `Healthy`.

## O — Light theme

Light theme was verified visually in the global shell.

## P — Dark theme

Dark theme was verified visually in the global shell, then reverted to light for the final state.

## Q — English

English labels and navigation were verified.

## R — Arabic and RTL

Arabic labels and right-to-left layout were verified, including mirrored shell navigation; the UI was returned to English.

## S — Responsive behavior

Authenticated shell checks passed at 1440, 1280, 1024, and 800 pixel widths. Sidebar, main content, and skip-link structure remained available.

## T — Accessibility

Browser accessibility inspection confirmed named sidebar/navigation landmarks, banner and main regions, named controls, skip link, headings, and status/alert roles.

## U — Browser-level coverage

Added browser-level DOM regression coverage using the existing Vitest/jsdom stack for protected-route 403 behavior, 404 behavior, and backend-unavailable state semantics.

## V — Frontend tests

`npm test -- --run` passed: 7 test files and 16 tests.

## W — Backend build

`dotnet build Core-BackEnd/Investa.API/Investa.API.csproj --no-restore` succeeded with 0 errors and 10 existing package/dependency warnings.

## X — Frontend build

`npm run build` succeeded with Vite 6.4.3. Remaining output is warning-only: Browserslist age, circular chunking, and a dynamic/static `groupService` import.

## Y — Remaining defects and limitations

- The root `/health` aggregate remains 503 because of the existing FileStore health check; `/api/health` is the portal’s working health contract.
- Direct `/support` browser navigation was blocked by the in-app browser client, while the route remains defined and `/admin-support` passed live.
- The live seeded account does not exercise least-privilege 403 behavior; the automated DOM regression does.
- Existing dependency vulnerability/package-resolution warnings and chunking warnings remain.
- Direct-origin CORS logs reject `127.0.0.1` in some calls, while the Vite proxy path used by the portal succeeds.

## Z — Recommended Task 04 scope

Productionize the verified foundation: define deployment-safe URL and health/readiness configuration, make the FileStore health dependency explicit, add a least-privilege UAT account for live 403 testing, resolve dependency/security and chunking warnings, and complete direct support-alias browser smoke coverage. Opportunities, NEXUS, and unrelated business modules remain out of scope.

## Final classification

**CENTRAL ADMIN TASK 03 — IMPLEMENTED WITH GAPS**

The requested stabilization, authenticated shell, route coverage, visual states, accessibility checks, build validation, and live UAT are implemented. The remaining items are bounded environment/configuration and test-account gaps documented above.
