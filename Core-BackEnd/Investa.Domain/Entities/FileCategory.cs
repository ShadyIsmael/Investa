using System.ComponentModel.DataAnnotations;

namespace Investa.Domain.Entities;

/// <summary>
/// Canonical, admin-managed upload category and its server-side validation policy.
/// Extensions and MIME types are stored as normalized comma-separated values to
/// keep the policy in one database-owned source while remaining easy to project.
/// </summary>
public sealed class FileCategory
{
    public int Id { get; set; }

    [Required, StringLength(80)] public string Code { get; set; } = string.Empty;
    [Required, StringLength(120)] public string NameEn { get; set; } = string.Empty;
    [Required, StringLength(120)] public string NameAr { get; set; } = string.Empty;
    [StringLength(500)] public string? DescriptionEn { get; set; }
    [StringLength(500)] public string? DescriptionAr { get; set; }
    public int SortOrder { get; set; }
    public bool IsActive { get; set; } = true;
    public long MaxFileSizeBytes { get; set; }
    [Required, StringLength(2000)] public string AllowedExtensions { get; set; } = string.Empty;
    [Required, StringLength(4000)] public string AllowedMimeTypes { get; set; } = string.Empty;
    public int? MaxFilesPerEntity { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public Guid? CreatedByUserId { get; set; }
    public Guid? UpdatedByUserId { get; set; }
}
