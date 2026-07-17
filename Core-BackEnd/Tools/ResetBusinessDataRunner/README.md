# ResetBusinessDataRunner

Resets **all non-auth / non-reference business state** in the Investa dev/test database while preserving:
- Users/auth (Identity + domain AuthUsers, UserProfiles, sessions/tokens)
- RBAC: Roles/Groups/Permissions and assignments
- Admin reference data (Lookups, BusinessCategories, FundingGoals, etc.)

It also optionally cleans FileStore folders that are known to be related to opportunities.

## Build

```bash
dotnet build Core-BackEnd/Investa.sln
```

## Run (execute)

From repo root:

```bash
dotnet run --project Core-BackEnd/Tools/ResetBusinessDataRunner/ResetBusinessDataRunner.csproj -- --clean-filestore
```

## Run (dry-run)

```bash
dotnet run --project Core-BackEnd/Tools/ResetBusinessDataRunner/ResetBusinessDataRunner.csproj -- --dry-run
```

## Flags

- `--dry-run` : prints SQL / skips deletes
- `--clean-filestore` : deletes FileStore filesystem folders under `InvestaFileStore/Storage` that match opportunity/upload patterns
- `--min-age-days <n>` : reserved safety gate (not enforced by default)

## Report output

Writes:
- `Core-BackEnd/Tools/ResetBusinessDataRunner/bin/<Configuration>/<TFM>/reset-business-data-report.json`
- (also prints the report path to console)

