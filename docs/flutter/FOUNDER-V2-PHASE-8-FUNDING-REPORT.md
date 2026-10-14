# Founder Mobile V2 — Phase 8 Funding Declarations

## Delivered

- Preserved the external-funds meaning: money is transferred directly between
  the parties outside FOPX; the Founder app records a declaration, not a
  payment or escrow transaction.
- Funding declaration remains tied to the real opportunity and participation,
  uses accepted offer-leg allocations, and shows committed, pending,
  confirmed, disputed, and outstanding amounts from backend records.
- Added optional PDF/JPG/PNG proof selection to the declaration form and sends
  the file with the multipart request supported by the backend. Evidence can
  now be retrieved through the authorized proof endpoint and saved locally.
- Investor confirmation/dispute decisions remain backend-authoritative and are
  reflected in the Founder view; this Founder role does not gain investor-only
  controls.

## Validation

- Funding declaration tests: **5 passed**.
- Full Flutter suite: **107 tests passed**.
- `flutter analyze --no-pub`: **No issues found**.
- Android debug APK build for the Development emulator API URL: **passed**.
- Build emitted a forward-compatibility warning that the current `firebase_core`
  plugin applies the Kotlin Gradle Plugin; it did not prevent the build.

## Remaining work and UAT boundary

- Authenticated Development UAT for a genuine declaration, evidence upload and
  readback, and investor confirmation/dispute remains deferred in
  [FOUNDER-V2-PENDING-UAT.md](FOUNDER-V2-PENDING-UAT.md).
- No live funding declaration was submitted and no external funds were
  transferred during implementation validation.
