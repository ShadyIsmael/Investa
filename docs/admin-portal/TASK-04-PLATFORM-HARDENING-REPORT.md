# CENTRAL ADMIN TASK 04 — PRODUCTION FOUNDATION HARDENING REPORT

Date: 2026-10-01
Scope: production-foundation hardening only. Opportunities and other business-module work were not added in this task.

## A. Before-state health contract

`/api/health` was a handcrafted process response that reported `Healthy` without dependency-aware status. `/health` was the only aggregate health path and treated the unavailable FileStore as a failing dependency, without an explicit liveness/readiness split.

## B. After-state health contract

The platform now exposes separate contracts:

- `/health/live`: process liveness only; no database or FileStore calls; returns HTTP 200 with `Healthy`.
- `/health/ready` and `/health`: dependency readiness; database and FileStore checks are included; `Healthy` returns 200 and `Degraded`/`Unhealthy` returns 503.
- `/health/dependencies`: dependency detail with the same readiness status behavior.
- `/api/health`: stable Central Admin monitor summary; it remains HTTP 200 when the API is reachable and reports component states and an overall `Healthy` or `Degraded` value.

Health responses contain status, duration, timestamp, and safe per-check descriptions. Exception bodies, stack traces, host details, and secrets are not returned.

## C. Liveness

Implemented with `/health/live`. It uses an empty health-check predicate so dependency outages do not make the process liveness endpoint fail.

## D. Readiness

Implemented with tagged `database` and `filestore` checks. Readiness is healthy only when all required checks are healthy. A degraded or unavailable optional dependency produces HTTP 503 for readiness, while `/health/live` remains HTTP 200.

## E. FileStore policy

`FileStore:Required` now controls severity. It is enabled in the base configuration and disabled in Development and Testing. An unavailable optional FileStore reports `Degraded`; an unavailable required FileStore reports `Unhealthy`. Startup validation continues to protect required environments while allowing Development to run with the optional dependency offline.

## F. Central Admin health presentation

`/api/health` is now consumed as a component-aware monitor. The frontend distinguishes reachable/healthy, reachable/degraded, and unavailable states. A dedicated degraded banner and translations were added so degraded dependencies are not presented as a total backend outage.

## G. Environment and API configuration

The frontend now normalizes and validates `VITE_API_BASE_URL`. UAT and Production require an explicit absolute HTTP(S) API base URL and reject localhost/127.0.0.1 values. Development may use the Vite proxy, which is authoritative for `/api/...` calls. Mock mode now defaults off and is enabled only by an explicit setting.

## H. CORS before-state risk

The previous policy permitted broad local-network origins and did not provide a precise 127.0.0.1 allowlist contract. That was unsuitable as a production baseline, especially with credentials enabled.

## I. CORS after-state

The broad local-network and allow-all policies were removed. The API now uses one exact-origin `ApiCors` policy:

- Development adds only the configured frontend port on `localhost` and `127.0.0.1`, plus an explicitly configured non-local development hostname.
- UAT and Production use only exact values from `Cors:AllowedOrigins`.
- Credentials remain supported without combining them with `AllowAnyOrigin`.
- No private-network wildcard is used.

## J. API client and logging hardening

The API client now uses the same-origin development proxy, parses only safe JSON error messages, and avoids returning raw response bodies. Request logging ignores request bodies and explicitly avoids passwords, tokens, and PII. The dynamic `groupService` import was replaced with a static import so module loading is deterministic.

## K. Support route/proxy conflict

The incorrect `/support` Vite proxy was removed. `/support` is now a frontend redirect to `/admin-support`; the actual API remains under `/api/support`.

## L. NuGet vulnerability remediation

The initial API dependency audit reported two High and two Moderate advisories across AutoMapper, Microsoft.OpenApi, MailKit, and transitive MimeKit. Safe fixed patch/minor versions were applied:

- AutoMapper `15.1.1`
- Microsoft.OpenApi `2.7.5`
- MailKit `4.16.0`, bringing the fixed MimeKit transitive dependency

The final `dotnet list ... package --vulnerable --include-transitive --no-restore` check reported no vulnerable packages for the API project.

## M. npm vulnerability audit

`npm audit --json` completed with 0 vulnerabilities across 520 dependencies.

## N. .NET build warnings

The final API build passed with 0 warnings and 0 errors. The integration-test project still emits existing test-code warnings, primarily obsolete `ISystemClock` usage and nullability diagnostics. They do not originate from the production runtime hardening changes.

## O. Frontend build warnings

The stale Browserslist warning and Rollup circular-chunk warning were removed. The remaining warning is the existing aggregate JavaScript size warning: the main index chunk is approximately 762 kB before gzip. This is a performance follow-up, not a security or correctness failure.

## P. `groupService` loading

`UserOnboarding` now statically imports `groupService`, removing the mixed static/dynamic import warning and preventing inconsistent chunk ownership.

