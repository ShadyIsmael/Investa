# Founder Mobile V2 — Phase 6 Negotiation & Structured Offers

## Delivered

- Audited the existing conversation offer builder against the backend DTO and
  confirmed separate Equity, Loan, and Profit Sharing legs can be combined in
  one offer without flattening their terms.
- Strengthened contract tests to parse mixed legs and ownership/repayment/
  payout terms together.
- Added the founder's direct-offer inbox to owned Opportunity details. It shows
  the proposer, offer version/status, each leg's terms, total amount, and note.
- Direct-offer accept/reject actions are displayed only from server-provided
  capabilities, require explicit confirmation, and refresh related deal,
  opportunity, and offer data after success.
- Direct-offer API calls use the existing authenticated negotiation endpoints;
  no backend contract or business rules were changed.

## Validation

- `flutter test --no-pub`: **108 tests passed**.
- `flutter analyze --no-pub`: **No issues found**.
- Android debug APK build for the Development emulator URL: **passed**.
- Opportunity widget coverage verifies mixed direct-offer display and that
  actions follow the server-provided capabilities.

## Boundary and deferred UAT

- Creating direct offers is investor-only on the backend. This Founder app
  exposes the founder's incoming offers on owned Opportunities; it does not add
  an investor-facing public opportunity browser or allow a founder to offer on
  their own opportunity.
- Per user direction, no live offer was submitted, accepted, rejected, or
  charged. Authenticated UAT remains pending in
  [FOUNDER-V2-PENDING-UAT.md](FOUNDER-V2-PENDING-UAT.md).
