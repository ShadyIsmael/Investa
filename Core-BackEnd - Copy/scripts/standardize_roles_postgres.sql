-- Standardize non-client roles to 'OrgUser' in PostgreSQL
-- Target: DefaultConnection from Investa.API/appsettings.json
-- Safety: Run on Dev/Staging first; backup before prod.

BEGIN;

-- Normalize management user type
UPDATE "AuthUsers"
SET "UserType" = 'OrgUser'
WHERE "UserType" IS NULL OR "UserType" <> 'Client';

-- Normalize application role
UPDATE "ApplicationUsers"
SET "Role" = 'OrgUser'
WHERE "Role" IS NULL OR "Role" <> 'Client';

COMMIT;

-- Verification: distribution after update
SELECT "UserType", COUNT(*) AS count
FROM "AuthUsers"
GROUP BY "UserType"
ORDER BY "UserType";

SELECT "Role", COUNT(*) AS count
FROM "ApplicationUsers"
GROUP BY "Role"
ORDER BY "Role";

-- Optional: preview before running updates (comment out BEGIN...COMMIT and the UPDATEs, enable these)
-- SELECT DISTINCT "UserType" FROM "AuthUsers";
-- SELECT DISTINCT "Role" FROM "ApplicationUsers";
