using System.ComponentModel.DataAnnotations;

namespace Investa.Application.DTOs;

public sealed class CountryAdminDto
{
    public int Id { get; init; }
    public string Code { get; init; } = string.Empty;
    public string IsoAlpha2 { get; init; } = string.Empty;
    public string? IsoAlpha3 { get; init; }
    public string NameEn { get; init; } = string.Empty;
    public string NameAr { get; init; } = string.Empty;
    public string? PhoneCode { get; init; }
    public int SortOrder { get; init; }
    public bool IsActive { get; init; }
    public int ReferenceCount { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime UpdatedAt { get; init; }
    public Guid? CreatedByUserId { get; init; }
    public Guid? UpdatedByUserId { get; init; }
}

public sealed class CreateCountryRequest
{
    [Required, StringLength(2, MinimumLength = 2)] public string IsoAlpha2 { get; set; } = string.Empty;
    [StringLength(3, MinimumLength = 3)] public string? IsoAlpha3 { get; set; }
    [Required, StringLength(120)] public string NameEn { get; set; } = string.Empty;
    [Required, StringLength(120)] public string NameAr { get; set; } = string.Empty;
    [StringLength(20)] public string? PhoneCode { get; set; }
    public int SortOrder { get; set; }
    public bool IsActive { get; set; } = true;
}

public sealed class UpdateCountryRequest
{
    [StringLength(3, MinimumLength = 3)] public string? IsoAlpha3 { get; set; }
    [Required, StringLength(120)] public string NameEn { get; set; } = string.Empty;
    [Required, StringLength(120)] public string NameAr { get; set; } = string.Empty;
    [StringLength(20)] public string? PhoneCode { get; set; }
    public int SortOrder { get; set; }
    public bool IsActive { get; set; } = true;
}

public sealed class SetCountryStatusRequest
{
    public bool IsActive { get; set; }
}
