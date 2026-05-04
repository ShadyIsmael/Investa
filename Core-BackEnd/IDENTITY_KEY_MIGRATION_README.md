# Identity Key Type Migration Guide

## Problem Overview

The Investa backend had a critical Identity model mismatch:
- **Code**: `ApplicationIdentityUser : IdentityUser<Guid>` expects Guid keys
- **Database**: AspNetUsers table uses `nvarchar(450)` (string) keys
- **Result**: `InvalidCastException: Unable to cast object of type 'System.String' to type 'System.Guid'` during authentication

## Root Cause

The initial EF migration (20260109131334_InitialCreate.cs) created AspNetUsers with string keys, but ApplicationDbContext is configured for Guid keys. This mismatch went undetected because:
1. Some legacy tools created users with `Guid.NewGuid().ToString()` (converting to string)
2. The defensive fallback in AuthController masked the issue temporarily

## Solution Implemented

### 1. Database Schema Migration

Created migration `20260504000000_FixIdentityKeyTypeToGuid.cs` that:
- Converts all Identity tables from string to Guid keys
- Deletes existing Identity data (cannot convert random strings to valid Guids)
- Updates AspNetUsers, AspNetRoles, and all related tables
- Recreates foreign key relationships with uniqueidentifier types

**⚠️ WARNING**: This migration will **delete all existing AspNetUsers and AspNetRoles**!

### 2. Model Snapshot Update

Fixed `ApplicationDbContextModelSnapshot.cs` to reflect:
- `Investa.Infrastructure.Identity.ApplicationIdentityUser` with Guid Id
- `Investa.Infrastructure.Identity.ApplicationIdentityRole` with Guid Id
- All Identity* tables using `<System.Guid>` generic parameters

### 3. Tool Updates

Updated data seeding tools to use Guid IDs:

**CreateAdminUserRunner/Program.cs**:
```csharp
// Before
var identityUserId = Guid.NewGuid().ToString();
var hasher = new PasswordHasher<IdentityUser>();

// After
var identityUserId = Guid.NewGuid();
var hasher = new PasswordHasher<ApplicationIdentityUser>();
```

**ReseedDatabase/Program.cs**:
```csharp
// Before
PasswordHasher<IdentityUser> hasher = new();
var identityId = Guid.NewGuid().ToString();

// After
PasswordHasher<ApplicationIdentityUser> hasher = new();
var identityId = Guid.NewGuid();
```

## Migration Steps

### Prerequisites
1. Backup your database before running the migration
2. Stop all running instances of Investa.API
3. Document any existing Identity users you need to recreate

### Execute Migration

```powershell
# Navigate to backend directory
cd D:\projects\Investa\gitInvesta\Core-BackEnd

# Apply the migration (will delete all AspNetUsers!)
dotnet ef database update --project Investa.Infrastructure --startup-project Investa.API
```

### Post-Migration

1. **Recreate Admin Users**:
   ```powershell
   cd Tools/CreateAdminUserRunner
   dotnet run
   ```

2. **Reseed Test Data** (development only):
   ```powershell
   cd Tools/ReseedDatabase
   dotnet run
   ```

3. **Restart API**:
   ```powershell
   cd Investa.API
   dotnet run
   ```

## Verification

Test authentication after migration:

1. **Email Login**:
   ```http
   POST /api/v1/auth/login-email
   Content-Type: application/json
   
   {
     "email": "admin@investa.com",
     "password": "P@ssw0rd"
   }
   ```

2. **Phone Login**:
   ```http
   POST /api/v1/auth/login
   Content-Type: application/json
   
   {
     "phone": "+20123456789",
     "password": "YourPassword"
   }
   ```

Both should return 200 OK with JWT token, not 500 with InvalidCastException.

## Impact on Other Applications

### investa-admin-portal (Angular)
- Frontend not affected - API contract remains unchanged
- May need to recreate admin users after migration

### investa-client-portal (Angular)
- Frontend not affected - API contract remains unchanged
- Users will need to re-register after migration

### Flutter_Founder, Flutter_Partner
- Mobile apps not affected - API contract unchanged
- Users will need to re-register after migration

## Rollback Plan

If issues arise, rollback the migration:

```powershell
# Remove the migration
cd D:\projects\Investa\gitInvesta\Core-BackEnd
dotnet ef migrations remove --project Investa.Infrastructure --startup-project Investa.API

# Or revert to previous migration
dotnet ef database update 20260210213643_AddContactCity_RemoveWorkAddress_Auto --project Investa.Infrastructure --startup-project Investa.API
```

**Note**: Rollback will also delete all Identity users created after the migration.

## Testing Checklist

- [ ] Backup database completed
- [ ] Migration applied successfully
- [ ] No EF migration errors in logs
- [ ] Admin user recreated
- [ ] Email login works (admin@investa.com)
- [ ] Phone login works (test user)
- [ ] JWT tokens generated correctly
- [ ] No InvalidCastException in logs
- [ ] AuthController fallback logic removed (optional cleanup)

## Technical Details

### Database Schema Changes

**Before** (string keys):
```sql
CREATE TABLE AspNetUsers (
    Id nvarchar(450) NOT NULL PRIMARY KEY,
    ...
)

CREATE TABLE AspNetRoles (
    Id nvarchar(450) NOT NULL PRIMARY KEY,
    ...
)
```

**After** (Guid keys):
```sql
CREATE TABLE AspNetUsers (
    Id uniqueidentifier NOT NULL PRIMARY KEY,
    ...
)

CREATE TABLE AspNetRoles (
    Id uniqueidentifier NOT NULL PRIMARY KEY,
    ...
)
```

### Code Model Alignment

All Identity code now consistently uses:
- `ApplicationIdentityUser : IdentityUser<Guid>`
- `ApplicationIdentityRole : IdentityRole<Guid>`
- `ApplicationDbContext : IdentityDbContext<ApplicationIdentityUser, ApplicationIdentityRole, Guid>`

### Foreign Key Cascade

The migration ensures proper cascade deletes:
- AspNetUserClaims → AspNetUsers (UserId)
- AspNetUserLogins → AspNetUsers (UserId)
- AspNetUserRoles → AspNetUsers (UserId)
- AspNetUserRoles → AspNetRoles (RoleId)
- AspNetUserTokens → AspNetUsers (UserId)
- AspNetRoleClaims → AspNetRoles (RoleId)

## Maintenance

After migration:
1. Remove defensive fallback code in AuthController (TryAuthenticateLegacyPhoneUserAsync)
2. Update any custom SQL scripts that reference AspNetUsers/AspNetRoles
3. Update documentation for new developers about Guid-based Identity

## Support

If issues occur during migration:
1. Check backend logs at `Core-BackEnd/Investa.API/Logs/`
2. Verify EF migrations history: `SELECT * FROM __EFMigrationsHistory`
3. Confirm no file locks on database or API binaries
4. Contact backend team for assistance
