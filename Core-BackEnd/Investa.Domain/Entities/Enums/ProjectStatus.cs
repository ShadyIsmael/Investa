namespace Investa.Domain.Entities.Enums;

/// <summary>
/// Durable business/project state. Phase 1 persists this state without changing
/// the existing Opportunity lifecycle or public workflow.
/// </summary>
public enum ProjectStatus
{
    Draft = 0,
    Active = 1,
    Paused = 2,
    Completed = 3,
    Archived = 4
}
