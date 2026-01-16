# Security Refactoring Plan - Enterprise RBAC Implementation

## Overview
Comprehensive refactoring from hard-coded role checks to granular permission-based authorization with enterprise-grade features.

## Phase 1: Cleanup (Completed)
- [x] Identified 16 hard-coded `[Authorize(Roles = "...")]` attributes
- [x] Mapped existing Group/Permission entities
- [x] Identified legacy UserType enum for removal

## Phase 2: Domain Model Extensions

### New Entities
1. **ApplicationPermission** (enhanced Permission)
   - ResourceType (e.g., Client, Investment, Report)
   - Action (Read, Write, Delete, Execute)
   - Scope (Organization, Department, User)
   
2. **UserSession** (for token management)
   - DeviceFingerprint, IP, Location
   - RefreshToken with expiration
   
3. **AuditLog** (compliance tracking)
   - EntityType, EntityId, Action, Changes (JSON)
   - UserId, Timestamp, IP

### Modified Entities
1. **AuthUser**
   - Add: `DefaultGroupId` (nullable int FK to Group)
   - Add: `TenantId` (for multi-tenancy)
   - Remove: `UserType` enum (after migration)
   
2. **Group**
   - Add: `TenantId`, `IsSystemGroup`, `ParentGroupId`
   
3. **Permission**
   - Add: `ResourceType`, `Action`, `Scope`, `ParentPermissionId`

## Phase 3: Authorization Infrastructure

### Custom Authorization Components
1. **PermissionAuthorizationHandler** : IAuthorizationHandler
2. **PermissionRequirement** : IAuthorizationRequirement
3. **PermissionPolicyProvider** : IAuthorizationPolicyProvider

### JWT Token Enhancement
- Embed permissions as claims: `permission:clients.read`, `permission:reports.execute`
- Add group names: `group:Administrators`
- Include tenant context: `tenant_id:xxx`

## Phase 4: Migration Strategy
1. Backup existing Users table
2. Create new security tables (AuditLog, UserSession)
3. Migrate UserType → Group assignments
4. Populate default permissions
5. Update all controllers to use `[Authorize(Policy = "RequirePermission")]`

## Phase 5: Testing & Validation
- Unit tests for PermissionAuthorizationHandler
- Integration tests for JWT token generation
- Load tests for permission caching
- Security audit of all endpoints

## Rollback Plan
- Keep UserType column with deprecated flag
- Maintain dual authorization (old + new) during transition
- Feature flags for gradual rollout
