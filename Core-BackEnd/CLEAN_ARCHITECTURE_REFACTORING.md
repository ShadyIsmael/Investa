# Clean Architecture Refactoring - Investa Backend

## ✅ Completed Refactoring Summary

This document summarizes the comprehensive architectural refactoring of the Investa Backend following Clean Architecture principles.

---

## 🏛️ 1. Clean Architecture Implementation

### Layer Organization

The project now adheres to Clean Architecture with clear separation of concerns:

#### **Domain Layer** (`Investa.Domain`)
- Pure entities with no external dependencies
- Business logic interfaces
- No references to Application or Infrastructure layers

#### **Application Layer** (`Investa.Application`)
- DTOs with strict naming conventions (camelCase JSON serialization)
- Business service interfaces (`IChatService`, `IProfileService`, etc.)
- New: `ISupportHub` interface defining SignalR contract
- New: `SupportRequestDto` and `SupportRequestNotificationDto`

#### **Infrastructure Layer** (`Investa.Infrastructure`)
- External service implementations
- Database repositories
- SignalR hub implementations (moved from Presentation)
- Crypto services, SMS services

#### **Presentation Layer** (`Investa.API`)
- Controllers
- Middleware (`GlobalExceptionMiddleware`, `RequestContextMiddleware`)
- SignalR Hubs (`ChatHub`, `NotificationHub`)
- `Program.cs` configuration

---

## 📡 2. SignalR "Strict Contract" Implementation

### Hub Configuration

**Primary Route:** `/hubs/chat` (Legacy `/chatHub` maintained for backward compatibility)

### ChatHub Methods

#### Admin Support APIs

- **GET** `/api/support/conversations/active` — Returns active conversations for admin dashboard.
  - Response: array of objects `{ conversationId, userMobile, category, status, createdAt, lastMessage }`
- **POST** `/api/support/conversations/{id}/messages` — Admin posts a message to a conversation. If the conversation status is `Pending`, it will be set to `InProgress`. The message is broadcast to the conversation group (`Conversation:{id}`) as a `ReceiveMessage` event.

- **Auto-generated assistant message**: When a new conversation is created via SignalR the server inserts an initial assistant message (`SenderId = "Investa Assistant"`) into `ChatMessages` to acknowledge receipt.

