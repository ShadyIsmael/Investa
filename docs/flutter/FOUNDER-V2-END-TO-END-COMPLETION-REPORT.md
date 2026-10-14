# FOPX Founder Mobile V2 — End-to-End Completion Report

## Outcome

Functional implementation spans the Founder product from authentication and
Projects through post-acceptance lifecycle, profile/trust, and device settings.
Phases 13–15 and their verification summaries are recorded in the adjacent
phase reports. The implementation is not release-ready or live-verified:
authenticated Android UAT was explicitly deferred and remains the release gate.

## Architecture and navigation

- Flutter feature-first application using Riverpod, Dio, `go_router`, typed
  feature DTOs, shared `fopx_core`, and shared `fopx_ui`.
- Founder navigation surfaces: Home/Dashboard, Projects, Project Overview,
  Project Room, Chat, Deals, Notifications, and Profile.
- Product boundaries remain explicit: a Project owns its Opportunities;
  negotiation is conversation-scoped; accepted participation/contract records
  own post-acceptance Deal lifecycle; funding declarations state external
  party-reported events and do not imply FOPX payment or custody.

## Functional coverage

- Dashboard and Projects: server-owned summaries/listing and controlled
  loading, empty, error, and retry states.
- Opportunities and Project Room: project-scoped create/edit/lifecycle,
  server-authorized transitions, visible Room events, and governed documents.
- Chat and negotiation: authenticated conversations, server capabilities,
  Offer/OfferVersion/OfferLeg terms, mixed offers, and controlled response
  actions.
- Deals/contracts: accepted participation, immutable accepted terms,
  contract-version history, official PDF download and verified-email request.
- Funding and Loan: external funding declarations and evidence, server-owned
  Loan obligations/schedules, repayments, allocations, confirmations, disputes,
  and lifecycle readback.
- Profit Sharing: accepted-leg obligations, period/result history, declaration
  and distribution workflow, evidence, party confirmation/dispute, settlement,
  and closure readback.
- Equity: accepted-leg ownership, capitalization, corporate events, dilution,
  dividends, transfers, ownership history, and exit/closure record. Founder
  actions are limited to authorized requests; operator/Investor decisions stay
  with their proper roles.
- Notifications: authenticated inbox/unread state, FCM lifecycle, and
  whitelisted in-app deep links.
- Files: shared governed upload path and picker; entity attachment and
  visibility remain backend-owned.
- Profile/Trust: supported identity/contact update, trust/verification
  readback, a verified-phone-gated current-password + SMS OTP password-change
  flow, persisted EN/AR and system/light/dark settings, secure logout, and
  best-effort current-device FCM deactivation.

## Localization, accessibility, security, and performance

- English and Arabic/RTL are implemented across the audited surfaces; both
  light and dark themes are available, with the appearance preference persisted
  locally.
- Existing widget tests cover compact controls, reduced motion, semantics,
  Arabic/RTL, retry/empty/long content, controlled 403s, and session refresh.
- Access and refresh tokens remain in secure storage. No token or PII logging
  was added. Authenticated data uses the configured FOPX API origin and
  server authorization; unknown notification targets are not routed.
- Profile-mode jank diagnosis and authenticated Android runtime paths were not
  re-executed in this hardening phase. See earlier diagnosis/UAT records; do not
  interpret static/widget validation as runtime performance verification.

## Validation snapshot (2026-09-27)

- Flutter tests: 122 passed, including password-change screen interaction
  coverage after the Profile password-change completion.
- Flutter analyzer: no issues found.
- Backend unit tests: 330 passed; one headless Edge/Playwright test remains
  blocked by browser process termination (`spawn EPERM` in isolation).
- Follow-up hardening: Projects' read path and currency display now use
  no-tracking queries; conversation detail no longer repeats its authorized
  conversation query while fetching messages. Related service/journey tests
  pass, but live Projects latency and the account-specific Chat access finding
  still require authenticated Development re-verification.
- Backend integration tests: 119 passed, 12 failed; SQL-backed tests hit the
  existing `Cannot generate SSPI context` issue, and one isolated legacy
  opportunity-payment allocation test fails when no authoritative Loan
  OfferLeg/contract schedule is seeded. This route is not used by the Founder
  mobile Loan lifecycle and was not changed to reintroduce legacy semantics.
- Android Development debug APK rebuilt (API override `127.0.0.1:5235`):
  `Flutter_Founder/build/app/outputs/flutter-apk/app-debug.apk`.
- Windows Gradle recovery follow-up: the current `Flutter_Founder` launcher
  passes a smoke test, and two consecutive Development APK builds now succeed
  under the bounded/serialized Gradle setup. See
  `FOUNDER-V2-WINDOWS-GRADLE-RECOVERY.md`. This does not substitute for
  authenticated Android UAT.
- Build output still includes existing Flutter/Kotlin Gradle Plugin and
  dependency vulnerability/nullable-reference warnings.
- Authenticated Development UAT: deferred, not passed. Phase 2–15 UAT items
  and known runtime findings are listed in `FOUNDER-V2-PENDING-UAT.md`.
- Development API was restarted with demo seeding/startup mutations disabled;
  `/api/health` returned HTTP 200 and the database reported no pending
  migrations. This is environment readiness evidence only, not a Projects or
  Chat readback. The API remains available on the local Development port for
  the deferred UAT.
- Latest Development runtime evidence: Home returned authenticated dashboard
  data, while Projects exceeded the client's 30-second timeout under host and
  emulator memory pressure. The controller completed in about 28 seconds and
  the request was canceled by the client (HTTP 499 at the server boundary).
  Projects, Deals, and Chat therefore still need a stable-emulator retry; no
  emulator build with the latest password UI has been installed or exercised.

## Remaining gaps and release conditions

- Execute the Phase 15 Loan, Profit Sharing, Equity, and mandatory Mixed Deal
  journeys against explicitly approved Development actors and records, then
  repeat the cross-cutting Android checks.
- Resolve the known Phase 5 conversation detail access/runtime discrepancy
  with a captured authenticated response.
- Stabilize SQL Server SSPI for SQL-backed integration tests and the installed
  headless browser runner for Playwright PDF validation.
- Decide whether the legacy payment-allocation test/route is obsolete or needs
  a supported contract update. Do not synthesize allocations without accepted
  Loan OfferLeg and server-owned repayment terms.
- No backend-supported Founder notification-preference endpoint or governed
  profile-verification-document attachment flow is available to this mobile
  surface. Password-change SMS delivery and a full authenticated
  change-and-login readback remain UAT-only.
- Do not remove legacy API/storage code until every client has parity and
  usage is proven.

## Final classification

`FOPX FOUNDER MOBILE V2 — END-TO-END IMPLEMENTED WITH GAPS`
