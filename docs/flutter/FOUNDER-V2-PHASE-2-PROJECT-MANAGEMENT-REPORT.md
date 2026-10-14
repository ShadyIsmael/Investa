# FOPX Founder V2 — Phase 2 Project Management Report

Classification: `Phase 2 — IMPLEMENTED WITH GAPS`

## A. Backend contract audit

- Authenticated Projects APIs provide list, detail, create, update, archive, and
  status-transition operations. Project ownership and Founder authorization
  are enforced by the backend.
- The create/update contract owns project identity, descriptions, category,
  industry, stage, geography, date-only FoundedOn, website/logo URLs, team and
  business model descriptions, risk/disclosure, and ISO currency.
- Re-audit confirmed `DefaultCurrency` is optional on create; the backend
  resolves it from the Founder's preferred currency and then the platform
  default. Flutter omits it for a new Project and preserves the loaded value
  during edit, matching the service contract; no client-side fallback or
  hardcoded currency is needed.
- Backend-provided `canEdit` and `availableStatusTransitions` govern editing
  and status actions. Lookups are obtained from the existing categories,
  project-stages, and risk-level APIs.
- Project images are accepted through the authenticated governed file upload
  API using the `PROJECTIMAGE` category, then the returned URL is saved through
  the existing project update contract. Upload limits and project ownership
  remain backend-enforced.
- Source-level route audit confirmed `POST /api/v1/files/upload` binds
  `file`, `categoryCode`, `projectId`, `entityType`, and `entityId` from
  multipart form data, matching the Flutter repository. Status changes use
  `POST /api/v1/projects/{id}/status`; archiving through this contract requires
  a reason, which the Founder confirmation flow collects.

## B. Data ownership and implementation

The existing Flutter Project list, overview, create/edit form, archive
confirmation, status actions, server validation display, and lookup handling
continue to use the real API contracts. The form now supports choosing a
project logo image and uploading it through governed storage. It associates
the upload with the saved Project and updates `LogoUrl` from the server-returned
URL. If upload or URL update fails after project creation, retry state avoids
creating a duplicate Project or uploading a second copy unnecessarily.
Auth recovery now notifies `SessionController` when a 401 cannot be refreshed,
clearing the persisted session and letting the router return to Login. A
malformed refresh response also clears tokens; 403 responses remain outside
the refresh/logout path.

No fake projects or local business fixtures were added. No live project was
created, edited, status-changed, or archived during this phase verification.

## C. Verification

- Flutter tests: **94 passed** (`flutter test --no-pub`) after the startup and
  auth-recovery changes. Coverage includes logo upload retry-without-duplicate,
  invalid form prevention, failed-refresh logout, and a 403 test proving the
  authenticated session remains intact.
- `flutter analyze --no-pub`: **No issues found**.
- The 2026-09-24 Android debug APK build succeeded with
  `FOPX_API_BASE_URL=http://10.0.2.2:5235/api/v1`. Gradle emitted non-blocking
  NDK/Kotlin compatibility warnings. An intermediate build without this
  define used the default production URL and received 401 on read-only requests;
  no production write was issued. The correct Development build was installed
  afterward and its authenticated Home/Projects reads succeeded.
- Projects list now uses no-tracking reads for the Founder authorization check,
  owned Project graph, and currency display metadata. All five `ProjectService`
  unit tests pass, including a new test that proves the list returns the
  persisted owned row and leaves the read-only entities untracked. This is a
  targeted data-access optimization; it does not yet prove an improvement in
  the previously observed live SQL latency.
- Startup hardening: `runApp` no longer waits for optional Firebase
  initialization. Firebase starts asynchronously in the app state, which
  re-attempts authenticated push setup after initialization; the app remains
  usable when local builds have no Google Services configuration. The
  post-change APK was built and installed on the emulator.
