# Frontend Manual Cleanup Checklist

This document outlines the manual frontend cleanup required to complete the user type standardization from 3 types (`OrgUser`, `Founder`, `Partner`) to 2 types (`OrgUser`, `Client`).

## Client Portal (Angular) - Manual Tasks

### 1. Login Component
**File:** `investa-client-portal/src/app/pages/login/login.component.ts`

**Changes Needed:**
- [ ] Remove `role` signal (line ~24)
- [ ] Remove `theme` computed property (investor vs founder theming)
- [ ] Remove role query parameter handling in constructor
- [ ] Update `onSubmit()` to always use `UserRoles.CLIENT` and navigate to `/admin/dashboard`
- [ ] Simplify form to remove role selection

**Before:**
```typescript
role = signal<UserRole>('investor');
theme = computed(() => { /* role-based colors */ });

await this.authService.login(fullMobile, password, role);
const redirectPath = role === 'investor' ? '/admin/investments' : '/admin/dashboard';
```

**After:**
```typescript
// Remove role signal and theme computed
await this.authService.login(fullMobile, password, UserRoles.CLIENT);
this.router.navigate(['/admin/dashboard']);
```

### 2. Login Template
**File:** `investa-client-portal/src/app/pages/login/login.component.html`

**Changes Needed:**
- [ ] Remove role toggle buttons (investor/founder switch)
- [ ] Remove dynamic theme classes like `[theme().primaryGradient]`
- [ ] Use single color scheme (recommend emerald/teal for all users)
- [ ] Remove role-based text like "Login as Investor" vs "Login as Founder"

### 3. Dashboard Component
**File:** `investa-client-portal/src/app/pages/admin/dashboard/dashboard.component.ts`

**Changes Needed:**
- [ ] Remove `userRole()` checks (lines ~134, ~139, ~229, ~230)
- [ ] Show all features to all users (no role-based hiding)
- [ ] Simplify chart labels (remove "You invested" vs "Amount" distinction)

**Before:**
```typescript
if (this.userRole() === 'investor') {
  // Investor-specific logic
} else if (this.userRole() === 'founder') {
  // Founder-specific logic
}
```

**After:**
```typescript
// All users see same features
// Use user permissions/groups for feature access control
```

### 4. Dashboard Template
**File:** `investa-client-portal/src/app/pages/admin/dashboard/dashboard.component.html`

**Changes Needed:**
- [ ] Remove role-based `*ngIf` directives
- [ ] Show all widgets/charts to all users
- [ ] Update text to be role-neutral

### 5. Models and Interfaces
**File:** `investa-client-portal/src/app/models/*.ts`

**Changes Needed:**
- [ ] Remove `clientType` references
- [ ] Update JSDoc comments mentioning "Founder" or "Investor" types

**Before:**
```typescript
/**
 * Team members must be registered users with ClientType of Founder or Both.
 */
```

**After:**
```typescript
/**
 * Team members must be registered Client users.
 */
```

### 6. Investment Service
**File:** `investa-client-portal/src/app/services/investment.service.ts`

**Changes Needed:**
- [ ] Remove `clientType` mapping (line ~217)
- [ ] Update comments referencing Founder/Investor roles

## Admin Portal (React) - Manual Tasks

### 1. Create Constants File
**File:** `investa-admin-portal/src/utils/constants.ts`

**Add:**
```typescript
export const UserTypes = {
  ORG_USER: 'OrgUser',
  CLIENT: 'Client'
} as const;

export const UserRoles = {
  ORG_USER: 'OrgUser',
  CLIENT: 'Client'
} as const;
```

### 2. Update Type Definitions
**File:** `investa-admin-portal/src/types/index.ts`

**Changes Needed:**
- [ ] Review `User` interface - ensure it uses string for role (not hardcoded union)
- [ ] Remove any `ClientType` references
- [ ] Update JSDoc comments

### 3. User Management Components
**Files:** `investa-admin-portal/src/**/*user*.tsx`

**Changes Needed:**
- [ ] Replace hardcoded role strings with `UserTypes` constants
- [ ] Remove role selection dropdown (if exists) or limit to OrgUser/Client
- [ ] Update user creation forms

### 4. Mock Data
**File:** `investa-admin-portal/src/mocks/users.ts`

**Changes Needed:**
- [ ] Update mock users to use only `OrgUser` or `Client` roles
- [ ] Remove any `Admin`, `Investor`, `Founder`, `Partner` role strings

## Flutter Founder App - Manual Tasks

### 1. Registration Flow
**File:** `Flutter_Founder/lib/screens/register_screen.dart` (if exists)

**Changes Needed:**
- [ ] Remove `clientType` field from registration payload
- [ ] All registrations create `Client` type users
- [ ] Update UI to remove role selection

### 2. Authentication Service
**File:** `Flutter_Founder/lib/services/auth_service.dart`

**Changes Needed:**
- [ ] Review registration request model
- [ ] Remove `ClientType` references
- [ ] Ensure all mobile users are `Client` type

### 3. Profile Models
**Files:** `Flutter_Founder/lib/models/*.dart`

**Changes Needed:**
- [ ] Remove `userType`, `clientType` fields from models
- [ ] Update serialization/deserialization

## Flutter Partner App - Manual Tasks

Same as Flutter Founder app above. All changes should mirror the Founder app since both apps now use the same `Client` user type.

## Testing Checklist After Manual Changes

### Frontend Testing
- [ ] **Client Portal**
  - [ ] Login works without role selection
  - [ ] All users navigate to dashboard
  - [ ] No console errors about missing roles
  - [ ] Dashboard shows all features (no role-based hiding)
  
- [ ] **Admin Portal**
  - [ ] User management only shows OrgUser/Client types
  - [ ] User creation works with new types
  - [ ] No hardcoded role strings in UI
  
- [ ] **Flutter Apps**
  - [ ] Registration completes successfully
  - [ ] No ClientType in request payloads
  - [ ] Login and profile loading works

### Integration Testing
- [ ] Client portal user → creates Client in database
- [ ] Flutter app registration → creates Client in database
- [ ] Admin portal OrgUser creation → creates OrgUser in database
- [ ] JWT tokens contain correct role claim (`OrgUser` or `Client`)

## Quick Find & Replace Suggestions

### Angular/TypeScript
```bash
# Find hardcoded role strings
grep -r "'investor'" src/
grep -r "'founder'" src/
grep -r "'partner'" src/

# Find ClientType references
grep -r "ClientType" src/
grep -r "clientType" src/
```

### React/TypeScript
```bash
# Same as above in admin portal
cd investa-admin-portal
grep -r "'investor'" src/
grep -r "'admin'" src/ | grep -v "'/admin/" # exclude routes
```

### Flutter/Dart
```bash
# Find user type references
grep -r "userType" lib/
grep -r "clientType" lib/
grep -r "ClientType" lib/
```

## Estimated Effort

- **Client Portal:** 2-3 hours (remove role UI, simplify login/dashboard)
- **Admin Portal:** 1-2 hours (add constants, update user management)
- **Flutter Apps:** 1-2 hours each (remove clientType from registration)
- **Testing:** 2-3 hours (all platforms)

**Total:** 8-12 hours

## Notes

- ✅ Backend is complete and compiles successfully
- ✅ Database migration created and ready to run
- ✅ Constants added to client portal
- ⚠️ Frontend UI cleanup required (manual work)
- ⚠️ Template changes needed (role-based theming)

