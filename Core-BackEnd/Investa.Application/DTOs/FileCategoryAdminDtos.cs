using System.ComponentModel.DataAnnotations;

namespace Investa.Application.DTOs;

public sealed class FileCategoryAdminDto
{
    public int Id { get; init; }
    public string Code { get; init; } = string.Empty;
    public string NameEn { get; init; } = string.Empty;
    public string NameAr { get; init; } = string.Empty;
    public string? DescriptionEn { get; init; }
    public string? DescriptionAr { get; init; }
    public int SortOrder { get; init; }
    public bool IsActive { get; init; }
    public long MaxFileSizeBytes { get; init; }
    public IReadOnlyList<string> AllowedExtensions { get; init; } = Array.Empty<string>();
    public IReadOnlyList<string> AllowedMimeTypes { get; init; } = Array.Empty<string>();
    public int? MaxFilesPerEntity { get; init; }
    public int ReferenceCount { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime UpdatedAt { get; init; }
    public Guid? CreatedByUserId { get; init; }
    public Guid? UpdatedByUserId { get; init; }
}

public class CreateFileCategoryRequest
{
    [Required, StringLength(120)] public string NameEn { get; set; } = string.Empty;
    [Required, StringLength(120)] public string NameAr { get; set; } = string.Empty;
    [StringLength(500)] public string? DescriptionEn { get; set; }
    [StringLength(500)] public string? DescriptionAr { get; set; }
    [Range(0, int.MaxValue)] public int SortOrder { get; set; }
    [Range(1, long.MaxValue)] public long MaxFileSizeBytes { get; set; }
    [Required] public string AllowedExtensions { get; set; } = string.Empty;
    [Required] public string AllowedMimeTypes { get; set; } = string.Empty;
    [Range(1, int.MaxValue)] public int? MaxFilesPerEntity { get; set; }
}

public sealed class UpdateFileCategoryRequest : CreateFileCategoryRequest { }

public sealed class SetFileCategoryStatusRequest { public bool IsActive { get; set; } }

public sealed class FileStoragePolicyDto
{
    public long GlobalMaxFileSizeBytes { get; init; }
    public long DefaultUserQuotaBytes { get; init; }
    public long DefaultProjectQuotaBytes { get; init; }
    public DateTime UpdatedAt { get; init; }
}

public sealed class UpdateFileStoragePolicyRequest
{
    [Range(1, long.MaxValue)] public long GlobalMaxFileSizeBytes { get; set; }
    [Range(1, long.MaxValue)] public long DefaultUserQuotaBytes { get; set; }
    [Range(1, long.MaxValue)] public long DefaultProjectQuotaBytes { get; set; }
}
