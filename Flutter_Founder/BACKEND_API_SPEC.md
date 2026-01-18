# Backend API Specification for FCM Support Chat

## Overview
This document specifies the REST API endpoints required by the Flutter app's FCM-based support chat system.

## Base URL
```
https://your-backend-domain.com/api
```

## Authentication
All endpoints require JWT authentication via Bearer token:
```
Authorization: Bearer <jwt-token>
```

---

## Endpoints

### 1. Register FCM Token

**Endpoint**: `POST /users/fcm-token`

**Description**: Store or update user's FCM device token for push notifications.

**Headers**:
```
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "fcmToken": "string"
}
```

**Response**: `200 OK` or `204 No Content`

**Example**:
```bash
curl -X POST https://api.example.com/api/users/fcm-token \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "Content-Type: application/json" \
  -d '{"fcmToken":"fH8xY2..."}'
```

---

### 2. Create Support Request

**Endpoint**: `POST /support/requests`

**Description**: Create a new support conversation and notify admins.

**Headers**:
```
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "userMobile": "string",
  "message": "string",
  "category": "string",
  "timestamp": "ISO8601 string"
}
```

**Response**: `200 OK` or `201 Created`
```json
{
  "conversationId": "string",
  "status": "waiting",
  "createdAt": "ISO8601 string"
}
```

**Example**:
```bash
curl -X POST https://api.example.com/api/support/requests \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "Content-Type: application/json" \
  -d '{
    "userMobile": "+1234567890",
    "message": "Need help with my account",
    "category": "Account",
    "timestamp": "2026-01-17T10:30:00Z"
  }'
```

---

### 3. Send Message

**Endpoint**: `POST /support/conversations/{conversationId}/messages`

**Description**: Send a message in an existing conversation.

**Headers**:
```
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

**Path Parameters**:
- `conversationId` (string): The conversation ID

**Request Body**:
```json
{
  "conversationId": "string",
  "message": "string",
  "userMobile": "string",
  "timestamp": "ISO8601 string"
}
```

**Response**: `200 OK`, `201 Created`, or `204 No Content`

**Example**:
```bash
curl -X POST https://api.example.com/api/support/conversations/conv-123/messages \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "Content-Type: application/json" \
  -d '{
    "conversationId": "conv-123",
    "message": "Thank you for the help!",
    "userMobile": "+1234567890",
    "timestamp": "2026-01-17T10:35:00Z"
  }'
```

---

### 4. Close Conversation

**Endpoint**: `POST /support/conversations/{conversationId}/close`

**Description**: Mark a support conversation as closed.

**Headers**:
```
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

**Path Parameters**:
- `conversationId` (string): The conversation ID

**Response**: `200 OK` or `204 No Content`

**Example**:
```bash
curl -X POST https://api.example.com/api/support/conversations/conv-123/close \
  -H "Authorization: Bearer eyJhbGc..."
```

---

### 5. Get Conversation History (Optional)

**Endpoint**: `GET /support/conversations/{conversationId}/messages`

**Description**: Retrieve message history for a conversation.

**Headers**:
```
Authorization: Bearer <jwt-token>
```

**Path Parameters**:
- `conversationId` (string): The conversation ID

**Response**: `200 OK`
```json
{
  "messages": [
    {
      "id": "string",
      "conversationId": "string",
      "message": "string",
      "senderType": "user|admin",
      "senderName": "string",
      "timestamp": "ISO8601 string"
    }
  ]
}
```

**Example**:
```bash
curl -X GET https://api.example.com/api/support/conversations/conv-123/messages \
  -H "Authorization: Bearer eyJhbGc..."
```

---

### 6. Send Typing Indicator (Optional)

**Endpoint**: `POST /support/conversations/{conversationId}/typing`

**Description**: Notify admin that user is typing (best-effort, no error handling required).

