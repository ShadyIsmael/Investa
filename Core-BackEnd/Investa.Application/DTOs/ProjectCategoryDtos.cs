using System.ComponentModel.DataAnnotations;

namespace Investa.Application.DTOs;

public sealed class ProjectCategoryDto
{
    public int Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string NameEn { get; set; } = string.Empty;
    public string NameAr { get; set; } = string.Empty;
    public string? DescriptionEn { get; set; }
    public string? DescriptionAr { get; set; }
    public int SortOrder { get; set; }
    public bool IsActive { get; set; }
    public int ProjectCount { get; set; }
    public int InvestmentCount { get; set; }
    public int ClientCount { get; set; }
    public int ReferenceCount => ProjectCount + InvestmentCount + ClientCount;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public Guid? CreatedByUserId { get; set; }
    public Guid? UpdatedByUserId { get; set; }
}

public sealed class CreateProjectCategoryRequest
{
    [Required, StringLength(120)] public string NameEn { get; set; } = string.Empty;
    [Required, StringLength(120)] public string NameAr { get; set; } = string.Empty;
    [StringLength(500)] public string? DescriptionEn { get; set; }
    [StringLength(500)] public string? DescriptionAr { get; set; }
    [Range(0, int.MaxValue)] public int SortOrder { get; set; }
}

public sealed class UpdateProjectCategoryRequest
{
    [Required, StringLength(120)] public string NameEn { get; set; } = string.Empty;
    [Required, StringLength(120)] public string NameAr { get; set; } = string.Empty;
    [StringLength(500)] public string? DescriptionEn { get; set; }
    [StringLength(500)] public string? DescriptionAr { get; set; }
    [Range(0, int.MaxValue)] public int SortOrder { get; set; }
}

public sealed class SetProjectCategoryStatusRequest
{
    public bool IsActive { get; set; }
}
