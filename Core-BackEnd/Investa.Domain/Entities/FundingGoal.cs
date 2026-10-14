using System.ComponentModel.DataAnnotations;

namespace Investa.Domain.Entities;

public class FundingGoal
{
    public int Id { get; set; }

    [Required, StringLength(80)]
    public string Code { get; set; } = string.Empty;

    [Required, StringLength(120)]
    public string NameEn { get; set; } = string.Empty;

    [Required, StringLength(120)]
    public string NameAr { get; set; } = string.Empty;

    [StringLength(500)]
    public string? DescriptionEn { get; set; }

    [StringLength(500)]
    public string? DescriptionAr { get; set; }

    public bool IsActive { get; set; } = true;

    public int SortOrder { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public Guid? CreatedByUserId { get; set; }

    public Guid? UpdatedByUserId { get; set; }

    public ICollection<Opportunity> Opportunities { get; set; } = new List<Opportunity>();
}
