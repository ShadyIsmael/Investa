# Dev Identity Reseed Report (repair-only)

## Existing seed state found
- Current codebase already had development-only admin seeding logic in `Core-BackEnd/Investa.API/Program.cs`.
- That logic could create users and/or update password hashes, which is incompatible with the requirement.
- No existing safe repair-only mechanism for Identity roles (Admin/OrgUser/Founder/Investor) was present.

## Files modified
1. `Core-BackEnd/Investa.API/Program.cs`
   - Replaced the old dev admin seeding block with a call to the new repair-only service.
   - Registered `DevIdentityReseedService` via `builder.Services.AddDevIdentityReseed()`.

2. `Core-BackEnd/Investa.Infrastructure/Seed/DevIdentityReseedService.cs` (new)
   - Implements idempotent repair-only reseed:
     - ensures Identity roles exist (Admin, OrgUser, Founder, Investor)
     - repairs role mapping for existing `admin@investa.com` (adds Admin role if missing only)
     - does not create users, does not change passwords, does not delete roles/users.
   - Logs concise summary fields.

3. `Core-BackEnd/Investa.Infrastructure/Seed/ServiceCollectionExtensions.cs`
   - Added `AddDevIdentityReseed()` registration.

## Roles verified/created
- Implemented to create missing roles:
  - RolesCreated = number of roles created if missing
  - RolesVerified = number of roles already existed

## Users repaired
- Repairs only:
  - existing Identity user for `admin@investa.com`
  - adds it to `Admin` role if missing

## Startup log output (expected)
The reseed prints a single line summary:
- RolesCreated=X
- RolesVerified=Y
- UsersRepaired=Z
- UsersAlreadyValid=W

## JWT claims after reseed
- Expected: `role = Admin` present in JWT for `admin@investa.com` (when login succeeds).

## Endpoint validation results (to be run)
After reseed:
1. `POST /api/v1/Auth/login-email` => decode JWT, verify role=Admin
2. `GET /api/v1/pricing` => 200
3. `GET /api/v1/reputation/rules?includeDisabled=true` => 200
4. `GET /api/v1/notifications` => 200

## Build result
- `dotnet build Core-BackEnd/Investa.sln -c Debug` => Build succeeded.

## Final confirmation that Admin Portal works
- Expected: Admin Portal stops returning 403 because JWT now contains `role=Admin`.

