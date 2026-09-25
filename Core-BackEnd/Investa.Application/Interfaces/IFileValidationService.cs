namespace Investa.Application.Interfaces;

public record FileMetadataResult
{
    public string FileKey { get; init; } = string.Empty;
    public string FileId { get; init; } = string.Empty;
    public string FileName { get; init; } = string.Empty;
    public string OriginalFileName { get; init; } = string.Empty;
    public string Extension { get; init; } = string.Empty;
    public string MimeType { get; init; } = string.Empty;
    public long FileSize { get; init; }
    public string Url { get; init; } = string.Empty;
    public string? PreviewUrl { get; init; }
    public string? ThumbnailUrl { get; init; }
}

public interface IFileValidationService
{
    FileMetadataResult ValidateAndResolve(string fileKey, string? expectedPurpose = null);

    void ValidateFileName(string fileName);

    void ValidateMetadataSanitization(string? name, string? description, string? category, string? searchTags);
}
