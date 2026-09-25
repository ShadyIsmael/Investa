# Business Data Reset

**Purpose:** Safely delete all Project/investment business data and return the system to a clean baseline for Development/UAT environments.

## Safety Features

- **Environment Guard:** Requires an explicit Development or UAT environment and refuses every other environment
- **Explicit Confirmation:** Requires typing `RESET BUSINESS DATA` before executing (unless `--yes` is used)
- **Dry-Run Mode:** Preview what will be deleted without making changes
- **Idempotent:** Can be run multiple times safely
- **Transaction Safety:** Discovers the live SQL Server FK graph, breaks only nullable business-to-business cycles, and deletes inside one transaction
- **Detailed Reporting:** Before/after counts for all affected tables

## What Gets Deleted

All business/transactional data related to:
- Projects
- Opportunities
- Offers and OfferVersions
- OfferLegs
- Participations and ParticipationLegs
- Contracts and contract versions/execution records
- Opportunity Room data/access
- Conversations/negotiation data related to Projects/Opportunities
- Requests related to these flows
- Payments/cash flows/obligations linked to Participations
- Project/Opportunity media, documents, updates and related business records
- Favorites/follows or other user-to-project/opportunity business relations
- Notifications/audit business records that reference deleted business aggregates

## What Gets Preserved

Never deleted/reset:
- Users/accounts (AspNetUsers, AuthUsers, UserProfiles)
- Roles and permissions (RBAC system)
- User-role assignments
- Currencies and exchange rate snapshots
- Categories/lookups/reference data (Lookups, BusinessCategories, FundingGoals, etc.)
- System configuration (Employees, Clients, ClientBusinessCategories)
- Authentication/security configuration (UserSessions, RefreshTokens, DeviceTokens)
- Notification templates
- Credit configurations and pricing rules
- Support sessions

## Build

```bash
dotnet build Core-BackEnd/Investa.sln
```

## Business Data Reset

From repo root, use the permanent runner with an explicit non-production environment:

```bash
dotnet run --project Core-BackEnd/Tools/ResetBusinessDataRunner -- --environment Development
```

The runner asks for `RESET BUSINESS DATA` before changing rows. For unattended Development/UAT runs, add `--yes`. Production is refused even when `--yes` is supplied.

## Run (dry-run)

```bash
dotnet run --project Core-BackEnd/Tools/ResetBusinessDataRunner -- --environment Development --dry-run
```

## Flags

- `--dry-run` : Prints SQL and skips deletes (preview mode)
- `--yes` / `--confirm` : Skips the interactive confirmation prompt; it does not bypass the environment guard
- `--environment <Development|UAT>` : Selects the configured application environment; every other environment is rejected

## Report Output

Writes detailed JSON report to:
- `Core-BackEnd/Tools/ResetBusinessDataRunner/bin/<Configuration>/<TFM>/reset-business-data-report.json`

Report includes:
- Environment and execution metadata
- Before/after counts for each table
- Total rows deleted
- List of any remaining tables with data

## Tests

Unit tests are located in:
- `Core-BackEnd/Investa.Tests/Investa.UnitTests/ResetBusinessDataRunnerTests.cs`

Tests verify:
- Business data is removed
- Users remain intact
- Roles/permissions remain intact
- Currencies/lookups/reference data remain
- Second reset succeeds (idempotency)
- No orphan business records remain

The database proof test uses an explicitly isolated database supplied through `INVESTA_RESET_TEST_CONNECTION`; it is skipped unless that variable is set.

Run tests:
```bash
dotnet test Core-BackEnd/Investa.Tests/Investa.UnitTests/Investa.UnitTests.csproj --filter "FullyQualifiedName~ResetBusinessDataRunnerTests"
```

