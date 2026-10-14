# FOPX Founder V2 — Phase 1 Home Dashboard Report

Classification: `PHASE 1 — IMPLEMENTED WITH GAPS`

## A. Backend contract and data ownership

- The authenticated `GET /api/v1/founder/dashboard` endpoint is exposed by
  `FounderDashboardController` and delegates to `FounderDashboardService`.
- Project ownership, Opportunity association, approved Participation amounts,
  FundingDeclaration status, currency conversion/availability, and pending
  action counts are derived server-side. The Flutter screen consumes the
  returned dashboard DTO and does not recalculate funding/business states.
- The server currently marks realized Earnings unavailable because there is
  no implemented authoritative realized-earnings source. The Home UI displays
  unavailable instead of substituting a fabricated zero or local estimate.

## B. Implemented UX and routes

- Home is a Founder command overview with server-provided Projects and active
  Opportunities totals, pending-action count when greater than zero, capital
  position, and tappable Project links to `/projects/{id}`.
- Capital rows display Committed, Declared, Awaiting Confirmation, Disputed,
  Confirmed, and Outstanding values using the server's display currency,
  availability, and approximate-value flags.
- Loading, network failure/retry, controlled 403, and empty portfolio states
  are represented without creating local business records.
- Recent Activity is not shown: the current Founder dashboard contract does not
  return an authoritative activity feed. The service's time-series projection
  is not presented as an activity timeline.

## C. Validation evidence

- `home_dashboard_test.dart` covers authoritative DTO parsing, money
  availability/approximation, populated Home data, Project navigation, empty
  portfolio, backend-only pending actions, controlled 403, Arabic/RTL retry,
  and loading.
- The full Flutter suite passed **122 tests** on 2026-09-27; Flutter analyzer
  reported **No issues found**. These results are recorded in the Phase 15 and
  end-to-end reports.
- Read-only authenticated Development runtime evidence is recorded in
  `FOUNDER-V2-PENDING-UAT.md`: Home loaded dashboard data from the API. No
  dashboard or business record was written during that observation.

## D. Remaining gaps

- Realized Earnings cannot be displayed until the backend defines and exposes
  its authoritative source and semantics.
- A Recent Activity section requires a suitable authoritative activity/event
  contract; notifications are not silently repurposed as a project activity
  stream.
- Full release-gate cross-cutting Android verification remains deferred in
  the UAT ledger. Home read evidence does not close the separate Projects,
  Deals, Chat, mixed-deal, or cross-cutting runtime checks.

## E. Phase outcome

Dashboard implementation and automated coverage are present; known
backend-contract gaps and remaining release-gate UAT are explicit. No
unsupported data has been invented.
