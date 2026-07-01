using System.ComponentModel.DataAnnotations;
using Investa.Domain.Entities.Enums;

namespace Investa.Domain.Entities;

public class OpportunityDocument
{
    public int Id { get; set; }

    public int OpportunityId { get; set; }

    [Required]
    [StringLength(1000)]
    public string FileUrl { get; set; } = string.Empty;

    [StringLength(100)]
    public string? FileId { get; set; }

    [StringLength(500)]
    public string? FileKey { get; set; }

    [Required]
    [StringLength(255)]
    public string FileName { get; set; } = string.Empty;

    [Required]
    [StringLength(20)]
    public string FileExtension { get; set; } = string.Empty;

    [StringLength(150)]
    public string? MimeType { get; set; }

    public long? FileSize { get; set; }

    [StringLength(1000)]
    public string? PreviewUrl { get; set; }

    [StringLength(1000)]
    public string? ThumbnailUrl { get; set; }

    [Required]
    [StringLength(100)]
    public string DocumentType { get; set; } = string.Empty;

    public OpportunityDocumentVisibility Visibility { get; set; } = OpportunityDocumentVisibility.Private;

    public OpportunityFilePurpose Purpose { get; set; } = OpportunityFilePurpose.General;

    [StringLength(100)]
    public string? Category { get; set; }

    [StringLength(1000)]
    public string? SearchTags { get; set; }

    public Guid CreatedByUserId { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Opportunity? Opportunity { get; set; }
}
