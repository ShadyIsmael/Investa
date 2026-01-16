-- Migration: AddAuthUserIdToUserRoleAndGroupMetadata (idempotent script)
-- Generated: 2026-01-15
-- NOTE: Review and run on target database (Development/Production) with backups in place.

BEGIN TRANSACTION;

-- Add column AuthUserId to UserRoles if not exists
IF NOT EXISTS (
    SELECT 1 FROM sys.columns
    WHERE Name = N'AuthUserId' AND Object_ID = Object_ID(N'dbo.UserRoles')
)
BEGIN
    ALTER TABLE dbo.UserRoles ADD AuthUserId UNIQUEIDENTIFIER NULL;
END

-- Add column MetadataJson to Groups if not exists
IF NOT EXISTS (
    SELECT 1 FROM sys.columns
    WHERE Name = N'MetadataJson' AND Object_ID = Object_ID(N'dbo.Groups')
)
BEGIN
    ALTER TABLE dbo.Groups ADD MetadataJson NVARCHAR(MAX) NULL;
END

-- Backfill AuthUserId from AuthUsers where UserId matches AuthUser.Id and AuthUserId is NULL
UPDATE ur
SET AuthUserId = u.Id
FROM dbo.UserRoles ur
INNER JOIN dbo.AuthUsers u ON ur.UserId = u.Id
WHERE ur.AuthUserId IS NULL;

COMMIT TRANSACTION;

-- Optional: Validate the changes
SELECT TOP 10 * FROM dbo.UserRoles WHERE AuthUserId IS NOT NULL;
SELECT TOP 10 * FROM dbo.Groups WHERE MetadataJson IS NOT NULL;