# Founder Mobile V2 — Phase 5 Chat & Conversation Requests

## Implemented

- Kept investment conversations on the negotiation API, separate from Support Chat.
- Added server-capability-driven visibility for incoming accept/reject and
  outgoing withdraw actions.
- Added an explicit confirmation and Arabic/English feedback for request
  withdrawal.
- Added the authenticated message-read receipt call after conversation details
  are successfully authorized; refreshes the list so the server's unread count
  is authoritative.
- Preserved server-provided participant, opportunity, status, readiness,
  visibility, offer history, and offer capabilities.
- Conversation detail now reuses the conversation already authorized and
  loaded for its response when fetching messages, avoiding a duplicate
  conversation/participant authorization query. Message ordering remains
  server-consistent and a regression test covers ordering plus a single detail
  load. The client route matches the versioned Negotiations API; the separate
  legacy Support Conversations controller is not used by Founder investment
  chat.

## Validation

- `flutter test --no-pub`: 106 tests passed.
- `flutter analyze --no-pub`: no issues found.
- Android debug APK built successfully for the Development emulator API URL.
- `git diff --check`: passed for Phase 5 changes.
- Backend `NegotiationJourneyTests` passed as part of the 330/331 backend unit
  run; one unrelated Playwright/Edge spawn failure remains documented in the
  Phase 15 report.

## Deferred authenticated UAT / known finding

Per user direction, authenticated UAT is deferred, not passed. In the prior
read-only runtime pass, a conversation appeared in the list but opening its
details reported that it was unavailable to the account. The API contract
filters both list and detail by participant identity and per-user visibility;
source review confirmed matching authorization predicates and no route
mismatch. The code-level duplicate detail query has been removed, but without
reproducing the exact authenticated request/response this report does not claim
that the account-specific access failure is resolved or bypass authorization.
The follow-up is recorded in [FOUNDER-V2-PENDING-UAT.md](FOUNDER-V2-PENDING-UAT.md).

No live request accept/reject/withdraw, message, offer, ready, or close action
was performed as part of this phase validation.
