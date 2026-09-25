# Project Room Redesign — Phase 7

## Audit findings

The legacy Project Room was an Opportunity room: access, milestones, updates, files, contracts, cash flows, and activity were loaded from one `Opportunity`. Its reusable parts are the document/media libraries, milestone/update presentation, activity timeline, contract links, and participant context. Its conflicting assumption was that one opportunity was the durable Project boundary.

## Implemented model

`ProjectRoomEntry` stores Project-level updates, milestones, and activity. `ProjectRoomDocument` stores Project-level documents. Both preserve creator, time, visibility, and concurrency metadata. The room projects every child Opportunity as a separate section. Contracts, Participations, documents, media, cash flows, and obligation completion retain their originating Opportunity identifier and existing workflow.

## Access and isolation

- A founder, administrator/reviewer, or investor approved in any Opportunity under the Project may enter.
- Founders manage Project-level entries and documents; members see investor-visible/member-visible records.
- Founders and administrators can inspect all originating Opportunity sections.
- Investors receive restricted links and records only for Opportunities where they have an approved Participation.
- Other sections expose only already-public documents/media; restricted counts are zero and workflow links are omitted.
- These rules are enforced by the API; the UI is not the authorization boundary.

## Compatibility and migration

The existing Project Room route remains available at `GET /api/v1/projects/{projectId}/room` for future Project Workspace work. It is not the canonical Opportunity operational route.

`GET /api/v1/opportunities/{id}/room` is the canonical authenticated Opportunity Room endpoint. It returns only the requested Opportunity's own overview, participation context, milestones, timeline, documents, and media. The parent Project is read-only identity context (`ProjectId` and `ProjectDisplayName`); sibling Opportunities are never included, and no Project Room redirect URL is returned.

`AddProjectScopedRoomPhase7` adds only Project-room entry/document tables, indexes, restrictive foreign keys, visibility fields, and row versions. It does not move existing data: Opportunity events, files, contracts, schedules, IDs, and audit history remain unchanged and are projected from their origin. This supports clean and upgraded databases.

Payments, escrow, collections, distributions, exits, public Project pages, and settlement proof remain out of scope.

## Security test closure

`ProjectRoomPhase7SecurityTests` provides focused service-integration and HTTP endpoint coverage for:

- founder and administrator/reviewer visibility across every Project Opportunity;
- membership through an approved Participation in one Opportunity;
- per-Opportunity isolation of private documents, media, Participation/contract counts, cash-flow links, and obligation-completion links;
- continued projection of explicitly public records from another Opportunity;
- denial for pending, rejected, cancelled, foreign, and cross-Project investors;
- rejection of manipulated Project, milestone, and Project-document ownership identifiers;
- archived Project access under the existing approved-member rule and not-found behavior for deleted/missing Projects; and
- the canonical Opportunity Room endpoint returning the requested Opportunity payload without a Project Room redirect.

The suite exposed and fixed an audit serialization cycle in Project Room entry creation. Audit data now records the entry's immutable scalar fields rather than serializing a tracked entity graph.

Verification evidence: 9 Phase 7 security/isolation tests passed, 3 Phase 6 obligation-completion regression tests passed, and both the backend Release build and frontend production build passed.
