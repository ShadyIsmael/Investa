# CENTRAL ADMIN — TASK 07 OPPORTUNITY CONTRACT HARDENING REPORT

## A. Previous query behavior

The Task 06 admin list loaded all Opportunities with include graphs, loaded all AuthUsers, then filtered, sorted, and paged in application memory. That shape was not suitable for database-scale administration.

## B. New query architecture

`OpportunityService.GetAdminOpportunitiesAsync` now composes `IQueryable` sources from the repository, joins Opportunity to Project and AuthUser, applies filters and search, applies a controlled sort, counts, pages, and projects only the requested list fields.

## C. Database paging implementation

The execution order is filtered query → `CountAsync` → `Skip`/`Take` → DTO projection → `ToListAsync`. The full Opportunity table and related aggregates are not materialized before paging.

## D. DTO fields added

The list DTO now includes ProjectId, ProjectDisplayName, FounderId, UpdatedAt, ModerationStatus, FundingStatus, and FundingCurrency while preserving the existing title, founder summary, lifecycle, target, investment model, stage, and CreatedAt fields.

## E. Project projection

ProjectDisplayName is projected from the authoritative Project relationship using the composite ProjectId/FounderId relationship. No Project query is issued per row.

## F. Founder projection

FounderId, display name, and email are projected through one AuthUser join. The list does not load full profile/client aggregates or build an all-founder in-memory dictionary.

## G. Search scope

Trimmed Search is translated into database predicates over Opportunity.Title, Project.DisplayName, AuthUser.Name, and AuthUser.Email. No client-side filtering is used. Case behavior follows the configured database collation.

## H. Filters added

The endpoint now supports optional Lifecycle Status, Moderation Status, Funding Status, ProjectId, FounderId, CreatedFrom, CreatedTo, UpdatedFrom, and UpdatedTo filters. Filters compose server-side and existing search, page, pageSize, sortBy, and sortDirection parameters remain supported.

## I. Date semantics

CreatedFrom and UpdatedFrom are inclusive lower bounds. CreatedTo and UpdatedTo are exclusive upper bounds. Offset-bearing inputs are converted to UTC; unspecified `DateTime` inputs are explicitly interpreted as UTC. The frontend date controls document the exclusive upper-bound behavior.

## J. Sorting fields

The explicit whitelist supports CreatedAt (default), UpdatedAt, Title, Founder, Project, Lifecycle Status, Moderation Status, Funding Status, FundingTarget, and ProjectStage. Unknown fields safely fall back to CreatedAt. Only `asc` selects ascending order; all other directions use descending order. Opportunity Id is a stable tie-breaker.

## K. Pagination behavior

Page and PageSize are returned with Total and Items. Total is the count after all filters. Page 1 with PageSize 20 is covered by the query-scale test, and the result is limited before list DTO materialization.

## L. Maximum page size

PageSize values 20, 50, and 100 remain supported. Values above 100 are clamped to 100. Page or PageSize below 1 returns controlled validation rather than silently changing the request.

## M. Query performance / N+1 review

The list uses repository `Query()` sources, which are `AsNoTracking()`. It does not include media, documents, events, tags, FundingGoal, the full Project aggregate, or the full Founder aggregate. The focused contract test uses 25 records to verify filtered totals and page slicing; a live SQL query-plan capture was not performed.

## N. Index changes

Existing indexes cover FounderId, ProjectId, Lifecycle Status, Moderation Status, Funding Status, FundingClosesAt, FundingGoalId, InvestmentModel, and ProjectStage. CreatedAt and UpdatedAt indexes were added to the model and to migration `20261001120000_AddOpportunityAdminQueryIndexes` because they support the default ordering and date-bound filters. No speculative title/name indexes were added.

## O. Moderation source

ModerationStatus is projected directly from `Opportunity.ModerationStatus`. It is not derived from Lifecycle Status.

## P. Funding status source

FundingStatus is projected directly from the persisted `Opportunity.FundingStatus` state. It is not derived from funding target, current amounts, participation, or contracts.

## Q. Currency result

FundingCurrency is returned directly from the authoritative Opportunity currency field and is displayed beside FundingTarget in the list.

## R. Backend permission policies

The preserved route `GET /api/v1/admin/opportunities` and detail endpoint require `FOPX.Opportunities.View`. Approve and reject require `FOPX.Opportunities.Review`. Funding-status transition requires `FOPX.Opportunities.Manage`. The existing dynamic `RequirePermission:` policy infrastructure remains the enforcement mechanism.

