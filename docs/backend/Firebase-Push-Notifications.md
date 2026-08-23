# Firebase Cloud Messaging (FCM) Integration

## Overview

This document describes the centralized Firebase Cloud Messaging (FCM) implementation that has replaced SignalR for push notifications in the Investa platform.

## Architecture

### Components

1. **UserToken Entity** (`Investa.Domain/Entities/UserToken.cs`)
   - Stores FCM device tokens per user
   - Tracks device type (Web/Android/iOS)
   - Includes timestamp for token management

2. **NotificationService** (`Investa.Infrastructure/Services/NotificationService.cs`)
   - Core service for sending notifications via Firebase
   - Handles token validation and cleanup
   - Manages multicast messaging to multiple devices

3. **NotificationsController** (`Investa.API/Controllers/NotificationsController.cs`)
   - REST API endpoints for token management
   - Admin endpoint for testing notifications

## Database Schema

```sql
CREATE TABLE UserTokens (
    UserId NVARCHAR(450) PRIMARY KEY,
    FcmToken NVARCHAR(MAX) NOT NULL,
    DeviceType NVARCHAR(50) NOT NULL,  -- 'Web', 'Android', or 'iOS'
    UpdatedAt DATETIME2 NOT NULL
);
```

## API Endpoints

### POST /api/v1/Notifications/register-token
Register or update a user's FCM device token.

**Request Body:**
```json
{
  "fcmToken": "device-fcm-token-string",
  "deviceType": "Web"  // or "Android" or "iOS"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Token registered successfully"
}
```

### POST /api/v1/Notifications/send-test
**Admin Only** - Send a test notification to a specific user.

**Request Body:**
```json
{
  "userId": "user-id-string",
  "title": "Notification Title",
  "body": "Notification message body"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Notification sent successfully",
  "successCount": 2,
  "failureCount": 0,
  "invalidTokenCount": 0
}
```

## Configuration

### 1. Firebase Service Account Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Project Settings** → **Service Accounts**
4. Click **Generate New Private Key**
5. Save the JSON file securely

### 2. Configure appsettings.json

```json
{
  "Firebase": {
    "ServiceAccountPath": "path/to/your-firebase-service-account.json"
  }
}
```

**Important:** Never commit the service account JSON to source control. Use environment variables or secure vaults in production.

### 3. Environment-Specific Configuration

For production deployments:
- Store the service account JSON in a secure location
- Use environment variables to point to the file
- Example: `"ServiceAccountPath": "%FIREBASE_SERVICE_ACCOUNT_PATH%"`

## Usage Examples

### Client-Side Token Registration

#### Web (JavaScript)
```javascript
// Initialize Firebase in your web app
import { getMessaging, getToken } from 'firebase/messaging';

const messaging = getMessaging();

// Request permission and get token
const token = await getToken(messaging, { vapidKey: 'your-vapid-key' });

// Register with backend
await fetch('https://your-api.com/api/v1/Notifications/register-token', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`
  },
  body: JSON.stringify({
    fcmToken: token,
    deviceType: 'Web'
  })
});
```

#### Android (Kotlin)
```kotlin
FirebaseMessaging.getInstance().token.addOnCompleteListener { task ->
    if (task.isSuccessful) {
        val token = task.result
        // Register with backend
        apiService.registerToken(TokenRequest(token, "Android"))
    }
}
```

#### iOS (Swift)
```swift
Messaging.messaging().token { token, error in
    if let token = token {
        // Register with backend
        APIService.shared.registerToken(token: token, deviceType: "iOS")
    }
}
```

### Server-Side Notification Sending

```csharp
// Inject INotificationService in your service/controller
public class MyService
{
    private readonly INotificationService _notificationService;
    
    public MyService(INotificationService notificationService)
    {
        _notificationService = notificationService;
    }
    
