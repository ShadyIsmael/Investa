-- Standardize UserType values in PostgreSQL
-- Target: DefaultConnection from Investa.API/appsettings.json
-- Safety: Run on Dev/Staging first; backup before prod.
-- Note: UserType enum values: 0=OrgUser, 1=Founder, 2=Partner

BEGIN;

-- This script is deprecated. UserType values should be:
--   OrgUser = 0 (internal organization users)
--   Founder = 1 (business founders/owners)
--   Partner = 2 (external partners)
-- 
-- All existing 'Client' or 'Investor' values should be migrated to 'Founder' (1)
-- See migration script: AddUserTypeStandardization.cs

COMMIT;

-- Verification: distribution after update
SELECT "UserType", COUNT(*) AS count
FROM "AuthUsers"
GROUP BY "UserType"
ORDER BY "UserType";
