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

    [StringLength(30)]
    public string? ActorType { get; set; }

    [StringLength(100)]
    public string? RelatedEntityType { get; set; }

    [StringLength(100)]
    public string? RelatedEntityId { get; set; }

    [StringLength(2000)]
    public string? LocalizedMetadataJson { get; set; }

    [StringLength(200)]
    public string? IdempotencyKey { get; set; }

    public bool IsImmutableTimelineEntry { get; set; }

    public Opportunity? Opportunity { get; set; }
}
