# Founder Mobile V2 — Phase 10 Notifications & Deep Links

## Delivered

- Kept the API-backed inbox, unread count/badge, paging, mark-read, deletion,
  and refresh behavior.
- Added persisted `eventType`, `opportunityId`, and `relatedEntityId` to each
  authenticated notification API item; those fields were already stored by
  the backend entity.
- Added `eventType` to event-driven FCM data. No message body, user identity,
  or additional business-record identifiers are added to the push data.
- Added a typed allowlist for known conversation, negotiation, participation,
  funding, contract, loan, equity, and profit-sharing events. It maps only to
  Founder-owned routes; unknown `/admin` actions are not followed or guessed.
- Conversation push taps use a validated conversation UUID from the existing
  internal target URL. Push opens mark the notification read when an
  authenticated notification ID is present; failure to sync that receipt does
  not block safe navigation.
- FCM foreground receipt refreshes the inbox and unread badge. Background and
  cold-start taps use the same route resolver. Existing logout token
  deactivation is retained.

## Validation

- Flutter tests: **108 passed**, including notification metadata parsing and
  typed route allowlist cases.
- `flutter analyze --no-pub`: **No issues found**.
- Backend `NotificationsApiTests`: **1 passed**, confirming the authenticated
  notifications endpoint returns the typed routing metadata.
- `git diff --check`: passed; only Windows newline-conversion notices were
  emitted.
- Android debug APK build for the Development emulator API URL: **passed**.

## Remaining runtime verification

- Per user direction, no formal UAT was run. Verify FCM permission, device-token
  registration/deactivation, foreground inbox refresh, background and
  cold-start taps, and read receipts against the approved Development account.
- Conversation deep links still rely on the known Phase 5 conversation-detail
  access issue being resolved; that issue remains separately recorded in the
  deferred UAT ledger.
