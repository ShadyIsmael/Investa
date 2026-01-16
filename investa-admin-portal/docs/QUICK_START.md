# Quick Reference - Investa Admin Portal Structure

## 📁 Where to Find Things

### 🎨 **Adding New UI Components**
```
src/components/common/     ← Shared, reusable components (buttons, cards, etc.)
src/components/layout/     ← Layout components (header, sidebar, etc.)
```

### ⚙️ **Adding New Features**
```
src/features/[feature-name]/
  ├── ComponentA.tsx
  ├── ComponentB.tsx
  └── hooks/              ← Feature-specific hooks (optional)
```

**Example:** Adding a "Reports" feature
```
src/features/reports/
  ├── ReportsList.tsx
  ├── ReportDetails.tsx
  └── CreateReport.tsx
```

### 🔌 **Adding New Services/APIs**
```
src/services/[service-name].ts
```

**Template:**
```typescript
import { api } from '@/api/api';

export const myService = {
  async getData() {
    const response = await api.get('/api/endpoint');
    return response;
  }
};
```

### 🪝 **Adding Custom Hooks**
```
src/hooks/use[HookName].ts
```

**Example:**
```typescript
// src/hooks/useDebounce.ts
import { useState, useEffect } from 'react';

export const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  
  return debouncedValue;
};
```

### 📝 **Adding Types**
```
src/types/index.ts      ← Add to existing file
```

**Example:**
```typescript
export interface Report {
  id: string;
  title: string;
  createdAt: string;
  data: any;
}
```

### 🎭 **Adding Mock Data**
```
src/mocks/[domain].ts
```

**Example:**
```typescript
// src/mocks/reports.ts
export const MOCK_REPORTS = [
  { id: '1', title: 'Q1 Report', createdAt: '2026-01-01', data: {} }
];
```

### 📚 **Adding Documentation**
```
docs/[document-name].md
```

## 🔧 Import Path Shortcuts

All imports use the `@/` prefix:

```typescript
// ✅ Correct
import { Icon } from '@/components/common/Icons';
import { userService } from '@/services/userService';
import { User } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { MOCK_USERS } from '@/mocks';

// ❌ Avoid
import { Icon } from '../../../components/common/Icons';
import { userService } from '../../services/userService';
```

## 🚀 Common Commands

```bash
# Development
npm run dev              # Start dev server (http://localhost:5173)

# Building
npm run build           # Production build
npm run preview         # Preview production build

# Testing
npm test                # Run tests
npm test:watch          # Run tests in watch mode
```

## 📦 Key Files

| File | Purpose |
|------|---------|
| `src/main.tsx` | Application entry point |
| `src/App.tsx` | Root component with routing |
| `src/services/api.ts` | HTTP client configuration |
| `src/context/AuthContext.tsx` | Authentication state |
| `tsconfig.json` | TypeScript configuration |
| `vite.config.ts` | Vite build configuration |

## 🎯 Feature Structure Template

When adding a new feature, follow this pattern:

```
src/features/[feature-name]/
  ├── index.ts                    # Re-exports (optional)
  ├── [Feature]List.tsx           # List view
  ├── [Feature]Details.tsx        # Detail view
  ├── [Feature]Form.tsx           # Create/Edit form
  ├── components/                 # Feature-specific components
  │   └── [Component].tsx
  ├── hooks/                      # Feature-specific hooks
  │   └── use[Hook].ts
  └── types.ts                    # Feature-specific types (optional)
```

## 🔐 RBAC Components Location

All Role-Based Access Control components are in:
```
src/features/rbac/
  ├── Groups.tsx
  ├── GroupsRoles.tsx
  ├── Permissions.tsx
  ├── Roles.tsx
  └── UsersList.tsx
```

## 🌐 Environment Variables

Create a `.env.local` file (copy from `.env.example`):

```bash
VITE_HOST=0.0.0.0
VITE_PORT=5173
VITE_API_BASE_URL=http://localhost:5000/api
GEMINI_API_KEY=your-api-key-here
```

## 🐛 Debugging Tips

### Import Errors
- Check `tsconfig.json` and `vite.config.ts` for path aliases
- Ensure you're using `@/` prefix
- Verify file exists at the correct path

### Build Errors
```bash
# Clear cache and rebuild
rm -rf node_modules/.vite
npm run dev
```

### Type Errors
- Check `src/types/index.ts` for type definitions
- Ensure all exported types are properly imported
- Run TypeScript check: `npx tsc --noEmit`

---

**Last Updated:** January 15, 2026  
**For detailed documentation, see:** [docs/](./docs/)
