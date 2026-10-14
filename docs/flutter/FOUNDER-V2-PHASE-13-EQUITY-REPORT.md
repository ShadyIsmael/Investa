# Founder Mobile V2 — Phase 13 Equity Report

## Implemented

- Added an Equity panel to Founder Deal details only when the accepted
  participation contains an Equity OfferLeg. It reads position and ownership
  facts from the equity APIs; the Opportunity itself is not treated as an
  equity position.
- Added capitalization-table, corporate-event, dividend, transfer, and
  ownership-ledger history views. Ownership as-of-date reads use the
  authoritative backend calculation.
- Added a Founder-initiated share-based capitalization request for supported
  issuance/increase/split events. The request is submitted for approval; the
  Founder UI cannot approve/apply it or directly change ownership.
- Added read access to the persisted exit/closure snapshot for the associated
  Founder or Investor and authorized operators. The endpoint returns the
  backend snapshot or an empty result; unrelated actors are forbidden.
- Kept dividend declaration, distribution creation, Investor confirmation,
  share-transfer initiation/acknowledgment, and position closure behind their
  respective backend-authorized actors. Founder sees server state and history
  without impersonating those roles.
- Hardened backend transfer acknowledgment so only the destination Investor
  can acknowledge. Secured dividend reads to Founder/authorized operators or
  the Investor's own positions, and enabled Founder access to project
  capitalization and transfer history. Corporate-event reads include the
  Founder-visible draft/rejected history.

## Validation

- Flutter analyzer: no issues found.
- Flutter full regression suite: 114 tests passed.
- Focused Equity Flutter tests: 4 passed, covering server DTO parsing, API
  reads, approval-request submission, and exit/closure snapshot readback.
- Equity backend unit tests: 14 Phase 3 lifecycle tests passed; the Equity
  test group had previously passed 20 tests before the final closure read
  addition. The closure authorization/readback assertions are included in the
  latest 14-test run.
- Android debug APK built successfully at
  `Flutter_Founder/build/app/outputs/flutter-apk/app-debug.apk`.
- Builds continue to emit existing dependency-vulnerability, nullable
  reference, and Flutter/Kotlin Gradle plugin warnings; no build errors remain.
- Authenticated Development UAT remains deferred by user instruction. No real
  Equity position, event, dividend, transfer, exit, or closure was created or
  changed for implementation validation.

## Remaining notes

- The backend deliberately does not support shareholder register/custody
  semantics. FOPX records contractual Equity lifecycle facts; the Founder UI
  must not imply custody, official share registry, or payment execution.
- See `FOUNDER-V2-PENDING-UAT.md` for the deferred live validation checklist.

## Classification

`PHASE 13 — IMPLEMENTED WITH GAPS`
