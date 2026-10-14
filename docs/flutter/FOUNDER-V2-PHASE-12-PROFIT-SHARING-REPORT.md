# Founder Mobile V2 — Phase 12 Profit Sharing Report

## Implemented

- Added a Founder deal panel only for accepted participations containing a
  `ProfitSharing` offer leg. It reads the authenticated server summary and
  renders the contractual rate, reporting frequency, calculation basis,
  lifecycle status, investor entitlement, confirmed/pending/disputed and
  outstanding distributions, reporting periods, declarations, distribution
  history, investor decisions, evidence links, settlement date, and closure
  details.
- Added Founder period-result declarations and distribution declarations using
  the existing domain endpoints, server-owned amounts/entitlements, request
  idempotency keys, optional evidence in the same declaration request, and
  protected evidence download endpoints. A loss result remains representable;
  the client does not calculate entitlement or rewrite accepted terms.
- Extended the authenticated summary response with the persisted period
  declaration ID/metadata required to download result evidence, and ensured
  evidence metadata is loaded for result and distribution history.
- Added the missing governed `PROFIT_SHARING_EVIDENCE` category as a database
  migration: active, PDF/image MIME and extension allowlist, 25 MiB cap.
  Evidence upload previously could not succeed because this expected category
  was not seeded.
- Investor confirmation/dispute remains an investor-authorized operation;
  Founder sees those decisions and reasons in the history but receives no
  investor action. Lifecycle settlement stays backend-worker-owned, and
  closure remains restricted to Admin/Operations; the Founder UI shows the
  resulting state without impersonating those actors.

## Validation

- Flutter analyzer: no issues found.
- Flutter regression suite: 110 tests passed.
- Profit Sharing backend unit tests: 16 passed, including governed category
  constraints and readback of the nested period declaration.
- Android debug APK built successfully at
  `Flutter_Founder/build/app/outputs/flutter-apk/app-debug.apk`.
- Build emitted existing non-blocking Kotlin Gradle Plugin and Android SDK
  XML-version warnings. Backend test builds also report pre-existing dependency
  vulnerability and nullable-reference warnings.
- Authenticated Development UAT remains deferred by user instruction. No
  declaration, distribution, confirmation, dispute, or closure was written to
  a real account during validation.

## Scope note

This is the Founder mobile surface. Investor confirmation/dispute controls and
Admin/Operations closure controls belong to their respective authorized apps;
the Founder screen does not offer those actions.
