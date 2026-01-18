Title: Remove static URLs — resolve SignalR hub URL from config

Summary
- Replaced hard-coded SignalR hub URLs with a runtime-configured value read from environment variables (`SIGNALR_HUB_URL`) using `flutter_dotenv`.

Files changed
- `lib/services/signalr_service.dart`
  - Now resolves hub URL from `dotenv.env['SIGNALR_HUB_URL']` when no URL is passed to `connect()`.
  - Throws a clear error if the URL is not configured.
- `lib/screens/support_choice_screen.dart`
  - Calls `service.connect(null)` so the service resolves the URL from config rather than using a literal.
- `lib/screens/chat_box_screen.dart`
  - Uses `service.connect(null)` in init to avoid static URLs.
- `lib/widgets/signalr_demo.dart`
  - Passes `hubUrl` only if provided by the demo UI; otherwise allows service to resolve from env.

Why
- Avoids hard-coded endpoints in code and supports environment-specific endpoints (dev/staging/prod). `.env` is already loaded in `main.dart`.

How to configure
- Add `SIGNALR_HUB_URL` to your `.env` file, for example:
  ```env
  SIGNALR_HUB_URL=ws://your-server:5235/hubs/chat
  ```

Next steps
- Optionally add a runtime config page to the app to show or override the current hub URL in debug builds.
- Add tests to cover `SignalRService.connect` URL resolution logic (using `dotenv.test` or injecting a fake env map).