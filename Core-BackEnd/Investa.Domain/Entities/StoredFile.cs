using System.ComponentModel.DataAnnotations;

namespace Investa.Domain.Entities;

/// <summary>
/// Backend-owned upload ledger used for quota enforcement and category references.
/// A deleted row is retained for audit but does not count toward quotas.
/// </summary>
public sealed class StoredFile
{
    public long Id { get; set; }
    [Required, StringLength(64)] public string FileId { get; set; } = string.Empty;
    [Required, StringLength(500)] public string FileKey { get; set; } = string.Empty;
    [Required, StringLength(80)] public string CategoryCode { get; set; } = string.Empty;
    [Required, StringLength(255)] public string OriginalFileName { get; set; } = string.Empty;
    [Required, StringLength(20)] public string Extension { get; set; } = string.Empty;
    [Required, StringLength(150)] public string MimeType { get; set; } = string.Empty;
    public long FileSizeBytes { get; set; }
    public Guid UploadedByUserId { get; set; }
    public int? ProjectId { get; set; }
    [StringLength(80)] public string? EntityType { get; set; }
    [StringLength(100)] public string? EntityId { get; set; }
    public bool IsDeleted { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? DeletedAt { get; set; }
}
