using Investa.Application.Common;

namespace Investa.Application.Interfaces;

public sealed record FileUploadCommand(
    string CategoryCode,
    Stream Content,
    string OriginalFileName,
    string? ContentType,
    long DeclaredFileSize,
    Guid UserId,
    int? ProjectId = null,
    string? EntityType = null,
    string? EntityId = null,
    bool IsAdmin = false,
    bool BypassProjectAuthorization = false);

public sealed record FileUploadResult(
    string FileId,
    string FileKey,
    string FileName,
    string OriginalFileName,
    string Extension,
    string MimeType,
    long FileSize,
    string Category,
    string Url,
    string? PreviewUrl,
    string? ThumbnailUrl);

public interface IFileUploadService
{
    Task<FileUploadResult> UploadAsync(FileUploadCommand command, CancellationToken cancellationToken = default);
}
