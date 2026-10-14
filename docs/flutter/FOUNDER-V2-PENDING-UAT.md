# Founder Mobile V2 — Deferred UAT Ledger

Per the user's direction on 2026-09-26, defer authenticated write-UAT for the
completed implementation phases and return to it with the next phase. This is
deferred, not passed; do not report these phases as fully live-verified.

## Phase 2 — Project create/edit/governed actions

- Pending: authenticated Development write-and-readback for create, edit,
  server-supported status actions, archive reason, and governed logo upload.
- Reason deferred: the only visible Project contains placeholder-like content;
  no authoritative Project data has been designated for writes.

## Phase 3 — Opportunity management

- Pending: authenticated Development create/edit, review submission, reviewer
  approval/publication lifecycle, archive, and governed media workflow.
- Reason deferred: no authoritative test Opportunity and reviewer path have
  been designated. Never use production or fabricate business data for UAT.

## Phase 4 — Project Room

- Read-only UAT completed: Home, Projects, Project Overview, and Project Room
  loaded from the authenticated Development API; Room showed its available
  update and completed milestone.
- Pending: write/readback for update, milestone, and governed document upload,
  visibility, preview, and download.
- Reason deferred: no authoritative Project has been approved for mutations.

## Phase 5 — Investment conversations

- Pending: authenticated UAT of real request accept/reject/withdraw, message
  send/read receipts, conversation readiness/closure, unread counts, and
  authorized conversation detail access.
- Existing runtime finding: a conversation appeared in the account's list but
  its detail request reported that it was unavailable. No workaround or
  business mutation was used; verify the token's participant identity,
  conversation visibility, and exact API response during the deferred pass.
  Source audit found the client route matches the versioned Negotiations API
  and the list/detail visibility predicates agree. Detail loading previously
  reloaded and re-authorized the same conversation while fetching messages;
  it now reuses the already-authorized entity, with unit coverage. The live
  account-specific failure remains unresolved until the authorized request
  and response are captured.

## Phase 6 — Negotiation / structured offers

- Pending: authenticated UAT of mixed-leg offer creation, quote/charge
  confirmation, counter-version creation, accept/reject/withdraw, immutable
  accepted terms, and the founder's direct-offer accept/reject lifecycle.
- Direct offer submission is investor-only on the backend. The Founder app's
  owned-project opportunity view must not expose that action; the app has no
  separate public investor opportunity-browsing surface in this phase.
- No live offer was created, accepted, rejected, or charged during this phase.

## Phase 7 — Deals / participation / contracts

- Pending: authenticated readback of accepted participation, exact accepted
  terms, contract versions, official PDF download, and verified-email delivery.
- Implementation note: PDF readiness now follows the server's explicit PDF
  capability instead of HTML-preview availability. Version-specific official
  PDF retrieval and confirmed email requests are wired. The contract detail
  screen now renders the server-generated HTML preview in a restricted mobile
  WebView (scripts disabled, external navigation blocked). This implementation
  follow-up is complete, but it is not a live UAT pass.
- Pending: no live contract was downloaded or emailed and no Deal/participation
  business record was mutated during implementation validation.

## Phase 8 — Funding declarations

- Pending: authenticated Development declaration and readback tied to the
  approved participation, optional proof upload/download, and investor-side
  confirmation or dispute readback.
- No declaration was submitted and no external funds were transferred during
  implementation validation.

## Phase 9 — Loan lifecycle

- Pending: authenticated readback of partial/full repayment, proof upload and
  download, installment allocation, investor confirmation/dispute, and
  backend-owned default/closure transitions.
- No repayment declaration or external transfer was made during implementation
  validation.

## Phase 10 — Notifications and deep links

- Inbox, unread count, mark-read/delete, pagination, FCM foreground/background/
  cold-start listeners, and an app-owned route allowlist exist.
- Added persisted event metadata to the authenticated notifications API and
  `eventType` to FCM data messages. Founder routing now has explicit mappings
  for known chat/deal events; unknown or admin-only targets are not guessed.
- Pending: authenticated Development verification of foreground refresh,
  background/cold-start push taps, token registration/deactivation, unread
  receipt, and correct destinations. Conversation deep links still depend on
  the known Phase 5 conversation-detail authorization/runtime issue being
  resolved before they can be called fully live-verified.

## Phase 11 — Governed files

- Implemented a shared authenticated governed uploader and one shared Founder
  file picker for project logos, opportunity covers, Project Room documents,
  and funding/loan evidence selection. Feature-specific attach, visibility,
  preview, and download remain server-controlled.
- Pending: authenticated Development verification of category and entity
  linkage, visibility, project-room preview/download authorization, and
  funding/loan evidence readback.
- Funding/loan evidence deliberately remains multipart on its declaration
  APIs because the backend rejects standalone `FUNDING_PROOF` upload. No
  Founder Flutter FileStore API-key client was found. Legacy investment image
  and video endpoints are retained for compatibility with other clients; they
  use the governed backend storage service and are not used by the Founder app.
