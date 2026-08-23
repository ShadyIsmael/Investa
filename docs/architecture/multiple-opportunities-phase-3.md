# Multiple Opportunities — Phase 3

Status: implemented (2026-07-30)

## Scope

Phase 3 enables one founder-owned `Project` to contain multiple independent `Opportunity` records. `Opportunity` remains the physical/API name and is treated as one Funding Opportunity. This phase does not change Participation, Contract, lifecycle, Project Room, or public Project behavior.

## Opportunity identity and ordering

Each Opportunity now has:

- `ProjectId`: required parent and ownership boundary;
- `SequenceNumber`: immutable, one-based order within the Project;
- `Purpose`: founder-facing reason for this raise;
- `Type`: opportunity classification independent of `InvestmentModel`.

`(ProjectId, SequenceNumber)` is unique. New opportunities receive `max(existing sequence) + 1`. Existing Opportunities are backfilled deterministically with `ROW_NUMBER()` partitioned by Project and ordered by `CreatedAt`, then `Id`.

Purpose defaults to `General funding` and Type defaults to `Opportunity` for old API clients and migrated data. These defaults preserve existing request payloads while new founder screens collect both fields.

## Creation and authorization

The unchanged `POST /api/v1/opportunities` endpoint accepts the additive `ProjectId`, `Purpose`, and `Type` fields. An explicit Project must exist, belong to the authenticated active founder, and not be archived. The Phase 2 restriction preventing a second Opportunity has been removed.

Clients omitting `ProjectId` retain the compatibility behavior: the server creates a dedicated Project and sequence-one Opportunity. Cross-founder Project IDs remain concealed as not found.

## Independence

Every Opportunity keeps its own existing:

- funding target, currency, limits, instrument, and terms;
- moderation/funding status and row version;
- participations/join requests and capacity calculations;
- contracts and contract versions;
- media, documents, events, conversations, and notifications.

No child collection is shared or moved to Project scope in this phase.

## Founder UI

Founder Project list and detail screens show all Opportunities in sequence order and link to the existing Opportunity routes. Any non-archived Project may start another opportunity. Opportunity creation selects the parent Project and captures opportunity purpose/type.

## Migration and rollback

Migration `AddMultipleOpportunitiesPhase3` is additive:

1. add non-null Purpose, Type, and SequenceNumber columns;
2. deterministically rank all existing rows within each Project;
3. add the unique Project/sequence index.

It preserves all Project and Opportunity IDs and relationships. Rollback removes only the new index and columns; it does not delete opportunity data.

## Deferred

Repeat investment/immutable Participation redesign, split lifecycle state machines, Project-scoped Project Room, public Project pages, opportunity reorder operations, and physical/API renaming from Opportunity to Funding Opportunity remain deferred.
