# Chat module — encryption & usage

Overview:
- Messages are encrypted at rest using per-conversation Data Encryption Keys (DEK).
- DEKs are wrapped (encrypted) using a Key-Encrypting Key (KEK). The wrapped bytes are stored on the Conversation record.
- The application supports a local KEK implementation for development (`LocalKeyManagementService`). In production you should swap to a KMS-backed implementation (Azure Key Vault / AWS KMS) by replacing `IKeyManagementService`.

Config (development): `Investa.API/appsettings.Development.json`
- `Chat:KekId` - identifier for the KEK (default `local-dev`)
- `Chat:KekBase64` - base64-encoded KEK bytes (32 bytes for AES-256). If omitted an ephemeral KEK will be generated at startup (development only).

Database schema highlights:
- `Conversations` table: stores `WrappedDek` (varbinary), `DekNonce`, `DekTag`, `DekKeyId`, `DekVersion`.
- `Messages` table: stores `CipherText`, `Nonce`, `Tag`, `KeyId`, `Algorithm`.

SignalR integration:
- WebSocket endpoint: `/hubs/chat`
- Clients should connect with a Bearer token in query string: `?access_token=...` (the server extracts it for SignalR websocket auth).
- Clients join conversation groups using `JoinConversation(conversationId)` and send messages using `SendMessage(conversationId, content)`.

Security notes:
- Use a KMS for production to manage KEKs and enable rotation/auditing.
- Rotate KEKs by re-wrapping DEKs. For full DEK rotation, re-encrypt conversation messages in a background job.
- Use AES-GCM for authenticated encryption (integrity+confidentiality).

Next steps:
- Add a KMS-backed `IKeyManagementService` (Azure Key Vault recommended).
- Add tests and end-to-end integration tests for the chat/hub flows.
- Harden access control: ensure only conversation participants can join and receive messages.

