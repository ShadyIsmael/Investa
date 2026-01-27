-- ===================================================
-- UserType Verification Script
-- Purpose: Verify UserType values after standardization
-- ===================================================

-- Display current UserType distribution
SELECT 
    "UserType",
    COUNT(*) AS UserCount,
    CASE 
        WHEN "UserType" = '0' OR "UserType" = 'OrgUser' THEN 'OrgUser (Internal Users)'
        WHEN "UserType" = '1' OR "UserType" = 'Founder' THEN 'Founder (Business Owners)'
        WHEN "UserType" = '2' OR "UserType" = 'Partner' THEN 'Partner (External Partners)'
        ELSE 'UNKNOWN - NEEDS MIGRATION'
    END AS TypeDescription
FROM "AuthUsers"
GROUP BY "UserType"
ORDER BY "UserType";

-- Check for any invalid UserType values (should return 0 rows)
SELECT 
    "Id",
    "Email",
    "UserType",
    'INVALID - Should be migrated' AS Issue
FROM "AuthUsers"
WHERE "UserType" NOT IN ('0', '1', '2', 'OrgUser', 'Founder', 'Partner')
ORDER BY "UserType";

-- Display user-group assignments by UserType
SELECT 
    au."UserType",
    g."Name" AS GroupName,
    COUNT(*) AS UserCount
FROM "AuthUsers" au
JOIN "UserGroups" ug ON au."Id" = ug."UserId"
JOIN "Groups" g ON ug."GroupId" = g."Id"
GROUP BY au."UserType", g."Name"
ORDER BY au."UserType", g."Name";

-- Sample users by type (first 5 of each type)
WITH RankedUsers AS (
    SELECT 
        "Id",
        "Email",
        "UserType",
        "Status",
        "CreatedAt",
        ROW_NUMBER() OVER (PARTITION BY "UserType" ORDER BY "CreatedAt" DESC) AS rn
    FROM "AuthUsers"
)
SELECT 
    "UserType",
    "Email",
    "Status",
    "CreatedAt"
FROM RankedUsers
WHERE rn <= 5
ORDER BY "UserType", rn;
