namespace Investa.Application.DTOs;

/// <summary>
/// Immutable technical metadata for the Project lifecycle stages.
/// The lifecycle codes are workflow contracts, not administrator-editable master data.
/// </summary>
public sealed class ProjectStageMetadataDto
{
    public string Code { get; init; } = string.Empty;
    public int Value { get; init; }
    public string NameEn { get; init; } = string.Empty;
    public string NameAr { get; init; } = string.Empty;
    public int SortOrder { get; init; }
    public bool IsActive { get; init; } = true;
    public bool AllowsCustomName { get; init; }
}