**Headers**:
```
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

**Path Parameters**:
- `conversationId` (string): The conversation ID

**Request Body**:
```json
{
  "isTyping": boolean
}
```

**Response**: `200 OK` or `204 No Content`

---

## FCM Notification Payloads

### When Admin Joins Conversation

**FCM Notification Data**:
```json
{
  "notification": {
    "title": "Admin Joined",
    "body": "John is now helping you"
  },
  "data": {
    "conversationId": "conv-123",
    "adminId": "admin-456",
    "adminName": "John",
    "isFromAdmin": "true"
  }
}
```

### When Admin Sends Message

**FCM Notification Data**:
```json
{
  "notification": {
    "title": "New Message from John",
    "body": "How can I help you today?"
  },
  "data": {
    "conversationId": "conv-123",
    "messageId": "msg-789",
    "message": "How can I help you today?",
    "isFromAdmin": "true",
    "senderName": "John",
    "adminId": "admin-456"
  }
}
```

### When Conversation is Closed

**FCM Notification Data**:
```json
{
  "notification": {
    "title": "Conversation Closed",
    "body": "Your support request has been resolved"
  },
  "data": {
    "conversationId": "conv-123",
    "status": "closed",
    "isFromAdmin": "true"
  }
}
```

---

## Firebase Admin SDK Implementation (Node.js)

### Setup
```javascript
const admin = require('firebase-admin');
const serviceAccount = require('./path/to/serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
```

### Send Notification Function
```javascript
async function sendNotificationToUser(userFcmToken, notification, data) {
  try {
    const message = {
      token: userFcmToken,
      notification: {
        title: notification.title,
        body: notification.body
      },
      data: data,
      android: {
        priority: 'high',
        notification: {
          channelId: 'high_importance_channel',
          sound: 'default',
          priority: 'high'
        }
      },
      apns: {
        headers: {
          'apns-priority': '10'
        },
        payload: {
          aps: {
            contentAvailable: true,
            sound: 'default',
            badge: 1
          }
        }
      }
    };

    const response = await admin.messaging().send(message);
    console.log('Notification sent successfully:', response);
    return response;
  } catch (error) {
    console.error('Error sending notification:', error);
    throw error;
  }
}
```

### Example: Admin Sends Message
```javascript
app.post('/api/support/admin/send-message', async (req, res) => {
  const { conversationId, message, adminId, adminName } = req.body;
  
  // 1. Save message to database
  await db.saveMessage({
    conversationId,
    message,
    senderId: adminId,
    senderType: 'admin',
    timestamp: new Date()
  });
  
  // 2. Get user's FCM token from database
  const user = await db.getUserByConversation(conversationId);
  const fcmToken = user.fcmToken;
  
  if (fcmToken) {
    // 3. Send FCM notification
    await sendNotificationToUser(
      fcmToken,
      {
        title: `New Message from ${adminName}`,
        body: message
      },
      {
        conversationId: conversationId,
        messageId: generateId(),
        message: message,
        isFromAdmin: 'true',
        senderName: adminName,
        adminId: adminId
      }
    );
  }
  
  res.status(200).json({ success: true });
});
```

### Example: User Creates Support Request
```javascript
app.post('/api/support/requests', authenticateUser, async (req, res) => {
  const { userMobile, message, category } = req.body;
  const userId = req.user.id;
  
  // 1. Create conversation in database
  const conversationId = generateId();
  await db.createConversation({
    id: conversationId,
    userId: userId,
    userMobile: userMobile,
    category: category,
    status: 'waiting',
    createdAt: new Date()
  });
  
  // 2. Save initial message
  await db.saveMessage({
    conversationId,
    message,
    senderId: userId,
    senderType: 'user',
    timestamp: new Date()
  });
  
  // 3. Notify all online admins
  const adminTokens = await db.getOnlineAdminTokens();
  for (const adminToken of adminTokens) {
    await sendNotificationToUser(
      adminToken,
      {
        title: 'New Support Request',
        body: message
      },
      {
        conversationId: conversationId,
        userMobile: userMobile,
        category: category,
        message: message
      }
    );
  }
  
  res.status(201).json({ conversationId });
});
```

---

## Database Schema (Suggested)

### Users Table
```sql
CREATE TABLE users (
  id VARCHAR(255) PRIMARY KEY,
  mobile VARCHAR(20),
  fcm_token TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Conversations Table
```sql
CREATE TABLE conversations (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  user_mobile VARCHAR(20),
  admin_id VARCHAR(255),
  category VARCHAR(50),
  status VARCHAR(20) DEFAULT 'waiting',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  closed_at TIMESTAMP NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### Messages Table
```sql
CREATE TABLE messages (
  id VARCHAR(255) PRIMARY KEY,
  conversation_id VARCHAR(255) NOT NULL,
  sender_id VARCHAR(255) NOT NULL,
  sender_type ENUM('user', 'admin') NOT NULL,
  message TEXT NOT NULL,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (conversation_id) REFERENCES conversations(id)
);
```

---

## Testing

### Test FCM Token Registration
```bash
POST /api/users/fcm-token
{
  "fcmToken": "test-token-12345"
}
```

### Test Support Request Creation
```bash
POST /api/support/requests
{
  "userMobile": "+1234567890",
  "message": "Test support request",
  "category": "General",
  "timestamp": "2026-01-17T10:00:00Z"
}
```

### Test Send Message
```bash
POST /api/support/conversations/conv-test-123/messages
{
  "conversationId": "conv-test-123",
  "message": "Test message",
  "userMobile": "+1234567890",
  "timestamp": "2026-01-17T10:05:00Z"
}
```

---

## Security Considerations

1. **Rate Limiting**: Implement rate limiting on all endpoints
2. **Input Validation**: Validate and sanitize all user inputs
3. **Token Verification**: Verify FCM tokens before storing
4. **Authorization**: Ensure users can only access their own conversations
5. **Encryption**: Use HTTPS for all API calls
6. **Token Expiry**: Implement FCM token refresh mechanism

---

## Error Handling

All endpoints should return consistent error responses:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {}
  }
}
```

**Common Error Codes**:
- `UNAUTHORIZED` (401): Invalid or missing auth token
- `FORBIDDEN` (403): User doesn't have access
- `NOT_FOUND` (404): Resource not found
- `VALIDATION_ERROR` (400): Invalid request data
- `SERVER_ERROR` (500): Internal server error

---

## Next Steps

1. Implement these endpoints in your backend
2. Set up Firebase Admin SDK with service account
3. Configure database schema
4. Test each endpoint with Postman/curl
5. Test FCM notifications with Firebase Console
6. Integrate with Flutter app
7. Monitor FCM delivery reports

---

**Last Updated**: January 17, 2026
