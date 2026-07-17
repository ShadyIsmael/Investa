using System;

namespace Investa.Application.DTOs.Finance;

/// <summary>DTO for Income Category.</summary>
public class IncomeCategoryDto
{
    public int Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? NameEn { get; set; }
    public string? NameAr { get; set; }
    public string? Description { get; set; }
    public string? GLAccountCode { get; set; }
    public int SortOrder { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
}

/// <summary>DTO for creating or updating an Income Category.</summary>
public class CreateUpdateIncomeCategoryDto
{
    public string Name { get; set; } = string.Empty;
    public string? NameEn { get; set; }
    public string? NameAr { get; set; }
    public string? Description { get; set; }
    public string? GLAccountCode { get; set; }
    public int SortOrder { get; set; } = 0;
    public bool IsActive { get; set; } = true;
}
