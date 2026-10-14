# Founder Mobile V2 — Phase 14 Profile / Settings / Trust Report

## Implemented

- Profile reads the authenticated user profile and trust snapshot from the
  existing profile and trust APIs. It displays available identity/contact
  details, server-calculated completion/scores, phone/email verification,
  next-level requirements, and persisted verification history.
- Added profile editing for the backend-supported first name, last name, and
  mobile fields through the authenticated `/api/profile/me/basic` endpoint.
  Server validation remains authoritative; no email or company ownership is
  edited through unsupported fields.
- Added persisted local language (EN/AR) and appearance (system/light/dark)
  preferences. These are device settings, not backend account preferences.
- Added an Account Security password-change flow, enabled only when the server
  reports a verified phone. It verifies the current password, requests the
  backend's six-digit SMS challenge, confirms a matching new password, clears
  the current-password field after the challenge request, and surfaces
  server-side errors without logging credentials or OTPs.
- Explicit logout best-effort deactivates the current FCM device token while
  the authenticated session is available, invalidates the long-lived Projects
  list and profile/trust caches, and clears both tokens from secure storage.
  Session expiry uses the same cache invalidation through the app's session
  listener after the shared API client clears the failed session. Other
  feature data providers are auto-disposed when leaving the authenticated
  navigation stack.
- No token or PII logging was introduced. Access/refresh tokens remain in
  `flutter_secure_storage` only; language/theme preferences use ordinary local
  preferences and contain no sensitive data.
- Trust verification is read-only in the Founder app. The backend request
  accepts a document URL but provides no governed mobile upload/link contract
  suitable for attaching a verification document; no legacy/demo verifier or
  arbitrary file URL was reintroduced.

## Validation

- Flutter analyzer: no issues found after the password-change interaction
  tests were added.
- Flutter full regression suite: 122 tests passed, including the Profile UI
  gate for an unverified phone, OTP send, mismatch rejection without a confirm
  request, successful confirmation, profile parsing/update, both password-
  change API routes/payloads, trust history, Arabic/RTL, and persisted theme
  preference.
- Android Development debug APK rebuilt successfully at
  `Flutter_Founder/build/app/outputs/flutter-apk/app-debug.apk`.
- Live SMS delivery and password-change/readback were not attempted; they
  remain authenticated Development UAT items and no account password changed.
- Authenticated Android UAT, profile write/readback, and push-token revocation
  remain deferred per the user's instruction; no live account data was edited.

## Remaining product/API gaps

- No backend-backed notification-preference API is available to this Founder
  client; only local language/appearance controls are exposed.
- No governed profile-avatar/verification-document attachment workflow is
  available to this surface. Backend trust verification history remains
  visible but is not submitted from this app.
- Email/phone verification submission remains unavailable in this pass; the
  current surface reports server verification state and provides secure
  logout/session-expiry handling.

## Classification

`PHASE 14 — IMPLEMENTED WITH GAPS (LIVE UAT PENDING)`
