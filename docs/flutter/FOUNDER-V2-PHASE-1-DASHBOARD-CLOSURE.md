# FOPX Founder V2 — Phase 1 Founder Home Dashboard Report

Classification: `Phase 1 — LIVE VERIFIED / CLOSED`

## A. Backend contracts audited

- Authenticated `GET /api/v1/founder/dashboard` returns the standard API envelope.
- The controller resolves the authenticated founder ID from claims and rejects
  non-Founder access with `403 FOUNDER_ACCESS_REQUIRED`.
- The read model is scoped to Projects owned by that Founder and includes
  portfolio counts, capital metrics, display currency, money availability and
  approximation flags, and project links.
- Pending actions are an aggregate count. The dashboard endpoint does not
  provide typed action items or action URLs.
- The dashboard endpoint does not provide Founder recent-activity events. The
  existing public project-activity endpoint is opportunity-scoped and is not a
  substitute for a Founder dashboard activity feed.

## B–C. Data ownership and APIs

All displayed business values are backend-owned and loaded from the Founder
dashboard read model. Flutter does not calculate business status, synthesize
attention items, or populate local business fixtures in production. The app
uses only `GET /api/v1/founder/dashboard` for Home data.

## D–G. Navigation, UX, rules, and errors

Home presents the portfolio counts, six capital-position values, and
Founder-owned project links in the Founder visual system. Refresh retries the
authoritative query. Unavailable and approximate money values respect their
backend flags. Empty, loading, network-error, and restricted-access states are
handled without logging the user out or fabricating portfolio entries.

## H–J. Localization, themes, and accessibility

Dashboard copy is localized through the shared EN/AR localization layer. Widget
coverage verifies Arabic RTL error rendering; live UAT below was performed in
English and Dark mode. Semantics labels cover portfolio counts, approximate
amounts, and project links.

## K–M. Verification

- Flutter suite: 90 tests passed after the current model correction.
- `flutter analyze --no-pub`: no issues found.
- `flutter build apk --debug --no-pub` with the Development emulator API base:
  succeeded.
- Authenticated Android UAT: dashboard loaded on the connected
  `sdk_gphone16k_x86_64` emulator; local Development `/api/health` returned
  `200`; the running Home showed the Founder portfolio and real project/capital
  values. No startup crash was present in the inspected Logcat window.
- Screenshot evidence: `outputs/phase1-live-current.png`.

## N–Q. Live result and remaining contract boundaries

The live screen showed one Founder-owned Project, one active Opportunity, and
the backend's EGP committed/declared/confirmed/outstanding values. No test
business record was created. The Home intentionally does not show a recent
activity feed because no Founder-scoped dashboard activity collection is
provided. Needs Attention shows only the backend-provided aggregate count; it
cannot deep-link to individual actions until the backend exposes typed items.

These boundaries are explicit backend projection gaps, not Flutter-derived
business logic. They do not block the defined Phase 1 dashboard read-model
scope.

## R–T. Files and risk

No source files were changed during this Phase 1 verification. Existing
dashboard code and tests were preserved. No legacy code was retired. Remaining
risks are the missing typed pending-action projection and Founder activity feed.
