-- ===================================================
-- Enterprise RBAC Data Seed Script
-- Purpose: Seed default ApplicationPermissions and map Groups to Permissions
-- ===================================================

-- Seed default ApplicationPermissions with resource-action model
SET IDENTITY_INSERT ApplicationPermissions ON;

INSERT INTO ApplicationPermissions (Id, [Key], Name, ResourceType, [Action], Scope, IsActive, CreatedAt)
VALUES
-- Client Management
(1, 'clients.read', 'View Clients', 'Client', 'Read', 1, 1, GETUTCDATE()),
(2, 'clients.write', 'Create/Edit Clients', 'Client', 'Write', 1, 1, GETUTCDATE()),
(3, 'clients.delete', 'Delete Clients', 'Client', 'Delete', 1, 1, GETUTCDATE()),
(4, 'clients.*', 'Full Client Access', 'Client', 'All', 1, 1, GETUTCDATE()),

-- Investment Management
(5, 'investments.read', 'View Investments', 'Investment', 'Read', 1, 1, GETUTCDATE()),
(6, 'investments.write', 'Create/Edit Investments', 'Investment', 'Write', 1, 1, GETUTCDATE()),
(7, 'investments.delete', 'Delete Investments', 'Investment', 'Delete', 1, 1, GETUTCDATE()),
(8, 'investments.*', 'Full Investment Access', 'Investment', 'All', 1, 1, GETUTCDATE()),

-- Credits Management
(9, 'credits.read', 'View Credits', 'Credit', 'Read', 1, 1, GETUTCDATE()),
(10, 'credits.write', 'Manage Credits', 'Credit', 'Write', 1, 1, GETUTCDATE()),
(11, 'credits.execute', 'Execute Credit Operations', 'Credit', 'Execute', 1, 1, GETUTCDATE()),
(12, 'credits.*', 'Full Credits Access', 'Credit', 'All', 1, 1, GETUTCDATE()),

-- Lookups Management
(13, 'lookups.read', 'View Lookups', 'Lookup', 'Read', 1, 1, GETUTCDATE()),
(14, 'lookups.write', 'Manage Lookups', 'Lookup', 'Write', 1, 1, GETUTCDATE()),

-- Admin Tools
(15, 'admin.*', 'Full Admin Access', 'Admin', 'All', 1, 1, GETUTCDATE()),
(16, 'admin.users.manage', 'Manage Users', 'Admin', 'Write', 1, 1, GETUTCDATE()),
(17, 'admin.groups.manage', 'Manage Groups', 'Admin', 'Write', 1, 1, GETUTCDATE()),
(18, 'admin.permissions.manage', 'Manage Permissions', 'Admin', 'Write', 1, 1, GETUTCDATE()),
(19, 'admin.audits.read', 'View Audit Logs', 'Admin', 'Read', 1, 1, GETUTCDATE()),

-- Super Admin
(20, '*.*', 'Super Admin', 'All', 'All', 1, 1, GETUTCDATE());

SET IDENTITY_INSERT ApplicationPermissions OFF;

-- ===================================================
-- Map UserType enum values to Groups
-- ===================================================

-- Create default groups if they don't exist
IF NOT EXISTS (SELECT 1 FROM Groups WHERE Id = 1)
BEGIN
    SET IDENTITY_INSERT Groups ON;
    INSERT INTO Groups (Id, Name, Description, IsActive, CreatedAt)
    VALUES (1, 'Clients', 'Default group for client users', 1, GETUTCDATE());
    SET IDENTITY_INSERT Groups OFF;
END

IF NOT EXISTS (SELECT 1 FROM Groups WHERE Id = 2)
BEGIN
    SET IDENTITY_INSERT Groups ON;
    INSERT INTO Groups (Id, Name, Description, IsActive, CreatedAt)
    VALUES (2, 'Employees', 'Default group for employee users', 1, GETUTCDATE());
    SET IDENTITY_INSERT Groups OFF;
END

IF NOT EXISTS (SELECT 1 FROM Groups WHERE Id = 3)
BEGIN
    SET IDENTITY_INSERT Groups ON;
    INSERT INTO Groups (Id, Name, Description, IsActive, CreatedAt)
    VALUES (3, 'Administrators', 'System administrators with full access', 1, GETUTCDATE());
    SET IDENTITY_INSERT Groups OFF;
END