- See `FOUNDER-V2-PHASE-11-FILES-REPORT.md` for validation and scope notes.

## Phase 12 — Profit Sharing

- Founder UI now reads accepted Profit Sharing obligations, period/result
  history, entitlements, investor confirmation/dispute outcomes, evidence,
  settlement, and closure state. Founder result and distribution declarations
  use the authenticated API with optional evidence and idempotency keys.
- Pending: Development UAT for exact accepted OfferLeg linkage, real period
  declarations, evidence upload/download, distribution declaration,
  investor-side confirmation/dispute readback, settlement, and closure.
- No real result or distribution was declared; no investor decision or closure
  was triggered during implementation validation. Investor decisions and
  operational closure must be verified using their authorized actors.
- A migration is required to add `PROFIT_SHARING_EVIDENCE`; ensure it is
  applied to Development before testing evidence uploads.
- See `FOUNDER-V2-PHASE-12-PROFIT-SHARING-REPORT.md` for implementation and
  validation detail.

## Phase 13 — Equity

- Pending: authenticated Development readback of a participation with an
  accepted Equity OfferLeg, ownership and cap table, corporate-event request
  through Operations approval/application, dividend entitlements and
  Investor-side confirmation/dispute, transfer destination acknowledgment and
  Operations application, exit, and closure snapshot.
- No corporate event, dividend, transfer, exit, or closure was written during
  implementation validation. Founder actions remain limited to authorized
  corporate-event initiation; approval/application and Investor decisions must
  be verified with their proper roles.
- See `FOUNDER-V2-PHASE-13-EQUITY-REPORT.md` for implementation and validation
  detail.

## Phase 14 — Profile / Settings / Trust

- Pending: authenticated Development profile update and readback, actual trust
  requirements/verification history, language/theme persistence across app
  restart, sign-out/session-expiry cache cleanup, and current-device FCM token
  deactivation. Also verify the password-change journey end-to-end: SMS
  delivery, current-password rejection, OTP expiry/invalid-attempt behavior,
  password-policy errors, successful change, and subsequent login using the
  new password. Do not perform it on a production account.
- No profile data was changed and no real push token was revoked during
  implementation validation. Verification-document submission remains
  unavailable until there is a governed upload/attachment contract for the
  Founder client.
- See `FOUNDER-V2-PHASE-14-PROFILE-SETTINGS-TRUST-REPORT.md` for API scope and
  remaining gaps.

## Phase 15 — Full end-to-end hardening

- Development environment readiness rechecked: API starts on port 5235,
  `/api/health` returns HTTP 200, and startup reports no pending migrations.
  `FOPX_SKIP_STARTUP_DATA_MUTATIONS=true` and demo seeding disabled were used;
  no automatic backfill or demo-data mutation ran. The API is left running for
  the next explicitly scheduled UAT pass.
- Development read attempt: authenticated Home loaded server-owned dashboard
  data. Opening Projects reached `ProjectsController.GetMine`, but the SQL
  reads plus action took about 28 seconds and the client canceled at its
  30-second timeout (server recorded HTTP 499 after the controller response).
  This is a live Projects runtime failure, not evidence of fake/local data.
  The captured backend trace included SQL command durations of 11.774 seconds
  and 5.130 seconds; a currency metadata lookup was about 69 ms. The service
  path validates the Founder, loads owned Projects with their Opportunities
  and Category, then builds currency display totals. Available trace evidence
  does not attribute either slow command to a specific statement/plan, so the
  underlying database cause is not yet confirmed and no speculative query
  rewrite was made. Since then, the authenticated Founder gate, owned Project
  graph, and currency metadata reads were switched to EF no-tracking queries;
  five ProjectService unit tests passed. Re-measure the actual API/SQL latency
  after a stable Development runtime is available before calling the timeout
  issue resolved.
  The first retry environment also suffered Android system-process death and
  host/emulator memory pressure; a stable-emulator retry is pending. Deals and
  Chat were not reached in this run. Latest APK was rebuilt but not installed
  or runtime-tested after the Profile security update.
- Pending release-gate UAT: Loan, Profit Sharing, Equity, and mandatory Mixed
  Deal journeys on authenticated Development records, plus cross-cutting
  session restore/expiry, 403, logout, notification deep links, EN/AR/RTL,
  Light/Dark, compact/tall layouts, text scaling/accessibility, retry/empty/
  long-content states, amounts/dates/timezones, cache and tenant isolation, and
  secrets-in-logs review.
- Automated validation is recorded in
  `FOUNDER-V2-PHASE-15-END-TO-END-HARDENING-REPORT.md`; it is not a substitute
  for authenticated Android UAT.
- Do not use production data. Resume only with an approved Development account,
  suitable test actors, and explicit authorization for business writes.

## Resume criteria

At a later phase-level UAT pass, resume these items against the approved
Development environment and authoritative business records. Run the phase's
full validation again after fixing any UAT defects. Keep the already observed
Chat details access failure in the Phase 5 runtime findings.
