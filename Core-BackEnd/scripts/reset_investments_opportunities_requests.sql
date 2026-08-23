-- WARNING: Destructive — deletes ALL investments, opportunities, and requests data for all users.
-- Review before running. Uses schema/table names as defined in EF model.

BEGIN;

-- Reset investment-related data
TRUNCATE TABLE
    "InvestmentParticipants",
    "InvestmentTeamMembers",
    "InvestmentImages",
    "InvestmentRequests",
    "InvestmentEvents",
    "InvestmentContracts",
    "InvestmentFavorites",
    "InvestmentLearnMore",
    "InvestmentViews",
    "InvestmentReviews",
    "InvestmentUsers",
    "Investments"
RESTART IDENTITY CASCADE;

-- Reset opportunity-related data
TRUNCATE TABLE
    "OpportunityMedia",
    "OpportunityDocuments",
    "OpportunityEvents",
    "OpportunityJoinRequests",
    "OpportunityTagAssignment",
    "Opportunities"
RESTART IDENTITY CASCADE;

-- Reset project-related data
TRUNCATE TABLE
    "ProjectRoomEntry",
    "ProjectRoomDocument",
    "Projects"
RESTART IDENTITY CASCADE;

-- Reset junction tables
TRUNCATE TABLE
    "InvestmentOpportunity"
RESTART IDENTITY CASCADE;

COMMIT;

-- NOTE:
-- 1) This targets PostgreSQL (DefaultConnection in appsettings.json). Adjust quoting/names for other DBs.
-- 2) If your DB has different table names or casing, update them accordingly.
-- 3) To run locally using psql (Windows PowerShell):
--    psql "Host=localhost;Port=5432;Database=InvestaDb;Username=investa_user;Password=ChangeMe" -f scripts/reset_investments_opportunities_requests.sql
-- 4) I will NOT execute this until you confirm (type: CONFIRM).
