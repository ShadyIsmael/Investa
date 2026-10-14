# Founder V2 — Windows Gradle Lock Recovery

## Finding

The reported lock error referenced
`C:\github\Investa\Flutter\_Founder\android.gradle\buildOutputCleanup`.
That directory is not part of the current checkout. The active Founder V2 app
is `C:\github\Investa\Flutter_Founder`; using that older path can invoke a
different or stale Flutter project/cache.

The mapped-section error is consistent with competing Windows Gradle/cache
users. The repository already places this app's Gradle project cache at
`C:\github\Investa\.fopx-project-gradle-cache`, separate from the app's
`android/.gradle` folder. No cache was deleted and no unrelated Gradle/Java
process was terminated.

## Persistent guardrails

- `Flutter_Founder/tool/run_android_dev.ps1` resolves and validates the active
  Flutter root itself, serializes runs with a named Windows mutex, and rejects
  the obsolete project path.
- Gradle's heap is capped at 4 GB, parallel task execution is off, and the
  worker count is capped at four. Normal Gradle daemon and incremental
  file-system behavior remain enabled.
- The README instructs developers not to start a second Android Studio/Flutter
  build for the same project while the helper is active, and not to delete
  caches while build processes are running.

## Verification

- The PowerShell launcher parsed successfully.
- Two consecutive Development APK builds, both using
  `FOPX_API_BASE_URL=http://10.0.2.2:5235/api/v1`, succeeded with the final
  Gradle configuration: first build 86 seconds; incremental second build 15
  seconds. Neither produced a mapped-section/lock error.
- Gradle emitted existing Kotlin Gradle Plugin and Android SDK XML version
  warnings; these did not fail either build.
- The Development API health check returned HTTP 200 with startup migrations
  current and startup data mutations/demo seeding disabled.
- Authenticated emulator UAT was not performed. Repeated build success verifies
  the Gradle recovery path, not the Projects/Chat runtime findings or a clean
  Android UI launch.

## Usage

From `C:\github\Investa\Flutter_Founder`, start the backend on port 5235 and
run `.\tool\run_android_dev.ps1` from PowerShell. Use the README's APK build
command for a build-only verification.
