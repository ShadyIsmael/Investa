# Project Foundation — Phase 1

**Status:** Complete
**Scope:** Backend Project parent foundation only

## Result

Project is now the required parent of Opportunity:

```text
Project 1 -> many Opportunities
```

Phase 1 creates exactly one Project for every existing Opportunity and exactly one Project whenever the existing Opportunity creation workflow creates a new Opportunity. The schema supports the future one-to-many relationship, but no Phase 1 workflow creates a second opportunity for a Project.

Opportunity remains the current public, moderation, funding, participation, contract, and Project Room aggregate. Existing Opportunity IDs, routes, request contracts, permissions, status rules, and business workflows are unchanged.

## Project fields

Project now stores the durable business foundation:

- identity and ownership: `Id`, `FounderId`, `DisplayName`, `LegalName`, `Slug`;
- narrative: `Summary`, `Description`;
- classification: `CategoryId`, `Industry`, `BusinessStage`, `Geography`, `TagsSnapshotJson`;
- business profile: `FoundedOn`, `WebsiteUrl`, `LogoUrl`, `TeamDescription`, `BusinessModel`;
- durable risk profile: `RiskLevel`, `RiskDisclosure`;
- delivery/governance foundation: `Status`, `ArchiveReason`;
- audit/concurrency: `CreatedAt`, `UpdatedAt`, `RowVersion`.

Funding target, funding currency, participation bounds, instrument terms, opportunity status, and use of funds remain on Opportunity.

## Relationship and authorization

- `Opportunity.ProjectId` is required.
- The foreign key uses `(ProjectId, FounderId) -> (Project.Id, Project.FounderId)`.
- This prevents an Opportunity from being attached to another founder’s Project at the database boundary.
- Project and Opportunity deletion uses restrictive behavior.
- Existing Opportunity authorization remains authoritative in Phase 1; there are no new Project endpoints or permissions.

## Creation compatibility

`POST /api/v1/opportunities` still accepts the same request and runs the same validation and authorization. The application creates the Project and Opportunity together in one unit of work.

Opportunity responses add `projectId`. This is an additive field; existing clients may continue using `id` / `opportunityId` and all existing routes.

Initial Project values are copied from the creation request without moving or deleting Opportunity values. The Project slug is internally generated and is not exposed as a new route.

## Migration and backfill

Migration: `AddProjectFoundation`

Upgrade sequence:

1. Create `Projects`.
2. Add nullable `Opportunities.ProjectId`.
3. Insert one Project per Opportunity using a temporary `SourceOpportunityId` correlation.
4. Copy founder, title/summary/description, category/industry, Project stage, cover image, and audit timestamps.
5. Update each Opportunity with its new Project ID.
6. Abort if any Opportunity remains unlinked.
7. Make `ProjectId` required.
8. Remove the temporary correlation column.
9. Add indexes and restrictive foreign keys.

The backfill does not compare or group by founder, title, company name, or similarity. Two existing Opportunities always produce two Projects, including when their visible data is identical.

On a clean database the same migration creates an empty Projects table and the required relationship; subsequent Opportunity creation creates its parent Project.

## Explicitly deferred

Phase 1 does not:

- expose Project CRUD APIs;
- allow selection of an existing Project during Opportunity creation;
- implement multiple-opportunity product workflows;
- change Opportunity lifecycle states;
- change participation uniqueness or repeat-investment behavior;
- change contracts or contract lineage;
- move Project Room content or access to Project;
- change legacy Investment models;
- move files, events, notifications, reputation, or finance records to Project.

These remain later-phase work under the main redesign architecture.
