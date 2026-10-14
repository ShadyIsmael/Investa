# CENTRAL ADMIN — TASK 06 FOPX OPPORTUNITIES REPORT

Date: 2026-10-01  
Scope: FOPX Opportunities Administration only, continuing the existing Central Admin implementation. No manual UAT was performed.

## A. Delta files/contracts inspected

Inspected the Opportunity admin controller, Opportunity DTOs, Opportunity enums, `IOpportunityService`, the Opportunity service implementation, the current API response wrapper, the existing Opportunity placeholder route, route registry/policy/navigation/lazy-loading surfaces, the shared enterprise states, auth permission helpers, API client, and existing frontend test/build configuration.

## B. Existing implementation reused

Reused `App.tsx`, `RouteGuard`, `routeRegistry.ts`, `routePolicy.ts`, the permission compatibility mechanism, `routeLoaders.ts`, `LazyRouteBoundary`, `PageHeader`, shared enterprise error states, semantic theme classes, existing API client, currency formatter, i18n setup, and the established EN/AR/RTL foundation. No Central Admin shell, auth, workspace, theme, or global routing redesign was made.

## C. Opportunity backend endpoints

The current authoritative controller is `Investa.API.Controllers.Admin.OpportunitiesAdminController` under `/api/v1/admin/opportunities`:

- `GET /api/v1/admin/opportunities` — paged list.
- `GET /api/v1/admin/opportunities/{id}` — authoritative admin detail.
- `POST /api/v1/admin/opportunities/{id}/approve` — approve an eligible Opportunity.
- `POST /api/v1/admin/opportunities/{id}/reject` — reject with a required reason.
- `POST /api/v1/admin/opportunities/{id}/funding-status` — supported funding-status transition.

No legacy Investment endpoint was used.

## D. Admin/moderation endpoints

Approve and reject are implemented through the current admin endpoints only. The service permits approve/reject when lifecycle status is `UnderReview`; rejection uses the backend-defined `Reason` field. Funding transitions use the current `TransitionOpportunityFundingRequest` contract.

## E. Current enums/statuses

Lifecycle: `Draft`, `UnderReview`, `Rejected`, `Approved`, `Published`, `Funding`, `FullyFunded`, `InProgress`, `Completed`, `Archived`.  
Moderation: `Draft`, `Submitted`, `UnderReview`, `Approved`, `ChangesRequested`, `Rejected`.  
Funding: `NotScheduled`, `Scheduled`, `Open`, `Paused`, `Closed`.  
Closure reasons: `TargetReached`, `DeadlineReached`, `FounderClosed`, `Cancelled`, `ComplianceClosed`.

The UI keeps lifecycle, moderation, and funding as separate concepts. It does not classify an Opportunity as Equity, Loan, or Profit Sharing; `InvestmentModel` is not presented as an Opportunity type.

## F. Permissions used

Page access uses canonical `FOPX.Opportunities.View`. Action gates use canonical `FOPX.Opportunities.Review` and `FOPX.Opportunities.Manage` through the existing `PERMISSION_COMPATIBILITY`/`matchesPermission` mechanism.

The backend controller currently authorizes `Admin,Reviewer` roles and has no explicit FOPX permission attributes. Backend authorization remains authoritative; frontend permissions are action/page UX gates, not a replacement for backend authorization.

## G. Routes

Registered and mounted through the existing architecture:

- `/admin/fopx/opportunities` → `OpportunityListPage`.
- `/admin/fopx/opportunities/:opportunityId` → `OpportunityDetailPage`.

The detail route is protected separately with the same view policy. No parallel routing mechanism or unsupported action route was added.

## H. Lazy-loading boundary

Added `routes/OpportunityAdminRoutes.ts` and a dedicated dynamic import in `routeLoaders.ts`. Opportunity code is not in the eager application graph and is loaded when an Opportunity route renders. Lazy route registration is covered by tests.

## I. Opportunity list

Implemented a dense enterprise operations table with title-to-detail navigation, restrained row actions, status context, server-backed search, lifecycle filtering, server-backed sorting, and server-backed paging. The table remains horizontally scrollable at narrower widths and does not become a card feed.