## Q. Bundle chunk policy

The catch-all vendor chunk was removed. Manual chunks are limited to deliberate large dependency families: React, UI libraries, and integrations. Remaining modules follow Rollup's native graph. The circular chunk warning is gone.

## R. Browserslist data

The Browserslist database was refreshed in `package-lock.json`. The production build no longer reports stale browser-data warnings.

## S. Bundle-size result

The production build completed with Vite 6.4.3. Approximate emitted sizes were:

- main index: 762.26 kB, 154.93 kB gzip
- UI vendor: 391.82 kB, 114.91 kB gzip
- React vendor: 232.56 kB, 74.38 kB gzip
- integrations vendor: 126.90 kB, 29.03 kB gzip

The main bundle remains large because the current application eagerly imports many admin areas. Route-level code splitting is recommended for Task 05.

## T. Permission test personas

Test-only personas were added for Super Admin, global read-only administration, FOPX-scoped administration, and no-required-permission access. These fixtures are used by frontend route-policy tests only; they do not seed runtime users or bypass production authorization.

## U. Route and permission policy coverage

Automated frontend coverage now exercises required permissions, `anyOf`, `allOf`, global versus FOPX scope, denied/403 behavior, placeholder route availability, and legacy redirects. The route registry and navigation alignment are also tested.

## V. Security and disclosure review

Health responses no longer expose raw exception details or infrastructure addresses. Frontend request logs do not include request bodies, and client errors do not echo raw response payloads. No new business-module authorization or data behavior was introduced by this task.

The repository still contains legacy secret-shaped configuration values in existing appsettings files. Production deployment must override/remove those values through a managed secret provider before live release; their values are intentionally not reproduced in this report.

## W. Backend automated validation

Focused platform validation passed: 9 tests passed, 0 failed, covering health contracts, CORS origin policy, FileStore severity, and startup security configuration.

The complete integration suite ran with 138 tests: 126 passed and 12 failed. The failures are outside this hardening scope and are existing business/SQL-environment issues, including SQL Server SSPI context failures and pre-existing approved-investor, payment, and repeat-investment expectation mismatches. They were not changed or masked.

## X. Frontend automated validation

Deterministic single-worker Vitest validation passed: 9 test files and 25 tests passed.

## Y. TypeScript validation

`npx tsc --noEmit` passed with no diagnostics.

## Z. Backend build validation

`Investa.API.csproj` built successfully with `--no-restore`, one MSBuild node, 0 warnings, and 0 errors after the stale local API process was stopped.

## AA. Frontend production build validation

`npm run build` passed with Vite 6.4.3 and 2,501 modules transformed. No Browserslist or circular-chunk warning remains; only the documented large-chunk warning remains.

## AB. Remaining warnings and failures

Remaining non-blocking items are:

- integration-test source warnings for obsolete/nullability APIs;
- the large eager frontend main chunk;
- 12 unrelated full-suite business/SQL-environment test failures;
- legacy secret-shaped values that must be externalized for Production.

No known runtime package vulnerability remains in the audited API project, and no platform hardening test is failing.

## AC. Remaining platform gaps

The hardening implementation is ready for user-run UAT, with these bounded follow-ups:

1. externalize legacy appsettings secrets before live deployment;
2. resolve the unrelated full-suite business and SQL-environment failures;
3. introduce route-level frontend code splitting to reduce the main bundle;
4. confirm deployment-specific exact CORS origins and FileStore availability in UAT/Production.

Development readiness returning 503 while the optional FileStore is offline is intentional and covered by automated tests.

## AD. Manual UAT checklist for the user

Manual UAT was not performed by this task. The user should verify:

1. With FileStore offline in Development, `/api/health` returns HTTP 200 with degraded component status, `/health/live` returns HTTP 200, and `/health/ready` returns HTTP 503.
2. With FileStore available, readiness returns HTTP 200.
3. Central Admin visibly distinguishes Healthy, Degraded, and Unavailable states.
4. Development calls work through the proxy for both `localhost` and `127.0.0.1`.
5. `/support` redirects to `/admin-support`, while `/api/support` remains the API path.
6. UAT/Production allow only the configured exact origins and do not allow localhost.
7. Real UAT accounts confirm Super Admin, global read-only, FOPX-scoped, and denied route behavior.
8. Production configuration contains managed secret references rather than legacy inline secret values.

## AE. Task 05 recommendations

Keep Task 05 focused on route-level code splitting, cleanup of the existing full-suite business/SQL-environment failures, managed-secret deployment integration, and production observability. Do not add new business modules unless explicitly requested.

## Final classification

CENTRAL ADMIN TASK 04 — IMPLEMENTED WITH GAPS

The production-foundation hardening is implemented and ready for user UAT. The classification records the bounded non-platform integration failures, remaining bundle-size warning, and required production secret externalization rather than implying live verification.
