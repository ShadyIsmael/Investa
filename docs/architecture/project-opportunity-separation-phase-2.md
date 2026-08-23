# Project / Opportunity Separation — Phase 2

Status: implemented (2026-07-30), updated (2026-07-30)

## Scope

Phase 2 makes `Project` a founder-managed aggregate and keeps `Opportunity` as the existing Funding Opportunity aggregate. It does not rename Opportunity or change participation, contract, lifecycle, Project Room, finance, or repeat-investment behavior.

## UX flow

### Create Project (from header)
The admin navbar "Create Project" action (`/admin/projects/new`) opens the Project Editor component as a standalone form. This is a clean Project creation screen — no Opportunity step is integrated. The form captures only stable project-level information (name, summary, description, optional legal/business details). Funding and investment stage are not part of Project creation — each Opportunity has its own independent lifecycle.

After saving, the founder is redirected to the Project details view (`/admin/projects/:id`) which displays all fields in read-only mode plus the list of Opportunities under that Project.

### Create Opportunity (from Project details)
The Project details screen has a prominent "Create Opportunity" button. Clicking it navigates to `/admin/investments/new?projectId=:id` which opens the existing 4-step Opportunity wizard with the Project pre-selected as a read-only context field. The founder cannot change the Project assignment.

### Create Opportunity (global)
The global "Create Opportunity" entry in the admin navbar (`/admin/investments/new`) displays the Opportunity wizard with a required Project selector dropdown as the first field in Step 1. Only Projects owned by the current Founder that are eligible for Opportunity creation (active, draft, `canCreateOpportunity`) appear in the list. If no eligible Projects exist, an informative empty-state message is shown instead.

The "Create a new Project first" button has been removed from the wizard — Project creation is a separate journey and is not initiated from the Opportunity wizard.

### Opportunity wizard — Project display rules
- **Global create** (`/admin/investments/new`): dropdown selector with all eligible Projects. Run-time empty state shown when no Projects exist.
- **From Project details** (`/admin/investments/new?projectId=:id`): read-only context card. Project cannot be changed.
- **Edit mode** (`/admin/opportunities/:id/edit`): read-only context card. Project is immutable.
- The selected Project appears in the sidebar summary, review summary, and is validated on Step 1 as a required field before allowing progression to Step 2.
- All user-facing labels use "Project" (not "Opportunity") for the durable business, and the fundraising labels are provided through i18n keys ("Fundraising purpose" and "Opportunity type").

### Create additional Opportunities
The Project details view lists all Opportunities and always shows the "Create Opportunity" button (when the Project allows opportunity creation). Each Opportunity created under the same Project is automatically linked and sequenced.

## Founder Project API

- `GET /api/v1/projects` lists only the authenticated founder's Projects.
- `GET /api/v1/projects/{id}` returns an owned Project; foreign and missing IDs both return not found.
- `POST /api/v1/projects` creates a Project independently of an opportunity.
- `PUT /api/v1/projects/{id}` edits an owned, non-archived Project.
- `DELETE /api/v1/projects/{id}` archives rather than physically deletes the Project and requires a reason.

Create, update, and archive operations write the existing security `AuditLog`. Active founder capability is checked in the application service, independent of UI guards.

## Funding Opportunity creation

New clients send `ProjectId` to the unchanged `POST /api/v1/opportunities` route. The backend requires the Project to:

1. exist;
2. belong to the authenticated founder;
3. not be archived; and
4. have no opportunity yet.

The fourth rule deliberately prevents Phase 2 from exposing multiple-opportunity behavior before its later phase. The founder UI lists only Projects eligible for their first opportunity and provides a create-Project-first path.

## Compatibility

`ProjectId` is additive and nullable in the request contract only. Existing clients that omit it continue through the Phase 1 compatibility path: the server creates exactly one dedicated Project and then the Opportunity. Opportunity IDs, response shapes, routes, media, publishing, permissions, and workflows are unchanged.

## Security and validation

- Cross-founder Project reads and mutations are concealed as `PROJECT_NOT_FOUND`.
- Suspended, inactive, investor-only, and non-client accounts cannot manage Projects.
- Required Project identity and narrative fields, stage values, URL lengths/formats, and future founded dates are validated.
- Archived Projects are immutable and cannot receive opportunities.
- Project changes and opportunity creation are auditable; an opportunity-link event is stored on the Opportunity timeline.

## Deferred

Public Project pages, ownership transfer, and Project document/media management remain deferred to later phases.