## J. Columns

The list uses only fields present in `AdminOpportunityListItemDto`:

- Opportunity title and backend ID.
- Founder name and returned email where present.
- Lifecycle status.
- Project stage.
- Funding target as a number because the list DTO does not return funding currency.
- Created date.
- View action.

Project name, moderation status, funding status, and updated date are not fabricated into the list because the current list DTO does not supply them. They are shown from the detail DTO where authoritative.

## K. Pagination

Uses the backend `Page`, `PageSize`, `Total`, and `Items` contract with page sizes 20, 50, and 100, previous/next controls, and showing counts. The frontend does not fetch the full dataset to paginate locally.

## L. Search

Debounced server query through the current `Search` parameter. The backend implementation searches Opportunity title and Founder name/email. The UI does not imply Project search because the current endpoint does not support it.

## M. Filters

Implemented only the backend-supported lifecycle `Status` filter. Moderation, funding, Project, Founder, and date-range filters were not added because the current list query does not expose them. The filter scope is stated in the UI.

## N. Sorting

Uses the backend `SortBy` and `SortDirection` parameters for the supported list fields: created date, title, Founder, lifecycle status, funding target, and Project stage. Updated-date sorting is not implied because `UpdatedAt` is absent from the list DTO.

## O. Detail architecture

Implemented a continuous administrative canvas with identity/status summary, Project context, system information, overview/use of funds, Opportunity-owned funding context, media, documents, review history, and authoritative Opportunity events. Detail loading, 403, 404, retry, action validation, and action failure states are covered.

## P. Project context

Uses `ProjectContext` plus the embedded Project fields from the authoritative Opportunity detail. It shows Project name, reference, stage, industry, and summary. No dead Project link was added because the canonical Project Admin detail route is not currently exposed.

## Q. Founder/owner context

Uses the returned `FounderSummaryDto` only: name, email where returned, and operational Founder reference. No unrelated profile or additional PII fetch was added.

## R. Lifecycle presentation

Lifecycle is displayed as a distinct compact status value in the header summary and list. It is not collapsed into a generic “Active” label.

## S. Moderation presentation

Moderation status is displayed separately from lifecycle and funding status on detail. Review history is rendered from the backend `ReviewHistory` projection only.

## T. Admin actions

Implemented only current backend-supported actions:

- Approve, visible only for `UnderReview` plus review/manage permission.
- Reject, visible only for `UnderReview` plus review/manage permission; required reason is validated before submission and capped to the backend’s 1,000-character contract.
- Funding status transition, visible only with manage permission and only for the exact backend-supported transition targets.

Successful actions re-fetch the authoritative detail. No bulk moderation, archive/restore, request-changes, optimistic state, or unsupported action was added.

## U. Media

Renders returned media metadata, thumbnails/previews when supplied, visibility/cover context, created date, and the backend-returned open URL. No media mutation API was invented.

## V. Documents

Renders returned governed document metadata, type/category/visibility, created date, and opens the backend-returned URL only when supplied. No file-storage bypass or document mutation was added.

## W. Events/timeline

Renders `Events` and `ReviewHistory` returned by the detail DTO. No CreatedAt/UpdatedAt values are converted into synthetic events.

## X. Funding context

Shows Opportunity-owned funding target, confirmed funded amount, committed amount, confirmed received amount, remaining target, progress, approved participant count, and funding dates. The copy explicitly separates this aggregate context from Participation, declarations, contracts, and repayments. No Investment/Loan/Equity/Profit Sharing admin module was added.

## Y. Loading/empty/error states

List uses a structured table skeleton. Detail uses section-aware skeleton blocks. Empty list, filtered result, media, documents, review history, and events states are explicit. Shared `AccessDenied`, `NotFound`, and `UnexpectedError` states are reused; network failures provide retry. Action failures are rendered as concise localized validation/error copy without raw JSON or stack traces.

## Z. EN/AR/RTL

All new UI copy is localized in `src/i18n/en.json` and `src/i18n/ar.json`. Technical IDs, dates, emails, and numeric amounts use appropriate LTR isolation. Existing document direction switching remains the source of RTL behavior.

