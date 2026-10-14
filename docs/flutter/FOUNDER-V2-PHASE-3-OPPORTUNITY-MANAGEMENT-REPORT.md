# FOPX Founder V2 — Phase 3 Opportunity Management

## Status

Implementation is complete. The targeted .NET and Flutter tests and Flutter analysis passed. Authenticated emulator UAT remains pending; Phase 3 is not yet live-verified.

## Scope addressed so far

- Founder mobile create and edit remain scoped to an existing founder-owned Project; the form does not ask for an investment model. The backend's legacy compatibility create path remains available to older clients.
- The API now exposes authoritative Founder action capabilities for editing, submitting for review, publishing, and archiving.
- The Founder client consumes those capability fields rather than inferring the lifecycle from status labels.
- `POST /api/v1/opportunities/{id}/submit-review` now validates the opportunity and parent Project, transitions Draft/Rejected to UnderReview, records the moderation submission, and emits a review event.
- The paid `POST /api/v1/opportunities/{id}/publish` action now requires prior reviewer approval. It no longer approves and publishes a Draft/Rejected opportunity directly.
- Founder funding-open/schedule transitions now require that the approved opportunity first passed through paid publication; the privileged admin path remains available.
- The backend-supported irreversible Archive transition now has an owner-authorized endpoint, a server-projected capability, and a Founder confirmation action.
- Editing is restricted in the application service to Draft and Rejected opportunities and mirrored by the server-provided edit capability in the app.
- Cover media continues to upload through the governed `/api/v1/files/upload` flow and is then attached through the Opportunity media endpoint.
- Create/update no longer accept raw `coverImageUrl` writes; cover URLs are assigned from governed uploaded-file metadata.
- English and Arabic labels and feedback have been added for review submission.
- Flutter contract tests cover the separate review and publish routes and server-owned lifecycle capability parsing; .NET unit tests cover review submission and prevention of direct Draft publication.

## Contract gap corrected

Previously the `submit-review` route was an alias for immediate paid publication, which marked an opportunity approved without using the existing reviewer approval workflow. The Founder app's only action also called that same path. The routes and application behavior have now been separated so that review submission, reviewer approval, and paid publication are distinct transitions.

## Existing non-cover media contracts

- The backend already provides owner-authorized `POST /{id}/documents`, `GET /{id}/documents`, `POST /{id}/events`, and `GET /{id}/events` actions.
- Document upload resolves file metadata, validates and scans the governed file, records upload/scan audit entries, enforces visibility-purpose rules, and publishes public document activity.
- Event creation is limited to supported milestone event types and records project timeline/realtime activity.
- No separate Founder mobile documents/events editor was added here; operational Project Room surfaces are in Phase 4 of the master prompt.

## Remaining before phase closure

- .NET validation passed: 4 lifecycle unit tests and 2 API integration tests (create-to-review and owner-authorized archive). Existing package/analyzer vulnerability and nullable warnings were emitted during build.
- Flutter validation passed: 22 opportunity/form widget and contract tests; targeted analyzer reported no issues.
- The Android emulator is connected and the local Development API health endpoint returns 200. A Debug-only network security policy now permits cleartext only to the emulator host bridge `10.0.2.2`; the base policy still denies cleartext, and this resource is not included in Release.
- Authenticated read-only Founder runtime access to Development now works, but its only visible Project/Opportunity contains placeholder-like prose and does not qualify as a legitimate test opportunity/reviewer path. No create, edit, review, publish, archive, or media write was sent. Do not exercise writes against production or create placeholder business data solely to simulate UAT.
- Do not call Phase 3 live-verified until those runtime checks complete.

## Revalidation — 2026-09-25

- The authenticated session was retained across an in-place Debug APK install.
  Live Home, Projects, Project Overview, Project Room, Deals, and Chat list
  requests rendered from Development.
- The Opportunity read path is available from the Project overview, but no
  lifecycle write was attempted because the only available Project data is
  placeholder-like. Phase 3 remains open pending a legitimate test record and
  reviewer path.
- Cross-phase note for the upcoming Chat phase: the authenticated Chat list
  displayed a conversation, but opening it rendered “This conversation is not
  available to this account.” Opening triggered only detail/message/offer
  reads; no message, ready-to-proceed, close, or offer action was sent.
  This is a confirmed Phase 5 runtime defect to diagnose after the preceding
  phase gates are resolved.

Authenticated write-UAT is deferred per the user's 2026-09-26 direction; see
[`FOUNDER-V2-PENDING-UAT.md`](FOUNDER-V2-PENDING-UAT.md). Phase 3 is not marked
live-verified.
