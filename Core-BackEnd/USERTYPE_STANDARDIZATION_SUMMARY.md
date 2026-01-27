# UserType Enum Standardization - Summary

## Overview
Standardized the `UserType` enum to only contain three valid types:
- **OrgUser** (0) - Internal organization users (employees, admins, staff)
- **Founder** (1) - Business founders/owners who create investment opportunities  
- **Partner** (2) - External partner users

## Changes Made

### 1. Enum Definition Updated
**File:** `Core-BackEnd/Investa.Domain/Entities/Enums/UserType.cs`

**Before:**
```csharp
public enum UserType
{
    Client = 0,
    Investor = 0,  // Duplicate value - REMOVED
    OrgUser = 1,
    Founder = 2
}
```

**After:**
```csharp
public enum UserType
{
    OrgUser = 0,
    Founder = 1,
    Partner = 2
}
```

### 2. Default Value Updated
**File:** `Core-BackEnd/Investa.Domain/Entities/AuthUser.cs`
- Changed default from `UserType.Investor` to `UserType.Founder`

### 3. Controller Logic Updated
**File:** `Core-BackEnd/Investa.API/Controllers/AuthController.cs`
- Registration endpoint: Changed `UserType.Investor` → `UserType.Founder`
- Legacy signup endpoint: Changed `UserType.Investor` → `UserType.Founder`

### 4. JWT Token Service Updated
**Files:** `Core-BackEnd/Investa.Application/Services/JwtTokenService.cs`

**Changes:**
- Removed mapping to `UserType.Investor`
- Added explicit handling for `UserType.Founder` and `UserType.Partner`
- Updated fallback token creation from `UserType.Investor` → `UserType.Founder`

**New Logic:**
```csharp
if (authUser.UserType == UserType.OrgUser) { ... }
else if (authUser.UserType == UserType.Founder) { 
    roleClaimValue = UserRoles.Client.ToString();
    userTypeValue = UserType.Founder.ToString();
}
else if (authUser.UserType == UserType.Partner) { 
    roleClaimValue = UserRoles.Client.ToString();
    userTypeValue = UserType.Partner.ToString();
}
```

### 5. Database Scripts Updated

**File:** `Core-BackEnd/scripts/seed_rbac_permissions.sql`
- Updated comments to reflect new enum values
- Changed user-to-group assignment logic:
  - `UserType = 0` → OrgUser → Employees group
  - `UserType = 1` → Founder → Clients group
  - `UserType = 2` → Partner → Clients group

**File:** `Core-BackEnd/scripts/standardize_roles_postgres.sql`
- Marked as deprecated
- Added migration notes pointing to new migration

### 6. Database Migration Created
**File:** `Core-BackEnd/Investa.Infrastructure/Migrations/20260123000000_StandardizeUserTypes.cs`

**Migration Logic:**
1. Converts any 'Client' or 'Investor' string values to 'Founder'
2. Remaps numeric enum values:
   - Old 0 (Client/Investor) → New 1 (Founder)
   - Old 1 (OrgUser) → New 0 (OrgUser)
   - Old 2 (Founder) → New 1 (Founder)

## Important Notes

### ClientType vs UserType
- `ClientType` enum (separate from `UserType`) remains unchanged:
  - Investor = 0
  - Founder = 1
  - Both = 2
- `ClientType` is used for **classification** purposes only (informational)
- `UserType` is used for **authentication and authorization**

### Partner Entity
- `Partner.cs` exists as a database entity (for business partners/vendors)
- `UserType.Partner` (value 2) is now available for partner user accounts
- These are separate concepts but can be linked in future development

### Database Compatibility
- The migration handles both string-based and numeric enum storage
- Uses temporary column to avoid conflicts during numeric remapping
- Safe to run on existing databases with legacy data

## Verification

### Build Status
✅ Backend build succeeded with 0 errors (4 warnings unrelated to UserType changes)

### Code Search Results
✅ No remaining references to `UserType.Investor` or `UserType.Client` in C# code

### Test Files
✅ Test files already using `UserType.OrgUser` - no changes needed

## Migration Steps

1. **Review the migration file** before applying to production
2. **Backup database** before running migration
3. **Test on development/staging** environment first
4. **Apply migration:**
   ```bash
   cd Core-BackEnd/Investa.API
   dotnet ef database update
   ```

5. **Verify data after migration:**
   ```sql
   SELECT "UserType", COUNT(*) 
   FROM "AuthUsers" 
   GROUP BY "UserType" 
   ORDER BY "UserType";
   ```
   
   Expected results:
   - `0` or `OrgUser` - Internal users
   - `1` or `Founder` - Business founders
   - `2` or `Partner` - External partners (if any exist)

## Future Considerations

1. Consider updating frontend TypeScript/Angular code if it references user types
2. Update API documentation to reflect the three user types
3. Implement Partner user registration workflow if needed
4. Review authorization policies to ensure Partner users have appropriate permissions
