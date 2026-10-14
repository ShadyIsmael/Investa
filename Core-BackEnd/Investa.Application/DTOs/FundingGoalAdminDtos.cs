using System.ComponentModel.DataAnnotations;

namespace Investa.Application.DTOs;

public sealed class FundingGoalAdminDto
{
    public int Id { get; init; }
    public string Code { get; init; } = string.Empty;
    public string NameEn { get; init; } = string.Empty;
    public string NameAr { get; init; } = string.Empty;
    public string? DescriptionEn { get; init; }
    public string? DescriptionAr { get; init; }
    public int SortOrder { get; init; }
    public bool IsActive { get; init; }
    public int ReferenceCount { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime UpdatedAt { get; init; }
    public Guid? CreatedByUserId { get; init; }
    public Guid? UpdatedByUserId { get; init; }
}

public sealed class CreateFundingGoalRequest
{
    [Required, StringLength(120)] public string NameEn { get; set; } = string.Empty;
    [Required, StringLength(120)] public string NameAr { get; set; } = string.Empty;
    [StringLength(500)] public string? DescriptionEn { get; set; }
    [StringLength(500)] public string? DescriptionAr { get; set; }
    [Range(0, int.MaxValue)] public int SortOrder { get; set; }
}

public sealed class UpdateFundingGoalRequest
{
    [Required, StringLength(120)] public string NameEn { get; set; } = string.Empty;
    [Required, StringLength(120)] public string NameAr { get; set; } = string.Empty;
    [StringLength(500)] public string? DescriptionEn { get; set; }
    [StringLength(500)] public string? DescriptionAr { get; set; }
    [Range(0, int.MaxValue)] public int SortOrder { get; set; }
}

public sealed class SetFundingGoalStatusRequest
{
    public bool IsActive { get; set; }
}
