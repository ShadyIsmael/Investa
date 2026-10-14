using Investa.Application.Interfaces;

namespace Investa.Application.Interfaces;

public record FileStoreMetadataDto
{
    public string FileId { get; init; } = string.Empty;
    public string FileKey { get; init; } = string.Empty;
    public string FileName { get; init; } = string.Empty;
    public string OriginalFileName { get; init; } = string.Empty;
    public string Extension { get; init; } = string.Empty;
    public string MimeType { get; init; } = string.Empty;
    public long FileSize { get; init; }
    public string Category { get; init; } = string.Empty;
    public string Url { get; init; } = string.Empty;
    public string? PreviewUrl { get; init; }
    public string? ThumbnailUrl { get; init; }
    public string? UploadedBy { get; init; }
    public DateTime UploadedAt { get; init; }
}

public interface IFileStorage
{
    Task<string> SaveFileAsync(string relativePath, Stream data, string contentType);
    Task<FileStoreUploadResult> UploadWithPolicyAsync(string categoryCode, string originalFileName, Stream data, string contentType, long declaredFileSize, FileStoreUploadPolicy policy, FileStoreUploadContext context, CancellationToken cancellationToken = default);
    Task<byte[]> ReadFileAsync(string storedPath, CancellationToken cancellationToken = default);

    Task<bool> DeleteFileAsync(string relativePath);

    Task EnsureDirectoryAsync(string relativeDirectory);

    Task<FileStoreMetadataDto?> GetFileMetadataAsync(string fileKey, CancellationToken cancellationToken = default);
}

public sealed record FileStoreUploadPolicy(long MaxFileSizeBytes, IReadOnlyCollection<string> AllowedExtensions, IReadOnlyCollection<string> AllowedMimeTypes);
public sealed record FileStoreUploadContext(Guid UserId, int? ProjectId, string? EntityType, string? EntityId);
public sealed record FileStoreUploadResult(string FileId, string FileKey, string FileName, string OriginalFileName, string Extension, string MimeType, long FileSize, string Category, string Url, string? PreviewUrl, string? ThumbnailUrl);
