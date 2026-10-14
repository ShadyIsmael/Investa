# CENTRAL ADMIN — TASK 05 CONTINUATION REPORT

Date: 2026-10-01
Scope: frontend scalability and readiness-semantics cleanup, continuing from the verified Task 04 working tree. No business modules were added.

## A. Files inspected

The delta audit inspected only the current route/component imports in `src/App.tsx`, the existing enterprise state components, route policy/registry tests, Vite chunk configuration, the FileStore and database health checks, health endpoint mapping, the existing health tests, and the two shell notification listeners that pulled heavy integrations into startup.

## B. Existing implementation reused

The existing Central Admin shell, `MainLayout`, `ProtectedRoute`, `RouteGuard`, `routeRegistry.ts`, route policies, `EnterpriseStates`, translations, workspace structure, and health-check registrations were preserved. No routing architecture, authentication, permission model, or workspace model was redesigned.

## C. Eager imports changed

`App.tsx` no longer eagerly imports business/admin screens. It keeps auth bootstrap, router foundation, shell, policy guards, shared state components, localization, and theme-related infrastructure eager. Route screen imports now come through `routeLoaders.ts` and grouped dynamic route modules.

## D. Lazy route boundaries added

Meaningful lazy groups were added for Global Admin, FOPX Workspace, Operations, Reference Data, Company Finance, and legacy support/tools. The route paths and route guards remain unchanged. Each group is loaded only when a route renders a component from that group.

## E. Global Admin chunk strategy

Global Overview, Users, Access/RBAC, approvals, notifications, System Configuration, and Platform Status are grouped in `GlobalAdminRoutes`. The resulting Global Admin chunk is approximately 121.37 kB before gzip and is not part of the initial modulepreload set.

## F. FOPX chunk strategy

Dashboard, Clients, Client Details, Support Administration, and Moderation Reports are grouped in `FopxWorkspaceRoutes`. The resulting FOPX chunk is approximately 424.06 kB before gzip, including the dashboard chart dependency, but it is route-owned and is not eagerly loaded by the Central shell.

## G. Heavy dependency changes

Recharts remains inside the FOPX route chunk rather than a globally preloaded vendor chunk. Firebase/FCM is dynamically imported by the shell notification listeners and now emits an optional FCM chunk. The dashboard’s GenAI integration remains behind the FOPX route boundary. No broad dependency upgrade or unrelated dependency refactor was performed.

## H. Loading boundary

`RouteLoadingBoundary` provides one shared, localized enterprise loading state using the existing state styling. It is placed inside `MainLayout`, so navigation, workspace context, and the Central shell remain visible while route content loads.

## I. Lazy module failure handling

`LazyRouteBoundary` catches dynamic import failures and renders the shared `LazyModuleError` state. The UI gives a concise localized explanation and a retry/reload action; raw import errors and stack traces are not rendered to users.

## J. Bundle before

The baseline production output from the current pre-Task-05 implementation was:

- main entry: 762.26 kB, 154.93 kB gzip;
- largest shared vendor: UI vendor at 391.82 kB, 114.91 kB gzip;
- React vendor: 232.56 kB, 74.38 kB gzip;
- integrations vendor: 126.90 kB, 29.03 kB gzip;
- business screens were included in the eager main graph rather than separated by Global/FOPX ownership.

## K. Bundle after

The final production output is:

- main entry: 254.24 kB, 66.01 kB gzip;
- largest shared vendor: React vendor at 232.56 kB, 74.38 kB gzip;
- shared UI vendor: 25.96 kB, 6.08 kB gzip;
- Global Admin: 121.37 kB, 24.58 kB gzip;
- FOPX Workspace: 424.06 kB, 121.16 kB gzip;
- Company Finance: 163.45 kB, 29.10 kB gzip;
- Reference Data: 71.01 kB, 8.52 kB gzip;
- Operations: 40.95 kB, 6.73 kB gzip;
- legacy support/tools: 56.50 kB, 12.79 kB gzip;
- integrations vendor: 126.90 kB, 29.23 kB gzip, route-owned rather than module-preloaded;
- FCM service: 2.06 kB, 0.95 kB gzip, loaded only by notification behavior.

The final `index.html` modulepreloads only the React vendor and the small shared UI vendor. Route groups, charts, integrations, and FCM are not initial modulepreloads.

## L. Initial payload reduction

