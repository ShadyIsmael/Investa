# Firebase Backend Setup

## Required Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GOOGLE_APPLICATION_CREDENTIALS` | Path to the Firebase service account JSON file | Yes (when Firebase enabled) |

## Development Setup

### Service Account Location

For local development, set the environment variable:

```
GOOGLE_APPLICATION_CREDENTIALS=C:\Secrets\Firebase\fopx-3fb91-firebase-adminsdk-fbsvc-9f59adda1d.json
```

Or configure via `appsettings.Development.json` (which is gitignored):

```json
{
  "Firebase": {
    "Enabled": true,
    "ProjectId": "fopx-3fb91",
    "DatabaseUrl": "https://fopx-3fb91-default-rtdb.europe-west1.firebasedatabase.app",
    "CredentialsPath": "C:\\Secrets\\Firebase\\fopx-3fb91-firebase-adminsdk-fbsvc-9f59adda1d.json"
  }
}
```

### Project Details

- **Project ID:** `fopx-3fb91`
- **Realtime Database URL:** `https://fopx-3fb91-default-rtdb.europe-west1.firebasedatabase.app`
- **Public VAPID Key:** `BBE5wwOsme27eCvmED6eT6cY80uGkpntxAtVE2ujOj9aDFtowhuZsSum9rZUwZpg991gJnpl-Q1lDiilrpV-cm8`

## How to Disable Firebase

Set `Firebase:Enabled` to `false` in configuration (default is `false`).

When disabled, all Firebase-dependent services use no-op implementations:
- `IFirebaseCustomTokenService` → throws `InvalidOperationException`
- `IRealtimeEventPublisher` → silently no-ops
- `IFirebasePushSender` → returns success without sending

The application starts fully without Firebase.

## Database Rules

Apply the rules from `firebase/database.rules.json` manually via the Firebase Console:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project `fopx-3fb91`
3. Navigate to **Realtime Database** → **Rules**
4. Replace the rules with the contents of `firebase/database.rules.json`
5. Click **Publish**

## Security Warnings

- **Never commit service account JSON credentials** to source control.
- The `.gitignore` already excludes `**/Secrets/*.json` and `appsettings.Development.json`.
- No private keys or credentials are returned by any API endpoint.
- No credentials are logged.
- Custom tokens contain only the Firebase UID (the FOPX user ID as a string). No roles, claims, balances, or personal data.

## Production Configuration

In production, use environment variables or a secret store:

```json
{
  "Firebase": {
    "Enabled": true,
    "ProjectId": "fopx-3fb91",
    "DatabaseUrl": "https://fopx-3fb91-default-rtdb.europe-west1.firebasedatabase.app",
    "CredentialsPath": ""
  }
}
```

The `GOOGLE_APPLICATION_CREDENTIALS` environment variable should point to the service account file on the production server.

## Services Overview

| Service | Interface | Purpose |
|---------|-----------|---------|
| Custom Token | `IFirebaseCustomTokenService` | Create Firebase Auth custom tokens for frontend sign-in |
| Realtime Publisher | `IRealtimeEventPublisher` | Publish lightweight events to Realtime Database |
| Push Sender | `IFirebasePushSender` | Send FCM push notifications to device tokens |

## API Endpoints

### POST /api/v1/firebase/custom-token

Authenticated users only. Returns a Firebase custom token.

**Response:**
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "customToken": "...",
    "expiresInSeconds": 3600
  }
}
```