## S. Compatibility mapping

Canonical Opportunity permission rows are added idempotently at startup through the existing permission backfill pattern. The authorization handler maps legacy `Opportunity.View`, `Opportunity.Review`, and `Opportunity.Manage` keys to the canonical policies. Existing Admin wildcard access remains intact. The existing Reviewer role is retained as a compatibility fallback for all three FOPX Opportunity policies until role assignments are migrated.

## T. Approve/reject authorization

Approve and reject preserve their existing routes and lifecycle rules, including the required rejection reason. Both are independently protected by the Review policy.

## U. Funding transition authorization

`POST /api/v1/admin/opportunities/{id}/funding-status` preserves the existing transition state machine and is independently protected by the Manage policy.

## V. Error validation

The service validates page, page size, all enum filters, and date ranges with `BusinessValidationException` codes. The controller keeps the standard Central API response/error path and checks invalid model state. No Opportunity-specific error envelope was introduced.

## W. Frontend delta changes

The typed Opportunity service now normalizes the enriched fields and serializes every supported server filter. The existing list page was minimally extended with primary Moderation/Funding selectors and a collapsible advanced filter area for Project, Founder, and date ranges. No local filtering or sorting was added.

## X. New columns

The table now includes Project, Moderation, Funding, and Updated while retaining the existing Opportunity, Founder, Lifecycle, Project stage, Funding target, Created, and Actions columns. The table remains a dense enterprise table with horizontal overflow at narrower widths.

## Y. New filters

Primary filters are Search, Lifecycle, Moderation, and Funding. Advanced filters are Project ID, Founder ID, Created From/To, and Updated From/To. Date controls and labels communicate UTC and exclusive upper bounds.

## Z. Backend tests

`dotnet test Core-BackEnd/Investa.Tests/Investa.UnitTests/Investa.UnitTests.csproj --no-restore -m:1 --filter "FullyQualifiedName~Opportunity"` passed 17 tests. Coverage includes 25-row page/total behavior, lifecycle/moderation/funding/project/founder/search/date filters, enriched projection, default and fallback sorting, page-size bounds, date-range validation, canonical permissions, legacy aliases, Reviewer compatibility, and controller policy metadata.

## AA. Frontend tests

The full portal suite passed 13 files and 40 tests. The Opportunity service, admin pages, and policy suites passed 4/4, 4/4, and 3/3 respectively, including enriched DTO mapping and full query serialization.

## AB. TypeScript

`npx tsc --noEmit` passed.

## AC. Backend build

`dotnet build Core-BackEnd/Investa.API/Investa.API.csproj --no-restore -m:1 -v:minimal` passed with 0 errors. The repository still reports 31 existing nullable/analyzer warnings.

## AD. Frontend build

`npm run build` passed with Vite 6.4.3: 2,516 modules transformed and the Opportunity route chunk emitted successfully.

## AE. Remaining backend gaps

- The legacy Reviewer compatibility fallback currently grants all three Opportunity policy levels; it should be narrowed or removed after canonical role/permission assignments are fully migrated.
- The query-scale test uses EF InMemory, not a live SQL Server plan or production-sized dataset. A later performance pass should capture generated SQL and execution plans against representative data.
- The new index migration must be applied by the deployment migration process.

## AF. Remaining frontend gaps

- Project and Founder advanced filters intentionally use IDs because no lookup contract was added in this task; autocomplete/lookup endpoints belong in a later scope.
- No manual visual/UAT verification was performed, per the task instruction.

## AG. USER UAT checklist

- Verify View-only users can list and open detail but cannot approve, reject, or change funding status.
- Verify Review users can approve/reject and that rejection reason remains required.
- Verify Manage users can perform allowed funding transitions and cannot expand the state machine.
- Verify Admin and legacy Reviewer access remains compatible during migration.
- Verify combined lifecycle, moderation, funding, Project, Founder, search, and date filters against known records.
- Verify Created/Updated lower-inclusive and upper-exclusive UTC boundaries.
- Verify 20/50/100 paging, totals, sorting, AR/RTL, dark mode, and narrow-screen table scrolling.

## AH. Recommended TASK 08 scope

Migrate remaining Reviewer access to canonical permission assignments, remove the broad fallback when safe, add governed Project/Founder lookup contracts for advanced filters, and run SQL Server query-plan/performance validation on representative Opportunity data.

## FINAL CLASSIFICATION

CENTRAL ADMIN TASK 07 — IMPLEMENTED WITH GAPS