-- ===================================================
-- Assign ApplicationPermissions to Groups
-- ===================================================

-- Clients Group: Read-only access to their own data
SET IDENTITY_INSERT GroupPermissions ON;

INSERT INTO GroupPermissions (Id, GroupId, PermissionId, AssignedAt)
VALUES
(100, 1, 1, GETUTCDATE()),  -- clients.read
(101, 1, 5, GETUTCDATE()),  -- investments.read
(102, 1, 9, GETUTCDATE());  -- credits.read

-- Employees Group: Read/Write for clients and investments
INSERT INTO GroupPermissions (Id, GroupId, PermissionId, AssignedAt)
VALUES
(200, 2, 1, GETUTCDATE()),  -- clients.read
(201, 2, 2, GETUTCDATE()),  -- clients.write
(202, 2, 5, GETUTCDATE()),  -- investments.read
(203, 2, 6, GETUTCDATE()),  -- investments.write
(204, 2, 9, GETUTCDATE()),  -- credits.read
(205, 2, 10, GETUTCDATE()); -- credits.write

-- Administrators Group: Full access
INSERT INTO GroupPermissions (Id, GroupId, PermissionId, AssignedAt)
VALUES
(300, 3, 20, GETUTCDATE()); -- *.* (super admin)

SET IDENTITY_INSERT GroupPermissions OFF;

-- ===================================================
-- Auto-assign existing users to groups based on UserType
-- ===================================================
-- Note: UserType enum values are:
--   0 = OrgUser (internal organization users)
--   1 = Founder (business founders/owners)
--   2 = Partner (external partners)

-- Assign all OrgUser to Employees/Administrators group
-- (OrgUsers should be manually assigned to appropriate groups based on their role)
INSERT INTO UserGroups (GroupId, UserId, AssignedAt)
SELECT 2, au.Id, GETUTCDATE()
FROM AuthUsers au
WHERE au.UserType = 0 -- OrgUser = 0
  AND NOT EXISTS (SELECT 1 FROM UserGroups ug WHERE ug.UserId = au.Id AND ug.GroupId = 2);

-- Assign all Founder users to Clients group
INSERT INTO UserGroups (GroupId, UserId, AssignedAt)
SELECT 1, au.Id, GETUTCDATE()
FROM AuthUsers au
WHERE au.UserType = 1 -- Founder = 1
  AND NOT EXISTS (SELECT 1 FROM UserGroups ug WHERE ug.UserId = au.Id AND ug.GroupId = 1);

-- Assign all Partner users to Clients group
INSERT INTO UserGroups (GroupId, UserId, AssignedAt)
SELECT 1, au.Id, GETUTCDATE()
FROM AuthUsers au
WHERE au.UserType = 2 -- Partner = 2
  AND NOT EXISTS (SELECT 1 FROM UserGroups ug WHERE ug.UserId = au.Id AND ug.GroupId = 1);

-- Optionally, assign specific users to Administrators group
-- UPDATE: Manually assign administrator users
-- Example:
-- INSERT INTO UserGroups (GroupId, UserId, AssignedAt)
-- VALUES (3, '<ADMIN_USER_GUID>', GETUTCDATE());

-- ===================================================
-- Verification Queries
-- ===================================================

-- Check permissions
SELECT * FROM ApplicationPermissions ORDER BY Id;

-- Check group-permission mappings
SELECT g.Name AS GroupName, ap.Key AS PermissionKey, ap.Name AS PermissionName
FROM GroupPermissions gp
JOIN Groups g ON gp.GroupId = g.Id
JOIN ApplicationPermissions ap ON gp.PermissionId = ap.Id
ORDER BY g.Name, ap.Key;

-- Check user-group assignments
SELECT u.Email, g.Name AS GroupName, ug.AssignedAt
FROM UserGroups ug
JOIN AuthUsers u ON ug.UserId = u.Id
JOIN Groups g ON ug.GroupId = g.Id
ORDER BY u.Email, g.Name;

-- Check user effective permissions
SELECT DISTINCT u.Email, ap.Key AS Permission
FROM UserGroups ug
JOIN AuthUsers u ON ug.UserId = u.Id
JOIN GroupPermissions gp ON ug.GroupId = gp.GroupId
JOIN ApplicationPermissions ap ON gp.PermissionId = ap.Id
ORDER BY u.Email, ap.Key;