The main entry fell from 762.26 kB to 254.24 kB: a reduction of approximately 508.02 kB, or 66.6% before gzip. The initial graph no longer contains every FOPX, Finance, Reference Data, Operations, support, chart, or Firebase/GenAI module.

## M. Readiness semantic change

Readiness status mapping is now configuration-aware. Optional FileStore degradation remains visible as `Degraded` in the JSON health body but maps to HTTP 200. Required dependency failures remain HTTP 503. Liveness remains independent and returns HTTP 200.

## N. Optional FileStore result

With `FileStore:Required=false` and FileStore unavailable:

- `/health/live`: HTTP 200;
- `/health/ready`: HTTP 200 with overall `Degraded` and FileStore `Degraded`;
- `/health`: same readiness semantics;
- `/api/health`: HTTP 200 with overall `Degraded` and `ready: true` because the core database remains healthy.

The optional behavior is covered by the integration health contract test.

## O. Required FileStore result

With `FileStore:Required=true` and FileStore unavailable, `FileStoreHealthCheck` returns `Unhealthy` and readiness maps the result to HTTP 503. The required severity and status-code mapping are covered by focused health tests.

## P. Required database behavior

Database readiness remains required and is not weakened. `DatabaseHealthCheck` still calls `CanConnectAsync`, is registered as an `Unhealthy` readiness dependency, and an unhealthy database result maps to HTTP 503. The Testing health contract continues to verify a healthy in-memory database result.

## Q. New automated tests

New or updated coverage includes:

- Global and FOPX components are React lazy boundaries;
- a lazy route resolves through the shared `Suspense` boundary;
- denied protected routes do not invoke their lazy module loader;
- failed dynamic imports render the enterprise error state without the raw error text;
- the shared loading state is non-blank and exposes `aria-busy`;
- optional FileStore readiness returns HTTP 200 with degraded semantics;
- required versus optional readiness status-code mappings;
- required FileStore severity remains unhealthy.

## R. Existing tests preserved

Existing route registry, route policy, navigation, system-health, environment, service, and enterprise-state tests were preserved. The unrelated full integration suite was not rerun, as directed by the Task 05 brief.

## S. TypeScript result

`npx tsc --noEmit` passed with no diagnostics after the final lazy-loading and deferred-integration changes.

## T. Frontend build

`npm run build` passed with Vite 6.4.3 and 2,511 modules transformed. No new circular-chunk or stale Browserslist warning was reported. The previous aggregate main-chunk warning is resolved because the largest route-owned FOPX chunk is below the 500 kB warning threshold.

## U. Backend health tests

Focused health validation passed: 7 tests passed, 0 failed, covering health contracts, optional/required readiness options, and FileStore severity. The existing startup-security test remains preserved and was not part of this Task 05 delta filter.

## V. Backend build

`Investa.API.csproj` built successfully with 0 errors. Six existing nullability warnings remain in unrelated controllers; no new Task 05 backend warning was introduced.

## W. Remaining technical gaps

The FOPX chunk is intentionally the largest route-owned chunk at approximately 424 kB because it contains the dashboard and chart dependency. It is not initial payload, but it can be split further in a future performance task if FOPX first-open latency becomes a measured concern. The API build retains six pre-existing controller nullability warnings. No unrelated full integration tests were rerun.

## X. USER UAT checklist

Manual UAT was not performed. The user should verify:

1. Opening `/admin` does not request FOPX, Finance, chart, Firebase, or GenAI route chunks before those features are opened.
2. Opening a Global Admin route preserves the shell while the Global chunk loads.
3. Opening an FOPX route preserves the shell while the FOPX chunk loads.
4. A blocked protected lazy route shows the existing 403 state without loading its module.
5. A simulated or unavailable route chunk shows the concise retry state rather than a blank page or raw stack trace.
6. Optional FileStore degradation keeps readiness HTTP 200 and displays degraded operational status.
7. Required FileStore or database failure returns readiness HTTP 503 while liveness remains HTTP 200.

## Y. Recommended next task

Measure real route-open performance in UAT and, if necessary, split the FOPX dashboard chart dependency into a second route-owned boundary. Continue production deployment work for managed secrets and observability separately; do not add business modules as part of the scalability follow-up.

## Final classification

CENTRAL ADMIN TASK 05 — IMPLEMENTED / READY FOR USER UAT
