using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Investa.Domain.Entities;

public class ReputationRule
{
    [Key]
    public int Id { get; set; }

    [Required]
    [StringLength(50)]
    public string RuleCode { get; set; } = string.Empty;

    [Required]
    [StringLength(100)]
    public string ActivityCode { get; set; } = string.Empty;

    [Required]
    [StringLength(200)]
    public string Description { get; set; } = string.Empty;

    public int Points { get; set; }

    [Required]
    [StringLength(50)]
    public string RoleScope { get; set; } = "Any";

    public bool IsActive { get; set; } = true;

    public bool IsEnabled { get; set; } = true;

    public bool IsSystem { get; set; } = true;

    public bool IsAutomatic { get; set; } = true;

    public bool CanRepeat { get; set; } = false;

    public int MaximumOccurrences { get; set; } = 1;

    public int SortOrder { get; set; } = 0;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedAt { get; set; }

    public Guid? CreatedByUserId { get; set; }

    [ForeignKey(nameof(CreatedByUserId))]
    public AuthUser? CreatedBy { get; set; }
}
