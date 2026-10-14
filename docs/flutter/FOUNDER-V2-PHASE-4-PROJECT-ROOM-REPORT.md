# Founder Mobile V2 — Phase 4 Project Room Report

## Scope delivered

- Added the Project Room workspace with project activity, milestones, and governed project documents.
- Added authenticated document upload and registration, using server-provided document categories and the existing file-storage ledger.
- Enforced project ownership/access, approved-participant access, document-to-project association, and `FounderOnly` privacy on document retrieval.
- Added authenticated document preview/download endpoints. The mobile client previews supported images and text/CSV files and can download documents; PDF and other supported server-preview types remain available through the API preview endpoint, while the mobile UI downloads document types without an in-app renderer.
- Included investor-visible opportunity events in the project activity timeline; private/internal events are excluded.
- Added Arabic and English labels for Project Room, document categories, actions, visibility, and timeline events.

## Verification

- Flutter full test suite: **105 passed**.
- Backend Project Room security integration tests: **13 passed**.
- Flutter analyzer: **No issues found**.
- Android debug APK build: **passed**.
- `git diff --check`: **passed** (Git emitted only the repository's LF-to-CRLF line-ending notices).

## Runtime UAT status

- Android emulator `emulator-5554` is connected.
- Local backend health endpoint `http://localhost:5235/api/health` returned **HTTP 200**.
- Added a Debug-source-set-only Android Network Security Configuration. It denies cleartext by default and permits it only to `10.0.2.2` (the emulator-to-host bridge); it does not enable cleartext in Release. The APK was built with the explicit Development base URL, installed in place, and retained the existing authenticated session.
- Authenticated read-only emulator UAT passed for Home, Projects, Project Overview, and Project Room. Project Room loaded the available update and completed milestone. No HTTP cleartext, socket, or fatal app errors were observed in the inspected runtime log.
- Visual evidence: `outputs/phase4-dev-projects.png`, `outputs/phase4-dev-project-overview.png`, and `outputs/phase4-dev-project-room.png`. Account financial, counterparty, and conversation screenshots were not retained.
- The only available Project contains placeholder-like business text. As instructed by the product data rules, no update, milestone, document, Project, or Opportunity write was sent. The create/upload/download and readback workflows are therefore **not live-verified**; no fake business records were created.
- The default API URL remains production. This UAT build explicitly used Development and did not target production.

## Closure

Phase 4 implementation and automated verification are complete. Its authenticated read surfaces are now verified against Development, but the full operational write/readback workflow is **not closed** until an authoritative test Project and approval to exercise its permitted actions are available. APK build success and read-only UAT are not write acceptance.

The user directed that this write-UAT be deferred and revisited with a later
phase; see [`FOUNDER-V2-PENDING-UAT.md`](FOUNDER-V2-PENDING-UAT.md). Phase 4 is
not marked fully live-verified.
