using System.ComponentModel.DataAnnotations;

namespace Investa.Domain.Entities;

/// <summary>
/// Canonical country reference data. Business records store the immutable ISO Alpha-2 value
/// for controlled country selections so historical values remain displayable when a country is
/// later deactivated.
/// </summary>
public sealed class Country
{
    public int Id { get; set; }

    [Required, StringLength(80)]
    public string Code { get; set; } = string.Empty;

    [Required, StringLength(2, MinimumLength = 2)]
    public string IsoAlpha2 { get; set; } = string.Empty;

    [StringLength(3, MinimumLength = 3)]
    public string? IsoAlpha3 { get; set; }

    [Required, StringLength(120)]
    public string NameEn { get; set; } = string.Empty;

    [Required, StringLength(120)]
    public string NameAr { get; set; } = string.Empty;

    [StringLength(20)]
    public string? PhoneCode { get; set; }

    public int SortOrder { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public Guid? CreatedByUserId { get; set; }
    public Guid? UpdatedByUserId { get; set; }
}