- Flutter's earlier apparent test hang was its Windows launcher repeatedly
  waiting on the SDK cache lock. The sandbox could not open
  `C:\flutter\bin\cache\lockfile`; running Flutter with approved SDK-cache
  access allowed the full test suite and analysis to complete. No source or
  Gradle workaround was needed for this launcher issue.
- Isolated backend `ProjectPhase2Tests`: **2 passed** from the existing
  prebuilt test artifact. These cover owner-scoped create/read/update with
  audit records, plus archive preserving the Project and disabling opportunity
  creation. The test factory uses a uniquely named EF InMemory database and
  test file storage, not the Development database.
- The broader prebuilt Project API integration filter had **14 passed / 1
  failed**. The sole failure was a Phase 3 Opportunity-publish test whose
  fixture left its parent Project unpublished; the API correctly rejected
  publishing the Opportunity. It is not a Phase 2 CRUD failure.
- Rebuilding the integration-test project did not complete: MSBuild spawned
  workers and could not replace the shared API output assemblies because a
  live `.NET Host` process (PID 58436) held
  `Investa.API/bin/Debug/net10.0/Investa.Application.dll` and
  `Investa.Infrastructure.dll`. That process was left untouched. The isolated
  tests above were therefore run from the prebuilt artifact; no rebuild result
  is claimed.
- Authenticated Android UAT on the connected `sdk_gphone16k_x86_64` emulator
  confirmed the authenticated Home dashboard, the real Projects list
  (Prosacco, Mohr and Fisher), and the Create Project form with live
  category/stage/risk lookups. The form was opened again after restarting only
  the app; the logo chooser and URL field were visible in the prior form
  capture.
- Live Android logo-picker smoke check: pressing “Choose a project logo image”
  opened the system Photos/Collections chooser through the native channel;
  pressing Back returned to the unchanged form. No image was selected and no
  upload or API write occurred.
- The live UAT was read-only: the form was opened but not submitted. Thus the
  create/update/archive/status/logo-save workflow has not yet been proven
  end-to-end against the authenticated Development backend.
- Post-reset runtime recheck on 2026-09-24: the existing emulator remained
  authenticated; `GET /api/health` on the local Development backend returned
  HTTP 200. With the explicit Development API define, the installed APK loaded
  the live Dashboard (1 Project, 1 active Opportunity and server-provided
  funding totals), Projects list, Project overview, published Opportunity, and
  prefilled Project edit form. The visible Project and Opportunity descriptions
  contain lorem-style placeholder prose, so this record was not treated as a
  genuine business Project for a write test. No create, update, status, archive,
  or upload request was sent. Screenshots are in `outputs/fopx-dev-runtime.png`,
  `outputs/fopx-projects-correct-dev.png`, `outputs/fopx-detail-correct-dev.png`,
  and `outputs/fopx-edit-prefill-correct-dev.png`.
- Final post-auth-fix emulator check: the Development build was reinstalled
  without clearing app data; Home and Projects loaded successfully using the
  retained authenticated session. The live Project still contains placeholder
  prose, and the Edit form was not submitted. Screenshot:
  `outputs/fopx-projects-auth-fixed-loaded.png`.
- Post-reset revalidation on 2026-09-24: the complete Flutter suite passed
  (**94 tests**), `flutter analyze --no-pub` reported no issues, and the Debug
  APK rebuilt successfully with the explicit Development API base and was
  installed on `emulator-5554`. The local Development `/api/health` returned
  `200`, and the Founder `MainActivity` process was running. A fresh visual
  capture could not be obtained in this pass (`uiautomator` returned a null
  root and `screencap` did not complete); this is not counted as a fresh visual
  UAT pass. No project write was sent.