## AA. Light/Dark implementation

Uses existing semantic classes and border/background/text tokens. No new theme system or FOPX-dominant visual layer was introduced.

## AB. Accessibility

Uses semantic table headers and cells, keyboard-accessible sort buttons and row links, labeled filters, localized accessible labels, modal dialog semantics, required rejection input, focus restoration after actions, and status signals that are not color-only.

## AC. Responsive behavior

The operational table preserves desktop/laptop/tablet information density with controlled horizontal scrolling and a minimum table width. Title, lifecycle, and actions remain available rather than being moved into cards.

## AD. Automated tests

Added focused coverage for:

- SuccessResponse/list paging parsing, including enum normalization.
- Server query serialization for paging, search, lifecycle filter, and sorting.
- Detail parsing and Project relationship.
- Approve/reject endpoint payloads.
- Permission/state action availability.
- Exact supported funding transitions.
- Required and bounded rejection reason.
- Empty list state.
- Controlled 403 list state.
- Controlled 404 detail state.
- Successful approval followed by authoritative detail refresh.
- Route registry component metadata and both lazy route boundaries.

Final frontend suite: 13 test files, 39 tests passed.

## AE. TypeScript result

`npx tsc --noEmit` passed with no diagnostics.

## AF. Frontend build

`npm run build` passed with Vite 6.4.3 and 2,516 modules transformed.

## AG. Opportunity route chunk size

Final production output: `OpportunityAdminRoutes-BfJcHT2g.js` at 31.76 kB before gzip and 7.58 kB gzip. It is route-owned and is not an initial modulepreload. The existing `FopxWorkspaceRoutes` remains 424.06 kB before gzip / 121.16 kB gzip.

## AH. Backend/API gaps

The module is implemented against the current contract, with these deliberate gaps documented rather than faked:

1. The list DTO does not return Project name/context, moderation status, funding status, or UpdatedAt; those fields are therefore detail-only.
2. The list query supports only lifecycle status, title/Founder search, paging, and the current sort fields. No moderation/funding/Project/Founder/date filters are available.
3. The current service loads all Opportunities and Founders before filtering, sorting, and slicing in memory. The frontend correctly uses the paging contract, but database-scale server-side query execution is a backend scalability follow-up.
4. Backend authorization is role-based (`Admin,Reviewer`) rather than explicitly enforcing the canonical FOPX action permission names. The backend should remain the authority for that hardening.
5. No canonical Project Admin detail route is currently available for navigation from Opportunity context.

## AI. Remaining implementation gaps

The supported Opportunity admin surface is complete. Remaining gaps are contract/platform follow-ups: richer list projection/filtering, database-backed query execution, explicit backend permission policy alignment, and a future canonical Project Admin module. No unsupported frontend controls were added to mask these gaps.

## AJ. USER UAT checklist

Manual UAT was not performed. The user should verify:

1. Open `/admin/fopx/opportunities` and confirm the list loads, remains dense, and preserves table scrolling.
2. Search by Opportunity title and Founder name/email.
3. Filter by lifecycle status.
4. Change page size and move between pages.
5. Sort the supported columns and confirm server refresh behavior.
6. Open a detail page and confirm Project, Founder, lifecycle, moderation, funding, media, documents, and event context.
7. Confirm approve/reject visibility for appropriate permissions and current state.
8. Confirm rejection requires a reason and successful actions refresh authoritative detail.
9. Confirm funding transition choices match the backend response for the test data.
10. Verify controlled 403/404/network/action-error states in the relevant environments.
11. Verify EN, AR, RTL, light theme, dark theme, and mixed-language names/IDs.
12. Verify responsive table scrolling and keyboard access at desktop, laptop, and tablet widths.

## AK. Recommended TASK 07 scope

Harden the Opportunity admin contract for scale and operational completeness: project/moderation/funding/updated list projection, database-backed query filtering/sorting/paging, and explicit backend permission policy alignment. Then use that contract to implement the canonical Project Administration module without adding legacy Investment semantics.

## Final classification

CENTRAL ADMIN TASK 06 — IMPLEMENTED WITH GAPS
