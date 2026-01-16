-- WARNING: Destructive — deletes ALL clients and users and related user data.
-- Review before running. Uses schema/table names as defined in EF model.

BEGIN;

-- Remove user-related data while preserving lookup/seed tables.
TRUNCATE TABLE
    "ClientBusinessCategories",
    "CreditTransactions",
    "InvestmentUsers",
    "Investments",
    "InvestmentReviews",
    "Transactions",
    "ScoreTransactions",
    "UserProfiles",
    "Clients",
    "AuthUsers",
    "Employees",
    "RefreshTokens",
    "ApplicationUsers",
    "AspNetUserTokens",
    "AspNetUserRoles",
    "AspNetUserLogins",
    "AspNetUserClaims",
    "AspNetUsers"
RESTART IDENTITY CASCADE;

COMMIT;

-- NOTE:
-- 1) This targets PostgreSQL (DefaultConnection in appsettings.json). Adjust quoting/names for other DBs.
-- 2) If your DB has different table names or casing, update them accordingly.
-- 3) To run locally using psql (Windows PowerShell):
--    psql "Host=localhost;Port=5432;Database=InvestaDb;Username=investa_user;Password=ChangeMe" -f scripts/delete_all_clients_and_users.sql
-- 4) I will NOT execute this until you confirm (type: CONFIRM).
