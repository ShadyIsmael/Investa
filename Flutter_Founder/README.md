# FOPX Founder Mobile V2

Flutter app for Founder workflows: Home dashboard, Projects and Opportunities,
Deals, Chat, Notifications, and Profile. The app uses Riverpod for state and
dependency injection, Dio for API calls, `go_router` for navigation, and secure
storage for session tokens. The backend remains authoritative for business
data and permissions.

## Run against local Development

The current Founder V2 app is `C:\github\Investa\Flutter_Founder` (the older
`C:\github\Investa\Flutter\_Founder` path is not part of the current checkout).
Start the Development backend on port `5235`, then run from this directory:

```powershell
flutter pub get
.\tool\run_android_dev.ps1
```

The helper resolves its project root from its own location, validates that it
is running the current Flutter app, targets emulator `emulator-5554`, and pins
the Development API base. It serializes launches so a second Flutter run
cannot race the first one on Gradle caches. Gradle's daemon and file-system
incremental behavior remain enabled; parallel tasks are disabled, workers are
capped at four, and the project cache is isolated under the repository. This
limits contention without forcing every build to recompile from scratch.

Do not start another Android Studio/Flutter Gradle build for this same project
while the helper is running. Do not delete Gradle caches to recover from a lock
error while a build process is still active.

Build and installable Development APK:

```powershell
flutter build apk --debug --no-pub --dart-define=FOPX_API_BASE_URL=http://10.0.2.2:5235/api/v1
```

Android emulators reach the host machine through `10.0.2.2`; `localhost` inside
the emulator refers to Android itself. Always pass the Development API define
for local runtime/UAT. Omitting it uses the default production API URL from
`AppEnvironment` and can cause a Development session to receive 401 responses.

## Verify

```powershell
flutter test --no-pub
flutter analyze --no-pub
flutter build apk --debug --no-pub --dart-define=FOPX_API_BASE_URL=http://10.0.2.2:5235/api/v1
```

## Architecture and behavior

- `lib/app`: application shell, localization, and routing.
- `lib/features`: Founder screens and feature-owned data/controllers.
- `packages/fopx_core`: API client, auth/session, environment, localization, and
  shared phone/Firebase foundations.
- `packages/fopx_ui`: shared Founder design system.
- API responses own project, opportunity, funding, deal, chat, notification,
  and profile business state; Flutter does not create shadow business records.
- Failed 401 refresh clears the session and returns to Login. A 403 remains an
  authorization state and does not log the user out.

Phase closure reports and backend contract notes are in `../docs/flutter/`.
