# CENTRAL ADMIN — TASK 08 OPPORTUNITY PERMISSION MIGRATION REPORT

## A Previous Reviewer behavior

Before this closure, `PermissionAuthorizationHandler` treated the `Reviewer` role name as an authorization grant for every FOPX Opportunity permission. A Reviewer without explicit permissions therefore received View, Review, and Manage access, including funding-status transitions.

The repository contains legacy Reviewer role checks in other modules, but no authoritative Reviewer role seed. The Opportunity administration controller itself is now permission-policy based.

## B Target Reviewer behavior

Reviewer is no longer an authorization shortcut. A Reviewer receives only the permissions assigned through the existing RBAC role/group or permission-claim mechanisms.

The startup migration assigns canonical View and Review to active roles named Reviewer and removes only the legacy `Opportunity.Manage` assignment from those roles. Canonical `FOPX.Opportunities.Manage` remains effective if it is explicitly assigned.

## C Canonical permissions

The canonical permission keys are:

- `FOPX.Opportunities.View`
- `FOPX.Opportunities.Review`
- `FOPX.Opportunities.Manage`

They remain centralized in `SystemPermissions` and are created idempotently by the existing startup backfill infrastructure.

## D Legacy permission aliases retained

The compatibility map remains in `PermissionAuthorizationHandler`:

- `Opportunity.View` satisfies canonical View.
- `Opportunity.Review` satisfies canonical Review.
- `Opportunity.Manage` remains compatible with the legacy broad Opportunity permission behavior.

This preserves existing permission data and older tokens during the migration window. It also means stale tokens carrying `Opportunity.Manage` must be refreshed after deployment.

## E Role fallback removed/narrowed

The broad `Reviewer` role-name fallback was removed. Role names are not themselves FOPX Opportunity authorization grants; the handler now evaluates explicit permission claims, Admin compatibility, or effective database permissions.

No schema or domain model change was introduced.

## F Permission backfill strategy

`OpportunityPermissionBackfillService` now performs an idempotent two-part migration at startup:

1. Add any missing canonical FOPX Opportunity permission definitions.
2. For each active Reviewer role, add canonical View and Review assignments if absent and remove only `Opportunity.Manage` role assignments.

Unrelated assignments are preserved. An explicitly assigned canonical Manage permission is preserved. The startup log records added keys, Reviewer roles processed, explicit assignments added, and legacy Manage assignments removed.

## G Existing user migration behavior

Users assigned to an active Reviewer role receive the migrated role permissions through the existing `EffectivePermissionService` resolution path on subsequent authorization checks. The backfill is safe to rerun and does not duplicate role-permission rows.

Existing JWTs remain valid under the retained alias compatibility map. Tokens carrying the old `Opportunity.Manage` claim can continue to authorize the legacy-compatible scope until they expire or are refreshed; deployment should therefore include token refresh/re-login validation.

## H View policy

`OpportunitiesAdminController.GetAll` and `Get` require `FOPX.Opportunities.View`.

The policy is enforced at the endpoint and does not depend on the Reviewer role name.

## I Review policy

`Approve` and `Reject` require `FOPX.Opportunities.Review`.

View alone is insufficient, and Manage alone does not grant Review.

## J Manage policy

`TransitionFunding` requires `FOPX.Opportunities.Manage`.

View plus Review does not grant funding-status management. Manage is independently assignable.

## K Funding transition authorization

Funding-status transitions are protected by the canonical Manage policy. A migrated Reviewer with only View and Review is denied this endpoint unless Manage is explicitly assigned.

## L Approve/reject authorization

Approval and rejection are protected by the canonical Review policy. A user with View plus Manage but without Review is denied approval and rejection.

## M Admin/Super Admin compatibility

The existing Admin compatibility path remains: an `Admin` role and the existing wildcard permissions (`*.*` or `admin.*`) retain full policy access.

There is no distinct `SuperAdmin` role definition or seed in the inspected repository. A deployment-specific Super Admin account must therefore be verified to resolve to the existing Admin role or wildcard permission before UAT; no new role-name grant was introduced.

## N Authorization matrix tests

`OpportunityAdminAuthorizationTests` covers:

- no permissions: View, Review, and Manage denied;
- View only: View allowed, Review and Manage denied;
- View plus Review: View and Review allowed, Manage denied;
- View plus Manage without Review: View and Manage allowed, Review denied;
- Reviewer role without explicit permissions: all three denied;
- migrated Reviewer permissions: View and Review allowed, Manage denied;
- Admin role: all three allowed;
- legacy View/Review/Manage compatibility behavior; and
- exact controller policy metadata.

## O Backend tests

The focused authorization and backfill run passed: 6 tests passed.

The broader Opportunity-filtered unit-test run passed: 19 tests passed.

The backfill test verifies Reviewer migration, removal of the legacy Manage assignment, preservation of the intended canonical assignments, and idempotence on a second run.

## P Frontend changes if any

No frontend changes were made for Task 08. Task 07 already established the frontend Opportunity administration contract and this closure changes backend authorization migration only.

## Q Frontend tests if any

No frontend tests were rerun because no frontend files changed in this task.

## R TypeScript result if applicable

Not applicable to this backend-only authorization migration.

## S Backend build

`Core-BackEnd/Investa.API/Investa.API.csproj` built successfully with zero warnings and zero errors using the existing restored dependencies.

## T Frontend build if applicable

Not rerun because the frontend was unchanged by Task 08.

## U Remaining authorization gaps

- No authoritative Reviewer role seed exists in the repository, so the active deployment database must be checked for Reviewer roles and their assignments.
- Existing tokens containing legacy `Opportunity.Manage` claims require expiration or refresh before the narrower migrated role behavior is observable through claims.
- A distinct Super Admin role is not defined in the inspected authorization model; any deployment-specific Super Admin mapping needs UAT confirmation.
- Other legacy controllers still use role-name checks for unrelated modules. They were intentionally left outside this FOPX Opportunity migration.

## V USER UAT checklist

After deployment and token refresh, verify with representative accounts:

- no-permission user: list, detail, approve, reject, and funding transition are denied;
- View-only user: list/detail work; approve/reject and funding transition are denied;
- View plus Review user: list/detail/approve/reject work; funding transition is denied;
- View plus Manage user without Review: list/detail/funding transition work; approve/reject are denied;
- migrated Reviewer: View and Review work; funding transition is denied unless Manage was explicitly assigned;
- Admin and deployment-defined Super Admin: full Opportunity administration works;
- legacy accounts are re-authenticated or tokens are refreshed; and
- startup logs show the expected backfill counts and no repeated assignments on restart.

## W Recommended TASK 09 scope

Use Task 09 to inventory and migrate remaining module-specific role-name authorization checks, formalize the Super Admin-to-wildcard mapping, add an authorization audit view for role/permission assignments, and define token revocation/refresh behavior for permission changes.

Final classification: CENTRAL ADMIN TASK 08 — IMPLEMENTED WITH GAPS
