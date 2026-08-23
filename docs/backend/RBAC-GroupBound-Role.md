# RBAC — Group-Bound Role Architecture (Summary)

Date: 2026-01-14
Created by: GitHub Copilot

## Overview ✅
Refactored RBAC to a Group-Bound Role model where Roles are explicit domain entities and each Role must belong to a Group. Users are assigned Roles (via `UserRoles`) and thereby implicitly associated with the Role's Group.

## High-level changes 🔧
- New domain entities:
  - `Role` (GUID Id, Name, NormalizedName, GroupId required, etc.)
  - `UserRole` (links UserId → RoleId)
  - `RolePermission` (links RoleId → PermissionId)
- Migration created: `AddGroupBoundRoleArchitecture`
- Database constraints: Role.GroupId is mandatory and FK -> Groups; unique Role name per Group.

## Token & Claims (JWT) ✨
- `JwtTokenService` updated to:
  - Resolve roles via `UserRoles → Roles → Group` (if present)
  - Add new claims: `group_id` (Group Id) and `group` (Group Name)
  - Add `role` claim containing the Role.Name from the new `Roles` table
  - Preserve wildcard permission `*.*` for the Admin role
  - Load permissions from both `GroupPermissions` and `RolePermissions` to build `permission` claims

## API Surface (Admin) 📡
- New controller: `RolesAdminController` (under `Investa.API.Controllers.Admin`)
  - `GET /api/v1/admin/groups/{groupId}/roles` — list roles for a group
  - `GET /api/v1/admin/roles` — list roles with group info
  - `GET /api/v1/admin/roles/{roleId}` — role detail
  - `POST /api/v1/admin/roles` — create role (payload requires `groupId`)
  - `POST /api/v1/admin/roles/{roleId}/permissions` — assign permissions to role

## User Profile
- `GET /api/v1/admin/users/myprofile` updated to return:
  - `RoleName` (role assigned via new `UserRoles`)
  - `GroupName` (the group owning that role)

## Backward Compatibility & Notes ⚠️
- ASP.NET Identity (`AspNetRoles`, `AspNetUserRoles`) left intact for backward compatibility.
- The new `Roles` table coexists with Identity roles; services and controllers were adjusted to prefer the new Group-Bound Role info where applicable.
- Authorization attributes (`[Authorize]`) and existing PermissionHandler logic were left functional; permissions are now resolved from both Group and Role assignments.

## Files Added / Modified (Highlights) 📁
- Added: `Investa.Domain/Entities/Security/Role.cs`
- Added: `Investa.Domain/Entities/Security/UserRole.cs`
- Added: `Investa.Domain/Entities/Security/RolePermission.cs`
- Modified: `ApplicationDbContext` — DbSets and model configuration
- Modified: `Investa.Application/Services/JwtTokenService.cs` — group_id + role claims and role-based permission resolution
- Added: `Investa.API/Controllers/Admin/RolesAdminController.cs`
- Modified: `Investa.API/Controllers/Admin/UsersAdminController.cs` (myprofile)
- Migration: `AddGroupBoundRoleArchitecture`

## How to apply & test ▶️
1. Apply migrations:
   dotnet ef database update --project Investa.Infrastructure --startup-project Investa.API --context ApplicationDbContext

2. Create roles (example):
   POST /api/v1/admin/roles
   {
     "name": "Admin",
     "description": "Full system administrator",
     "groupId": 1000
   }

3. Assign a user to a role (DB example):
   INSERT INTO UserRoles (Id, UserId, RoleId, AssignedAt)
   VALUES (1, 'USER-GUID', 'ROLE-GUID', GETUTCDATE());

4. Login as assigned user and verify the JWT contains `role`, `group_id`, and `permission` claims.

## Next steps / Recommendations 💡
- Add integration tests for permission resolution: Group-only, Role-only, Role+Group, Wildcard Admin
- Consider a small migration/seed to create `Admin` role under `Org_Admin` group and assign the existing admin user
- (Optional) Add UI/export to keep frontend permissions in sync (TypeScript constants)

---
If you'd like, I can commit this file and create a small seed script to create an `Admin` role and link your existing admin user to it. Want me to proceed?