- **Category preservation**: The selected `category` is saved as a user ChatMessage (SenderId = user mobile or id) so admins can immediately see context (it's the first user message for that conversation).



#### **Inbound (from Client):**
```csharp
Task RequestSupport(SupportRequestDto request)
```

**Request DTO:**
```json
{
  "userMobile": "string",
  "message": "string",
  "category": "string",
  "priority": 1
}
```

#### **Outbound (to Client):**
```csharp
await Clients.All.SendAsync("ReceiveSupportRequest", notificationPayload);
```

**Notification Payload:**
```json
{
  "convId": "guid",
  "userMobile": "string",
  "adminAssigned": true/false,
  "adminEmail": "string",
  "requestedAt": "datetime",
  "serverName": "DESKTOP-DIH7CQH"
}
```

#### **Inbound (from Client): Close conversation**
```csharp
Task CloseConversation(Guid conversationId)
```

- Marks conversation `IsActive = false` in the DB and saves changes.

#### **Outbound (to Admins): Conversation closed notification**
```csharp
await Clients.Group("Admins").SendAsync("ConversationClosed", new { convId = conversationId });
```

**Payload:**
```json
{
  "convId": "guid"
}

```


### Logging
Every hub invocation logs:
- `Environment.MachineName` (DESKTOP-DIH7CQH)
- Connection ID
- User identity
- Action performed

**Example Log:**
```
[DESKTOP-DIH7CQH] SignalR.RequestSupport called. ConnectionId=abc123, User=+1234567890
```

---

## 🌐 3. Network & Connectivity (Zero-Config)

### Kestrel Binding
**Configured in:** `Program.cs` and `launchSettings.json`

```csharp
builder.WebHost.ConfigureKestrel(options =>
{
    options.ListenAnyIP(5000); // Accessible from any device on local network
});
```

**launchSettings.json:**
```json
"applicationUrl": "http://0.0.0.0:5000",
"ASPNETCORE_URLS": "http://0.0.0.0:5000"
```

### Access Methods
The server is now accessible via:
- `http://localhost:5000`
- `http://DESKTOP-DIH7CQH:5000`
- `http://DESKTOP-DIH7CQH.local:5000`
- `http://[IP_ADDRESS]:5000` (any IP on the machine)

### CORS Policy: AllowLocalNetwork

**Zero-Config Discovery** - No hardcoded IPs required:

```csharp
options.AddPolicy("AllowLocalNetwork", policy =>
{
    policy.SetIsOriginAllowed(origin =>
    {
        var host = new Uri(origin).Host;
        
        // Auto-allow local network ranges
        if (host == "localhost") return true;
        if (host.EndsWith(".local")) return true;
        if (host.StartsWith("10.")) return true;
        if (host.StartsWith("192.168.")) return true;
        if (host.StartsWith("172.")) // 172.16.0.0 - 172.31.255.255
        {
            var parts = host.Split('.');
            if (int.TryParse(parts[1], out int secondOctet))
                return secondOctet >= 16 && secondOctet <= 31;
        }
        return false;
    })
    .AllowAnyHeader()
    .AllowAnyMethod()
    .AllowCredentials(); // Required for SignalR
});
```

**Applied in middleware pipeline:**
```csharp
app.UseCors("AllowLocalNetwork");
```

---

## 🏥 4. Observability & Health

### Health Endpoint

**Route:** `GET /api/health`

**Response:**
```json
{
  "status": "Healthy",
  "deviceName": "DESKTOP-DIH7CQH",
  "hostName": "DESKTOP-DIH7CQH",
  "binding": "0.0.0.0:5000",
  "ipAddresses": ["192.168.x.x", "10.x.x.x"],
  "timestamp": "2026-01-12T18:15:00Z",
  "environment": "Development",
  "version": "1.0.0",
  "endpoints": {
    "api": "http://DESKTOP-DIH7CQH:5000/api",
    "swagger": "http://DESKTOP-DIH7CQH:5000/swagger",
    "chatHub": "http://DESKTOP-DIH7CQH:5000/hubs/chat",
    "notificationHub": "http://DESKTOP-DIH7CQH:5000/hubs/notification"
  }
}
```

**Ping Endpoint:** `GET /api/health/ping`
```json
{
  "pong": true,
  "server": "DESKTOP-DIH7CQH",
  "timestamp": "2026-01-12T18:15:00Z"
}
```

### Global Exception Handling

**Enhanced Middleware:** `GlobalExceptionMiddleware`

Features:
- Returns consistent JSON for all errors (no HTML traces)
- Maps exception types to HTTP status codes
- Adds `X-Server-Name` header for debugging
- Uses `camelCase` naming policy
- Logs with server identity

**Example Error Response:**
```json
{
  "success": false,
  "message": "An error occurred",
  "errors": [
    {
      "code": "Exception",
      "message": "Detailed error message"
    }
  ],
  "data": null
}
```

---

## 🔧 5. JSON Serialization Configuration

### Global camelCase Enforcement

**Configured in:** `Program.cs`

```csharp
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
        options.JsonSerializerOptions.DictionaryKeyPolicy = JsonNamingPolicy.CamelCase;
        options.JsonSerializerOptions.WriteIndented = false;
    });
```

**Impact:**
- All API responses use `camelCase` property names
- DTOs with `[JsonPropertyName]` attributes maintain explicit naming
- Frontend/Mobile apps receive consistent JSON format

---

## 🧹 6. Dependency Injection Optimization

### Organized Service Registration

**File:** `Program.cs` → `RegisterApplicationServices()`

Services are now organized by:
1. **Layer** (Infrastructure, Application, Presentation)
2. **Responsibility** (Repositories, Business Logic, External Services)
3. **Lifetime** (Scoped, Singleton, Transient)

**Example:**
```csharp
// Infrastructure Layer - Repositories (Scoped)
services.AddScoped<IUnitOfWork, UnitOfWork>();
services.AddScoped(typeof(IRepository<>), typeof(Repository<>));

// Application Layer - Business Services (Scoped)
services.AddScoped<IChatService, ChatService>();
services.AddScoped<IProfileService, ProfileService>();

// Infrastructure Layer - Security (Scoped)
services.AddScoped<IJwtTokenService, JwtTokenService>();
services.AddScoped<ICryptoService, AesGcmCryptoService>();

// Application Layer - Singleton Services
services.AddSingleton<IAdminAvailabilityService, AdminAvailabilityService>();

// Presentation Layer - Request Context (Scoped)
services.AddScoped<RequestContext>();
```

---

## 📋 Key Files Modified

### Created Files:
1. `Investa.Application/DTOs/SupportRequestDto.cs` - Support request DTOs
2. `Investa.Application/Interfaces/ISupportHub.cs` - SignalR contract interface
3. `Investa.API/Controllers/HealthController.cs` - Health monitoring endpoint

### Modified Files:
1. `Investa.API/Program.cs` - Complete refactor with Clean Architecture principles
2. `Investa.API/Hubs/ChatHub.cs` - Strict naming convention, enhanced logging
3. `Investa.API/Middlewares/GlobalExceptionMiddleware.cs` - Improved error handling
4. `Investa.API/Properties/launchSettings.json` - Network binding configuration

---

## 🚀 Running the Application

### Start the Server:
```powershell
cd Investa.API
dotnet run
```

### Verify Health:
```powershell
# From local machine
Invoke-RestMethod http://localhost:5000/api/health

# From network device
Invoke-RestMethod http://DESKTOP-DIH7CQH:5000/api/health
```

### Access Swagger:
- Local: `http://localhost:5000/swagger`
- Network: `http://DESKTOP-DIH7CQH:5000/swagger`

### Connect SignalR:
- Primary: `ws://DESKTOP-DIH7CQH:5000/hubs/chat`
- Legacy: `ws://DESKTOP-DIH7CQH:5000/chatHub`

---

## 🎯 Frontend Integration Guide

### SignalR Connection (JavaScript/TypeScript):
```typescript
const connection = new HubConnectionBuilder()
    .withUrl("http://DESKTOP-DIH7CQH:5000/hubs/chat", {
        accessTokenFactory: () => yourJwtToken
    })
    .build();

// Send support request
await connection.invoke("RequestSupport", {
    userMobile: "+1234567890",
    message: "I need help",
    category: "General",
    priority: 1
});

// Listen for support request notifications
connection.on("ReceiveSupportRequest", (notification) => {
    console.log("New support request:", notification);
    // notification.convId, notification.userMobile, notification.serverName
});
```

### API Calls:
```typescript
// All responses are camelCase
const response = await fetch("http://DESKTOP-DIH7CQH:5000/api/health");
const data = await response.json();
console.log(data.deviceName); // "DESKTOP-DIH7CQH"
console.log(data.endpoints.chatHub); // "http://DESKTOP-DIH7CQH:5000/hubs/chat"
```

---

## 🔒 Security Considerations

1. **CORS:** Only allows local network ranges (10.x, 192.168.x, 172.16-31.x, .local domains)
2. **JWT:** All SignalR connections require valid JWT in query string
3. **HTTPS:** Currently disabled for local development (can be enabled in `Program.cs`)
4. **Authorization:** `[Authorize]` attribute on all hubs

---

## 📊 Build Status

✅ Build: **Successful**
⚠️ Warnings: 4 (nullable reference warnings - non-critical)
🚀 Status: **Running on DESKTOP-DIH7CQH:5000**

---

## 🔄 Next Steps (Optional Enhancements)

1. **Add HTTPS support** for production
2. **Implement rate limiting** for health endpoint
3. **Add distributed tracing** (OpenTelemetry)
4. **Create integration tests** for SignalR hubs
5. **Add API versioning** (v1, v2)
6. **Implement health check probes** for database, SignalR, etc.

---

**Refactoring Completed:** January 12, 2026  
**Architecture:** Clean Architecture with SOLID principles  
**Server:** DESKTOP-DIH7CQH  
**Version:** 1.0.0
