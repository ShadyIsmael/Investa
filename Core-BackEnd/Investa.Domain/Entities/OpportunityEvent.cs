using System.ComponentModel.DataAnnotations;

namespace Investa.Domain.Entities;

public class OpportunityEvent
{
    public int Id { get; set; }

    public int OpportunityId { get; set; }

    [Required]
    [StringLength(100)]
    public string EventType { get; set; } = string.Empty;

    [Required]
    [StringLength(200)]
    public string Title { get; set; } = string.Empty;

    [StringLength(4000)]
    public string? Description { get; set; }

    [StringLength(4000)]
    public string? OldValue { get; set; }

    [StringLength(4000)]
    public string? NewValue { get; set; }

    public Guid CreatedByUserId { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public bool IsPublic { get; set; }

    public Opportunity? Opportunity { get; set; }
}
