# Founder App Architecture (Sprint 0 Foundation)

Scope: `Flutter_Founder` only. Backend contracts (`Core-BackEnd`) are
authoritative and are not modified by the client.

> All new Founder product features must use the approved foundation.
> Legacy services/screens may remain temporarily but must not be used as the basis for new product functionality.

## 1. Selected active architecture (incremental, no big-bang rewrite)

| Concern | Approved path | Location |
|---|---|---|
| Primary HTTP client | `ApiClient` (Dio) | `lib/services/api_client.dart` |
| Auth / session source | `SessionManager` (server-authoritative) + `AuthService` | `lib/services/session_manager.dart`, `lib/services/auth_service.dart` |
| Shared error model | `ApiError` / `ApiResult<T>` | `lib/core/api/api_error.dart` |
| Secure storage | `SecureStorage` (platform secure storage ONLY for secrets) | `lib/services/secure_storage.dart` |
| Session-scoped UI state | `AppState` singleton (in-memory only) + `Provider` (`ChatController`) | `lib/services/app_state.dart` |
| Base-URL policy | `EndpointResolver` | `lib/services/endpoint_resolver.dart` |
| Entry routing | `MyApp._resolveHome()` driven by `SessionManager.status` | `lib/main.dart` |
| Push foundation | `FCMService` (single active implementation) | `lib/core/services/fcm_service.dart` |

State-management rule: new business features use `Provider`/`ChangeNotifier`
(`SessionManager`, `AppState`, feature controllers). Ad-hoc `setState` stays
only inside leaf widgets. The `GetIt` clean-arch stack
(`lib/core/di/`, `lib/features/`) is legacy/deprecated: it is never
initialized from `main.dart` and must not back new features until an
explicit migration sprint adopts it.

Localization rule: `AppLocalizations.t(key)` with `assets/lang/*.json`
(`en`/`ar`); `t()` falls back to the key. No new string system.

Firebase role: Firebase is a phone-verification factor (`firebaseUid` claim
on register) and the push transport (FCM). Firebase identity is NEVER an
authentication authority: `FirebaseAuth.currentUser` alone cannot open the
Founder shell.

Backend-authoritative rule: the backend decides identity, roles, and
authorization. The client validates sessions via `GET api/Profile/me`,
surfaces backend codes/messages verbatim, and treats 403 as authorization
(not expiry). Client-side guards are navigation safety only.

## 2. Session / auth flow

```
startup -> SessionManager.bootstrap()
  1. removeInsecureTokenCopies()            # migrate pre-Sprint-0 devices
  2. read secure tokens (auth + refresh)
     none -> unauthenticated -> AuthScreen
  3. JWT exp already past? -> refresh ONCE (POST api/v1/Auth/refresh)
     fail -> clearSession() -> unauthenticated
  4. GET api/Profile/me (server-side validation)
     null -> refresh ONCE -> retry -> fail -> clearSession -> unauthenticated
  5. validated authenticated account -> Founder shell
     (ClientType never gates app entry; resource/action authorization stays backend-authoritative)
login  -> AuthService.login() -> SessionManager.adoptLoginSession()
         (same validation; no local logged_in flags)
401    -> ApiClient refreshes ONCE (single-flight lock), retries ONCE;
         still-401 -> SessionManager.handleUnauthorized() -> login
403    -> pass through; backend reason preserved; NO logout, NO refresh
logout -> SessionManager.logout(): secure tokens, identity, role context,
          session caches cleared; locale/theme preserved; FCM session
          cleared. No server revoke endpoint exists (backend has no
          logout/revoke route), so logout is local-only by design.
```

Backend contract used (read-only): `POST /api/v1/auth/login`,
`POST /api/v1/auth/refresh` (rotates BOTH tokens; old refresh revoked),
`POST /api/v1/auth/register` (`clientType: 1` = Founder),
`GET api/Profile/me` (`coreMetrics.clientType`: Investor/Founder/Both;
Founder/Investor are `ClientType`, not Identity roles).

## 3. Error model

`ApiError{statusCode, success, code, message, data, errors, fieldErrors,
isTransportError}` with `ApiError.fromResponse()` parsing `ApiResponse<T>`,
legacy `{success,message,code,errors}`, and RFC-7807 problem-details shapes,
including ASP.NET `errors: {field: [msgs]}` maps. `ApiResult<T>` wraps
success/failure. Backend business codes are never collapsed.

## 4. Secure storage

`SecureStorage.sensitiveKeys = {auth_token, refresh_token}`: written/read
via `FlutterSecureStorage` only. No SharedPreferences mirror, no fallback
read. `removeInsecureTokenCopies()` deletes legacy prefs copies (run at
bootstrap and on cleanup). `deleteAllSession()` wipes secrets without
touching preferences. Credentials/passwords are never stored.

## 5. Profile persistence

`AppState` is in-memory only. `profile_json` is never written to
SharedPreferences; legacy copies are deleted on load/set/clear.

## 6. Base URL / TLS policy (`EndpointResolver`)

- Release: approved HTTPS origin(s) from compiled `API_BASE_URL` only.
  Stored custom URLs are dropped at init; `setCustomApiUrl` throws;
  `selectedApiBaseUrl` falls back to a policy-allowed candidate;
  clear-text HTTP is rejected for authenticated traffic.
- Debug: approved HTTPS + explicit local-dev HTTP (`localhost`, `*.local`,
  `127/8`, `10/8`, `192.168/16`, `172.16-31/12`). Arbitrary remote hosts
  are rejected in every build. The login-screen server-override UI is
  debug-only (`EndpointResolver.customHostsAllowed`).
- Cert handling: the old debug `badCertificateCallback => true` for ANY
  host is replaced with a localhost/LAN-only predicate, compiled in under
  `kDebugMode` only. Release/profile builds perform full TLS validation.

## 7. FCM foundation

Single active implementation: `FCMService` (+ thin
`NotificationService` init in `main`). No token fragments in logs
(presence-only). Token sync (`POST api/users/fcm-token`) runs only when a
backend session token exists and is re-triggered after login via the
`SessionManager` listener. `FCMService.clearSession()` drops the local
token binding on logout (no server unregister endpoint exists).
`firebase_messaging_service.dart` is legacy/deprecated (DI-only, unused).

## 8. Legacy stack migration rule

Remain temporarily, do NOT use for new work: `NetworkClient` (+ its
`refresh-token` route fixed to `/refresh` for safety), `NetworkConfig`
(policy-validated, debug-only override), `injection_container.dart`
(`LogInterceptor` bodies/headers disabled), `auth_remote_datasource.dart`
(routes corrected to `/api/v1/Auth/*`), `FileStoreService` (decoupled from
`EndpointResolver`; explicit-baseUrl only; no callers),
`AnalyticsService` (import/token placeholder fixed),
`firebase_messaging_service.dart`, `signalr_config_screen.dart` (stub),
per-service legacy `*_service.dart` clients (to be migrated per-feature).
