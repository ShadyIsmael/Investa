# FOPX Founder V2 — Phase 15 End-to-End Hardening Report

## Automated validation completed

- Flutter: all 122 tests passed after completing the Profile password-change
  flow, including unverified-phone gating, OTP send, mismatch rejection, and
  successful confirmation in the Profile UI; the full suite covers
  authentication refresh/403 handling, mixed OfferLegs, Project and Room
  states, deals/funding/Loan/Profit Sharing/Equity, notification routes,
  profile changes and password-change API contracts, Arabic/RTL, and persisted
  appearance settings.
- Flutter analyzer: no issues found.
- Android Development debug APK: rebuilt successfully at
  `Flutter_Founder/build/app/outputs/flutter-apk/app-debug.apk`.
  This build includes the restricted contract-preview WebView and Profile
  password-change flow (Development API override `127.0.0.1:5235`).
- Backend unit suite: 330 passed, 1 failed of 331. The only failure is the
  Playwright PDF renderer test: sandbox execution returned `spawn EPERM`; a
  permitted retry launched Edge but the headless browser closed before the
  test could attach. This remains an environment/browser-runner gap.
- Project service regression filter: 5 passed, including the new authenticated
  Founder Project-list read-path ownership and no-tracking test. The list and
  currency-display queries now use read-only EF queries; live SQL latency has
  not yet been remeasured.
- Conversation detail now reuses its already-authorized conversation when
  loading messages instead of re-querying and re-authorizing the same entity.
  Message ordering and one-load behavior are covered in the unit suite; this
  does not resolve or replace authenticated UAT of the account's prior access
  failure.
- Focused backend Equity tests: 14 passed, including closure snapshot access
  control. Negotiation mixed-Offer and Project Room isolation tests: 22 passed.
- Full backend API integration suite: 119 passed, 12 failed of 131. SQL-backed
  tests encountered `Cannot generate SSPI context` before database operations.
  One legacy opportunity-payment test failed because a LoanInvestment seeded
  without an accepted Loan OfferLeg/contract schedule returns no FIFO payment
  allocations; the Founder mobile Loan lifecycle does not use that legacy
  payment route and instead uses the accepted-leg Loan obligation endpoints.
  The isolated payment test reproduced the same result. No fallback to legacy
  Investment semantics was introduced.

## E2E scenarios and release gate

- Loan, Profit Sharing, Equity, and mandatory Mixed Deal end-to-end journeys
  have API/UI implementation and automated component coverage, but were not
  executed against authenticated Development business records.
- Cross-cutting authenticated Android checks (session restore/expiry, live
  403, deep links, real-data isolation, live uploads, EN/AR/RTL, Light/Dark,
  device scaling/accessibility, and network retry) remain pending in the UAT
  ledger.
- This report does not claim live verification. No production account, Project,
  Opportunity, Deal, payment, declaration, transfer, or closure was mutated.

## Remaining risks carried forward

- Authenticated UAT remains an explicit release gate at the user's direction.
- The known Phase 5 conversation-detail authorization/runtime issue still
  needs an authenticated response capture.
- Existing backend package vulnerability, nullable-reference, and KGP
  warnings remain outside the tested feature changes.
- The legacy opportunity-level payment allocation failure needs an
  owner-approved decision before changing its old contract; it must not be
  addressed by fabricating a loan schedule or flattening mixed deals.

## Classification

`PHASE 15 — IMPLEMENTED WITH GAPS`
