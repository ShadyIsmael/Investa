using System.ComponentModel.DataAnnotations;

namespace Investa.Domain.Entities;

/// <summary>Singleton platform-wide file governance policy.</summary>
public sealed class FileStoragePolicy
{
    [Key] public int Id { get; set; } = 1;
    public long GlobalMaxFileSizeBytes { get; set; }
    public long DefaultUserQuotaBytes { get; set; }
    public long DefaultProjectQuotaBytes { get; set; }
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public Guid? UpdatedByUserId { get; set; }
}
