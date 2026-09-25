# BE-068 — Implementation Summary: Group-Bound RBAC

**Date:** January 14, 2026
**Author:** Automated change set

## Goal
Implement a hierarchical Group-bound RBAC where Roles are subsets of Groups and Users are assigned to Group-Role pairs (User Story: BE-068).

## What I changed (high level)
- Added Group-bound types and fields:
  - `User`: added `groupId`, `roleId`, `groupName`, `roleName` (kept legacy `role` for compatibility)
  - `Role`: added `groupId`, `groupName` (null `groupId` = SuperAdmin)
- Implemented dependent dropdowns in user onboarding:
  - `components/UserOnboarding.tsx` — searchable Group selector; Role selector disabled until Group selected; calls `GET /api/v1/admin/groups/{groupId}/roles` and falls back to client filtering
- Role management improvements:
  - `components/GroupsRoles.tsx` — Group selector on Role modal (required), Group column in Roles table, Group filtering and search
- User list updates:
  - `components/UsersList.tsx` — displays `groupName` and `roleName` badges; fallback to legacy `role`
- Service updates and seed data:
  - `services/groupService.ts` — new `getRolesByGroup()` and seed data updated with group-bound roles
  - `services/userService.ts` — create/update user supports group/role fields
- Documentation:
  - `GROUP_RBAC_GUIDE.md` (detailed guide)
  - Updated `PERMISSIONS.md` with Group-bound section
  - `BE-068_SUMMARY.md` (this file)

## Permissions & Auth
- `src/context/AuthContext.tsx` already supports extracting `permission`/`permissions` and recognizes both `*` and `*.*` wildcards; it also falls back to granting `*` for admin/super roles when needed. Ensure backend JWT provides `groupId`, `roleId`, and `permission` claims.

## Backward compatibility
- Legacy `role` property preserved for users without group/role assignment.
- UI prefers `groupName`/`roleName` when available.

## Testing checklist (manual)
- [ ] Create a new user and verify the two-step onboarding flow (Group → Role)
- [ ] Create a role and verify it requires a Group or can be SuperAdmin
- [ ] Verify `GET /api/v1/admin/groups/{groupId}/roles` populates Role dropdown (or fallback applies)
- [ ] Log a token and confirm `permission` or `permissions` claim exists and contains expected values
- [ ] Confirm sidebar and route guards respect the new permission extraction shape

## Next steps (recommended)
1. Backend: include `groupId`, `roleId`, and `permission` claims in JWTs and implement the group roles endpoint.
2. QA: run through the testing checklist and report any edge cases.
3. Migration: plan data migration to populate existing users with `groupId`/`roleId` values.


---

If you want this summary placed somewhere else (different file name or folder), tell me where and I will move it.