    public async Task NotifyUser(string userId, string title, string message)
    {
        var (success, successCount, failureCount, invalidCount, errorMessage) = 
            await _notificationService.SendNotificationAsync(userId, title, message);
            
        if (success)
        {
            _logger.LogInformation(
                "Notification sent: {SuccessCount} delivered, {FailureCount} failed",
                successCount, failureCount);
        }
    }
}
```

## Token Management

### Automatic Cleanup
The NotificationService automatically handles expired/invalid tokens:
- Detects Firebase errors for invalid tokens
- Removes invalid tokens from the database
- Common error codes handled:
  - `messaging/registration-token-not-registered`
  - `messaging/invalid-registration-token`

### Manual Token Refresh
Clients should refresh tokens:
- On app launch
- When Firebase SDK indicates token refresh
- Periodically (recommended: every 30 days)

## Migration from SignalR

### Changes Made

1. **Removed SignalR Components:**
   - ❌ `ChatHub.cs` - Disabled
   - ❌ `NotificationHub.cs` - Disabled
   - ❌ SignalR middleware and hub mappings removed from `Program.cs`
   - ❌ SignalR authentication handling removed

2. **Added Firebase Components:**
   - ✅ FirebaseAdmin SDK installed
   - ✅ UserToken entity and database table
   - ✅ NotificationService implementation
   - ✅ NotificationsController with REST endpoints
   - ✅ Firebase initialization in Program.cs

3. **Updated Controllers:**
   - `UnifiedSupportController.cs` - Removed SignalR hub context injection
   - `HealthController.cs` - Updated endpoints documentation

### Client Migration Steps

1. Remove SignalR client libraries
2. Add Firebase SDK for your platform
3. Replace SignalR connection code with FCM token registration
4. Update notification handlers to use FCM foreground/background listeners

## Testing

### Using the Test Endpoint

```bash
curl -X POST https://your-api.com/api/v1/Notifications/send-test \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "userId": "test-user-id",
    "title": "Test Notification",
    "body": "This is a test message"
  }'
```

### Testing Locally

1. Set up Firebase project with your test app
2. Configure the service account path in `appsettings.Development.json`
3. Register a device token via the `/register-token` endpoint
4. Send a test notification using the `/send-test` endpoint

## Scalability Considerations

### Performance
- **Multicast messaging**: Sends to up to 500 tokens per request
- **Async processing**: All Firebase calls are asynchronous
- **Token cleanup**: Invalid tokens are removed automatically

### Limitations
- Firebase FCM quota: 1 million messages per day (free tier)
- Payload size: Maximum 4KB per message
- Token batch size: 500 tokens per multicast

### Best Practices
1. **Batch notifications**: Group notifications when sending to multiple users
2. **Prioritize**: Use high-priority only for time-sensitive notifications
3. **Monitor quotas**: Track Firebase usage in Firebase Console
4. **Token lifecycle**: Implement proper token refresh logic in clients

## Troubleshooting

### Common Issues

**Issue:** "Firebase service account file not found"
- **Solution:** Check the path in appsettings.json is correct and file exists

**Issue:** Notifications not received
- **Solution:** 
  1. Verify token is registered in database
  2. Check Firebase Console for delivery logs
  3. Ensure client app has proper FCM configuration

**Issue:** High failure rate
- **Solution:**
  1. Check for expired tokens (implement refresh logic)
  2. Verify Firebase project credentials
  3. Check Firebase quota limits

## Security

### Best Practices
1. **Never expose service account JSON** in client-side code
2. **Validate user authentication** before accepting token registration
3. **Rate limit** notification endpoints to prevent abuse
4. **Sanitize input** for notification title/body to prevent injection
5. **Use HTTPS** for all API communication

### Token Security
- Tokens are device-specific and don't contain sensitive data
- Tokens can be revoked via Firebase Console
- Implement proper authentication before token registration

## Additional Resources

- [Firebase Cloud Messaging Documentation](https://firebase.google.com/docs/cloud-messaging)
- [FCM Best Practices](https://firebase.google.com/docs/cloud-messaging/concept-options)
- [Firebase Admin SDK for .NET](https://firebase.google.com/docs/admin/setup#dotnet)

## Support

For questions or issues related to FCM integration:
1. Check Firebase Console logs
2. Review this documentation
3. Check application logs in `Logs/` directory
4. Consult the Firebase community forums