- Fresh read-only emulator inspection on 2026-09-25: after force-stopping and
  relaunching the app, the authenticated Founder session recovered and Home
  and Projects loaded again. Projects again rendered one record named
  “Prosacco, Mohr and Fisher”; its visible description/industry include
  lorem-style placeholder prose, while Home displays non-zero funding totals.
  The record therefore is not merely an in-memory stale screen, and remains
  unsuitable as authoritative business data for a no-change write test.
  `/api/health` returned 200; a direct Projects request without a bearer token
  returned 401, as expected, and is not treated as an API or data failure. No
  business write or business-data reset was sent. Screenshot:
  `outputs/phase2-projects-after-relaunch-2026-09-25.png`.
- Reset-tool dry-run on 2026-09-25, using the Development configuration and
  `--dry-run`, failed while opening SQL Server with `Cannot generate SSPI
  context` before table counts could be read. Dry-run made no database changes.
  Both `appsettings.json` and `appsettings.Development.json` specify
  `localhost` / `InvestaDb` with Windows integrated authentication; no
  `ConnectionStrings:DefaultConnection` user-secret override is configured.
  The local default SQL Server service is running. A second read-only attempt
  targeting that same local default instance as `.` passed the original SSPI
  failure but stopped at TLS negotiation with `the instance of SQL Server you
  attempted to connect to requires encryption but this machine does not
  support it`. No encryption bypass was attempted.
  Therefore it is not possible from this workstation to prove whether the
  reported reset targeted the same database currently serving the app. Do not
  rerun the destructive reset until the correct database connection and target
  are confirmed.
- Follow-up coverage added after the prior 94-test run: widget cases now
  assert Arabic labels, RTL direction, Founder dark-theme brightness, and
  retry after temporary Project-form lookup failure, and reject unsupported
  Project website URL schemes before POST. Project Overview coverage now
  verifies archive requires and submits its reason. Project logo recovery now
  covers URL-save failure reusing the uploaded file without duplicate create
  or upload. A real Dio adapter
  contract test now checks lookup routes, create/update/status routes, DateOnly
  serialization, and governed `PROJECTIMAGE` multipart fields. A backend unit
  case asserts SMS fails closed without a configured provider. These additions
  have not been executed yet and must be included in the single full phase
  validation after implementation/UAT closes.
- Screenshots: `outputs/phase2-projects-live.png`,
  `outputs/phase2-create-form-live.png`,
  `outputs/phase2-create-logo-field.png`,
  `outputs/phase2-current-screen.png`,
  `outputs/phase2-current-projects.png`, and
  `outputs/phase2-current-create-form.png`,
  `outputs/phase2-logo-picker-open.png`,
  `outputs/phase2-logo-picker-dismissed.png`,
  `outputs/phase2-projects-after-relaunch-2026-09-25.png`.

## D. Remaining gap and next step

Phase 2 cannot be marked `LIVE VERIFIED / CLOSED` until a successful
authenticated live write-and-readback test is completed for the allowed
Project operations. No fake or disposable record was created because the
Development environment must contain real business data. The latest visual
inspection after the reported reset still shows placeholder-like content.
To close the phase, provide details for a genuine Project that should be
created, or identify a genuine existing Project and confirm its current values
are authoritative so a no-business-value-change save can be tested. Until
then, later phases remain gated by the master prompt's sequential closure
requirement.

## Revalidation — 2026-09-25

- The local Development API is reachable from the emulator using the explicit
  Debug-only network policy described in the Phase 4 report. The authenticated
  session survived an in-place APK install. Home, Projects, and Project
  Overview rendered from the Development API.
- The sole visible Project remains `Prosacco, Mohr and Fisher`; its description
  and industry contain placeholder-like text. No create, edit, status, archive,
  or media write was sent. Phase 2 therefore remains open for authoritative
  Project data and live write/readback validation.
- The previously pending Flutter coverage was included in the latest complete
  suite: **105 tests passed**; analyzer clean; debug APK build passed. These
  checks do not replace the missing live write/readback evidence.

Authenticated write-UAT is deferred per the user's 2026-09-26 direction; see
[`FOUNDER-V2-PENDING-UAT.md`](FOUNDER-V2-PENDING-UAT.md). Phase 2 is not marked
live-verified.
