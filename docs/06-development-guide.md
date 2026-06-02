# Investa – Development Guide

## Prerequisites

| Tool | Version | Purpose |
|---|---|---|
| .NET SDK | 9.0+ | Backend |
| Node.js | 18+ | Admin + Client portals |
| Flutter | 3.x | Mobile apps |
| SQL Server | 2019+ | Database |
| Docker (optional) | latest | Containerized SQL Server |

---

## Environment Setup

### 1. Backend (Core-BackEnd)

```bash
cd Core-BackEnd

# Restore dependencies
dotnet restore Investa.sln

# Build
dotnet build Investa.sln

# Apply migrations
dotnet ef database update --project Investa.Infrastructure --startup-project Investa.API

# Run
dotnet run --project Investa.API
```

API will be available at `http://localhost:5235` (check `appsettings.Development.json`).

**Configuration files:**
- `Investa.API/appsettings.json` — base config
- `Investa.API/appsettings.Development.json` — dev overrides (connection string, JWT secret)

**Key config values to set:**
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=...;Database=InvestaDb;..."
  },
  "JwtSettings": {
    "SecretKey": "<your-secret-key>",
    "Issuer": "Investa",
    "Audience": "InvestaUsers"
  },
  "Firebase": {
    "ProjectId": "..."
  }
}
```

---

### 2. Admin Portal (investa-admin-portal)

```bash
cd investa-admin-portal

# Install dependencies
npm install

# Run dev server
npm run dev

# Build for production
npm run build
```

Dev server: `http://localhost:5173`

**Environment variables** (`.env.local`):
```
VITE_API_BASE_URL=http://localhost:5235
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_PROJECT_ID=...
```

---

### 3. Client Portal (investa-client-portal)

```bash
cd investa-client-portal

# Install dependencies
npm install

# Run dev server
ng serve

# Build for production
ng build
```

Dev server: `http://localhost:4200`

**API base URL** is read from `localStorage` key `apiBase` at runtime. Default: `http://desktop-dih7cqh:5235`.  
Set it in `src/app/config/api.config.ts`.

---

### 4. Flutter Founder App

```bash
cd Flutter_Founder

# Install packages
flutter pub get

# Run on device/emulator
flutter run

# Build APK
flutter build apk --release
```

**Configuration:** `lib/services/config.dart` and `.env` (flutter_dotenv).

---

### 5. Flutter Partner App

```bash
cd Flutter_Partner

# Install packages
flutter pub get

# Run on device/emulator
flutter run

# Build APK
flutter build apk --release
```

---

### 6. File Store (InvestaFileStore)

```bash
cd InvestaFileStore

dotnet run
```

Serves uploaded files from the `Storage/` directory.

---

## Git Workflow

The project uses two worktrees:
- `D:\projects\Investa\gitInvesta` — active development (feature branches)
- `D:\projects\Investa\gitInvesta-main` — main branch

```bash
# Switch to gitInvesta folder for development
cd D:\projects\Investa\gitInvesta

# See active branches
git branch -a

# Create a feature branch
git checkout -b feature/my-feature

# Push to remote
git push origin feature/my-feature
```

---

## Running Tests

### Backend Tests

```bash
cd Core-BackEnd
dotnet test Investa.sln
```

### Client Portal Tests (Angular)

```bash
cd investa-client-portal
ng test
```

### Flutter Tests

```bash
cd Flutter_Founder
flutter test

cd Flutter_Partner
flutter test
```

---

## Key Development Patterns

### Backend — Adding a New Feature

1. **Domain:** Add entity to `Investa.Domain/Entities/`
2. **Application:** Add DTO to `DTOs/`, interface to `Interfaces/`, service to `Services/`, mapping in `MappingProfile.cs`
3. **Infrastructure:** Add `DbSet<T>` to `ApplicationDbContext`, configure in `OnModelCreating`, add migration
4. **API:** Add controller in `Investa.API/Controllers/`

### Flutter — Adding a New Screen

1. Add screen file in `lib/screens/` (or `lib/features/<feature>/presentation/screens/` for clean arch features)
2. Register route in `lib/config/routes.dart`
3. Add any required service methods in `lib/services/`
4. Wire state via Provider (`lib/services/app_state.dart`)

### Angular — Adding a New Page

1. Add component in `src/app/pages/` or `src/app/pages/admin/`
2. Register route in `src/app/app.routes.ts`
3. Add any API calls to the relevant service in `src/app/services/`

---

## Common Issues

### Backend won't start — missing connection string
Check `appsettings.Development.json` has a valid SQL Server connection.

### Flutter Firebase errors
Ensure `google-services.json` (Android) and `GoogleService-Info.plist` (iOS) are present in the respective platform folders.

### Angular API 401 errors in dev
Make sure the backend is running and `apiBase` in localStorage points to the correct URL, or update `api.config.ts`.

### Null reference warnings in build
Existing CS8602/CS8603 warnings are pre-existing — do not suppress with `#pragma`. Fix them properly by adding null checks.
