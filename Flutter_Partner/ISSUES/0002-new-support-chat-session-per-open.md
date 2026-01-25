Title: Start a new support conversation on every chat open

**Summary**
Implemented behavior so each time the user opens the support chat a new conversation document is created and used for messages. This ensures every chat session is fresh.

**What changed**
- `lib/screens/support_choice_screen.dart` now creates a new Firestore document under `chats/` and passes that document id to `ChatBoxScreen` as the `ChatUser.id`.
- The change makes the chat behavior start a new conversation on each open, avoiding reuse of a persistent `chats/support` document.

**How it works**
- Opening the chat calls `_openChat` which generates a new doc with `collection('chats').doc()` and sets `{ type: 'support', createdBy, createdAt }`.
- `ChatBoxScreen` reads and writes messages under `chats/{generatedId}/messages` so the session is isolated.

**Testing notes / Limitations**
- The analyzer shows unrelated warnings and an earlier issue about `flutter_facebook_auth` referencing `facebook_auth_desktop`. If you need me to continue and run a full `flutter run`, I can address the `google_fonts` build errors first (they block debug builds).

**Next steps**
- (Optional) Remove empty chat documents that have no messages after a timeout to avoid clutter.
- (Optional) Add a UI hint that this chat is a new session and provide a "Continue previous thread" option if desired.

---
If you'd like, I can commit the change and open a PR with a short description and tests (if we add Firestore emulator or mocks).