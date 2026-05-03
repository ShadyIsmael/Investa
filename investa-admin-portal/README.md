<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Investa Admin Portal

**Production-ready, refactored admin portal with modern architecture**

[![Architecture](https://img.shields.io/badge/Architecture-Refactored-success)](./docs/ARCHITECTURE.md)
[![Migration](https://img.shields.io/badge/Migration-Guide-blue)](./docs/MIGRATION.md)

## 🚀 Quick Start

**Prerequisites:** Node.js 16+

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## ✨ What's New (Refactored Architecture)

### 🎯 Zero Hardcoded URLs
- **Dynamic URL Resolution**: All endpoints now use `window.location.hostname`
- **Environment-Aware**: Automatically adapts to localhost, machine names, or production domains
- **No IP Conflicts**: Works seamlessly across different development machines

### 📁 Clean Folder Structure
```
src/
├── components/      # Shared UI components
├── features/        # Feature-specific modules
├── hooks/           # Custom React hooks (useAuth, useTheme, etc.)
├── services/        # API & SignalR (centralized, dynamic)
├── types/           # TypeScript definitions
└── utils/           # Utilities (logger, environment, constants)
```

### 🔧 Centralized Services
- **API Service** (`src/services/api.ts`): Clean HTTP client with auto-retry, auth, and error handling
- **SignalR Service** (`src/services/signalr.tsx`): Real-time communication with automatic reconnection
- **Logger** (`src/utils/logger.ts`): Environment-aware logging (production-safe)

### 🪝 Custom Hooks
```typescript
import { useAuth, useTheme, useLocalStorage } from './src/hooks';

const { isAuthenticated, login, logout } = useAuth();
const { theme, toggleTheme } = useTheme();
const [settings, setSettings] = useLocalStorage('settings', {});
```

### 📝 Clean Code
- ✅ All `console.log` statements replaced with centralized logger
- ✅ No commented-out code blocks
- ✅ No unused imports or variables
- ✅ Consistent naming conventions (camelCase, PascalCase)
- ✅ TypeScript interfaces for all data models

## 🛠️ Environment Configuration

Create a `.env` file (optional - auto-detects if not set):

```env
# API Configuration
VITE_API_BASE_URL=http://desktop-dih7cqh:5235

Note: The admin portal prefers the following precedence for API base URL:
1) A runtime meta tag in `index.html`: `<meta name="investa-api-base" content="http://localhost:5000" />` (picked up at page load),
2) `VITE_API_BASE_URL` environment variable (build-time),
3) Fallback to `http://localhost:5000` constructed from the current hostname.
VITE_API_PORT=5235

# SignalR Configuration  
VITE_HUB_URL=http://localhost:5000/chathub
VITE_HUB_PORT=5000

# Development
VITE_USE_MOCKS=false

# API Keys
GEMINI_API_KEY=your-api-key-here
```

**Note**: If not configured, the system uses `window.location.hostname` with default ports (5235 for API, 5000 for SignalR).

## 📚 Documentation

- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Complete architectural overview and patterns
- **[MIGRATION.md](./MIGRATION.md)** - Step-by-step migration guide from old to new structure

## 🔌 SignalR (Real-time Communication)

```typescript
import { useSignalR } from './src/services';

function MyComponent() {
  const { connectionState, on, off } = useSignalR();
  
  useEffect(() => {
    const handler = (data) => {
      // Handle real-time event
    };
    
    on('NewMessage', handler);
    return () => off('NewMessage', handler);
  }, [on, off]);
  
  return <div>Status: {connectionState}</div>;
}
```

**Features**:
- Automatic connection on authentication
- Auto-reconnect with exponential backoff
- Dynamic Hub URL (no hardcoded IPs)
- Event-driven architecture

## 🎨 Features

- **Authentication**: Secure login/logout with token management
- **Dashboard**: Real-time statistics and analytics
- **User Management**: CRUD operations for users with role-based access
- **Client Management**: Client profiles and verification tracking
- **Support System**: Ticket management with real-time updates
- **Finance Module**: Chart of accounts, invoicing, journal entries
- **Real-time Chat**: SignalR-powered online support
- **Theme Support**: Light/dark mode with persistence
- **API Testing**: Built-in API tester for development

## 🏗️ Architecture Highlights

### Dynamic Service Layer
```typescript
// Automatically resolves to: http://your-machine:5235
const users = await api.get<User[]>('/api/users');

// Automatically resolves to: http://your-machine:5000/chathub
const hubUrl = getDynamicHubUrl('/chathub');
```

### Centralized Logging
```typescript
import { logger } from './src/utils/logger';

logger.info('User logged in', user);
logger.api.request('GET', '/api/users');
logger.signalr.connected(connectionId);
logger.error('Operation failed', error);
```

### Type-Safe Storage
```typescript
import { storage } from './src/utils/environment';

storage.set('key', 'value');
const value = storage.get('key');
storage.remove('key');
```

## 📦 Tech Stack

- **React 19** - UI framework
- **TypeScript 5** - Type safety
- **Vite 6** - Build tool & dev server
- **SignalR** - Real-time communication
- **Zustand** - State management
- **Recharts** - Data visualization
- **Tailwind CSS** - Styling (utility-first)

## 📚 Documentation

- [📖 Quick Start Guide](./docs/QUICK_START.md) - Fast introduction to the project structure
- [✅ Refactoring Complete](./docs/REFACTORING_COMPLETE.md) - Details of the recent refactoring
- [🏗️ Architecture](./docs/ARCHITECTURE.md) - System architecture and design decisions
- [🔐 Permissions Guide](./docs/PERMISSIONS.md) - RBAC implementation guide
- [🔒 Security Checklist](./docs/SECURITY_CHECKLIST.md) - Security best practices

## 🧪 Development

```bash
# Start dev server
npm run dev

# Type check
npx tsc --noEmit

# Lint
npx eslint src

# Build
npm run build
```

---

## Code Quality (May 2026)

All debug output statements removed from production code across 7 files:

| File | Changes |
|---|---|
| `src/features/support/SupportDashboard.tsx` | Removed all `console.log` calls |
| `src/pages/Dashboard.tsx` | Removed all `console.log` debug statements |
| `src/pages/Login.tsx` | Removed all `console.log` debug statements |
| `src/contexts/AuthContext.tsx` | Removed all `console.log` / `console.debug` statements |
| `src/features/support/SupportRequests.tsx` | Removed all `console.log` calls |
| `src/features/support/ChatView.tsx` | Removed all `console.log` calls |
| `src/features/notifications/Notifications.tsx` | Removed all `console.log` calls |

**Result:** 0 active debug logs in production bundle. All logging now goes through `src/utils/logger.ts` which is environment-aware (silent in production).
