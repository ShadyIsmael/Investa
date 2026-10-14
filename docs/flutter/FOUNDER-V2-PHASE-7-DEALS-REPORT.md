# Founder Mobile V2 — Phase 7 Deals, Participation & Contracts

## Delivered

- Kept Deals and participation sourced from the existing authenticated API; no
  client-created Deal, participation, or legal terms were introduced.
- Corrected contract capability parsing so HTML-preview availability is not
  mistaken for PDF-download availability.
- Added version-specific official PDF retrieval and a save-file flow. The
  bytes, filename, and availability come from the server's contract-version
  endpoints and metadata.
- Added a confirmation step before asking the server to email the current
  contract version to the authenticated account's verified address. The
  request includes an idempotency key; backend authorization and delivery
  rules remain authoritative.
- Exposed available version metadata and document hash without regenerating or
  rewriting legal content on the client.
- Added a version-specific, authenticated HTML contract preview using the
  server-generated document. The mobile WebView disables JavaScript, blocks
  all navigation, and applies a restrictive Content Security Policy; preview
  markup with active or external-resource elements is rejected.

## Validation

- `flutter analyze --no-pub`: **No issues found**.
- `flutter test --no-pub`: **107 tests passed**.
- Follow-up validation after contract-preview implementation:
  **118 Flutter tests passed**, analyzer reported no issues, and the Android
  debug APK built successfully with the WebView plugin integrated.
- Android debug APK build with the Development emulator API URL: **passed**.
- `git diff --check`: passed; Git only reported existing/newline conversion
  notices for the Windows working copy.

## Remaining work and UAT boundary

- Authenticated readback of participation/contract versions, saving a real PDF,
  and verified-email delivery remain in
  [FOUNDER-V2-PENDING-UAT.md](FOUNDER-V2-PENDING-UAT.md).
- No contract was emailed/downloaded and no live business record was changed
  during this implementation pass.
