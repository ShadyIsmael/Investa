using Investa.Application.Common;
using Investa.Application.Interfaces;
using Investa.Domain.Entities;

namespace Investa.Application.Services;

public sealed class FileUploadService(IUnitOfWork uow, IFileStorage storage) : IFileUploadService
{
    private static readonly SemaphoreSlim UploadGate = new(1, 1);
    private static readonly IReadOnlyDictionary<string, string> MimeByExtension = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
    {
        [".jpg"] = "image/jpeg", [".jpeg"] = "image/jpeg", [".png"] = "image/png", [".webp"] = "image/webp", [".gif"] = "image/gif",
        [".pdf"] = "application/pdf", [".doc"] = "application/msword", [".docx"] = "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        [".xls"] = "application/vnd.ms-excel", [".xlsx"] = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", [".ppt"] = "application/vnd.ms-powerpoint",
        [".pptx"] = "application/vnd.openxmlformats-officedocument.presentationml.presentation", [".txt"] = "text/plain", [".csv"] = "text/csv",
        [".mp4"] = "video/mp4", [".mov"] = "video/quicktime", [".webm"] = "video/webm", [".zip"] = "application/zip"
    };

    public async Task<FileUploadResult> UploadAsync(FileUploadCommand command, CancellationToken cancellationToken = default)
    {
        var categoryCode = NormalizeCode(command.CategoryCode);
        var category = await uow.Repository<FileCategory>().GetSingleAsync(x => x.Code == categoryCode);
        if (category is null || !category.IsActive) throw new BusinessValidationException("FILE_CATEGORY_INACTIVE", "The selected file category is not available for new uploads.");

        var policy = await uow.Repository<FileStoragePolicy>().GetByIdAsync(1) ?? throw new BusinessValidationException("FILE_STORAGE_POLICY_MISSING", "File storage policy is not configured.");
        var effectiveLimit = Math.Min(policy.GlobalMaxFileSizeBytes, category.MaxFileSizeBytes);
        if (command.DeclaredFileSize <= 0) throw new BusinessValidationException("FILE_SIZE_REQUIRED", "File size is required.");
        if (command.DeclaredFileSize > effectiveLimit) throw new BusinessValidationException("FILE_SIZE_LIMIT_EXCEEDED", $"File exceeds the effective limit of {effectiveLimit} bytes.");
        if (!command.Content.CanSeek || command.Content.Length != command.DeclaredFileSize) throw new BusinessValidationException("FILE_SIZE_MISMATCH", "Declared and received file sizes do not match.");

        var originalName = Path.GetFileName(command.OriginalFileName);
        var extension = Path.GetExtension(originalName).ToLowerInvariant();
        if (string.IsNullOrWhiteSpace(originalName) || originalName.Length > 255 || extension.Length == 0 || !Split(category.AllowedExtensions).Contains(extension, StringComparer.OrdinalIgnoreCase))
            throw new BusinessValidationException("FILE_EXTENSION_NOT_ALLOWED", "The file extension is not allowed for this category.");
        if (originalName.Contains("..", StringComparison.Ordinal) || originalName.Any(c => c is '<' or '>' or ':' or '"' or '/' or '\\' or '|' or '?' or '*' || c < 32))
            throw new BusinessValidationException("UNSAFE_FILENAME", "The filename contains unsafe characters.");
        if (!MimeByExtension.TryGetValue(extension, out var detectedMime) || !Split(category.AllowedMimeTypes).Contains(detectedMime, StringComparer.OrdinalIgnoreCase))
            throw new BusinessValidationException("FILE_MIME_NOT_ALLOWED", "The file MIME type is not allowed for this category.");
        if (!string.IsNullOrWhiteSpace(command.ContentType) && !command.ContentType.Equals("application/octet-stream", StringComparison.OrdinalIgnoreCase) && !command.ContentType.Equals(detectedMime, StringComparison.OrdinalIgnoreCase))
            throw new BusinessValidationException("FILE_MIME_MISMATCH", "The supplied MIME type does not match the file extension.");

        if (command.ProjectId.HasValue)
        {
            var project = await uow.Repository<Project>().GetByIdAsync(command.ProjectId.Value);
            if (project is null) throw new BusinessValidationException("PROJECT_NOT_FOUND", "The associated project was not found.");
            if (!command.IsAdmin && !command.BypassProjectAuthorization && project.FounderId != command.UserId) throw new BusinessValidationException("FILE_CONTEXT_UNAUTHORIZED", "You are not authorized to upload files for this project.");
        }

        await UploadGate.WaitAsync(cancellationToken);
        try
        {
            var activeFiles = (await uow.Repository<StoredFile>().FindAsync(x => !x.IsDeleted)).ToList();
            var userBytes = activeFiles.Where(x => x.UploadedByUserId == command.UserId).Sum(x => x.FileSizeBytes);
            if (userBytes + command.DeclaredFileSize > policy.DefaultUserQuotaBytes) throw new BusinessValidationException("USER_STORAGE_QUOTA_EXCEEDED", "The user storage quota has been exceeded.");
            if (command.ProjectId.HasValue)
            {
                var projectBytes = activeFiles.Where(x => x.ProjectId == command.ProjectId.Value).Sum(x => x.FileSizeBytes);
                if (projectBytes + command.DeclaredFileSize > policy.DefaultProjectQuotaBytes) throw new BusinessValidationException("PROJECT_STORAGE_QUOTA_EXCEEDED", "The project storage quota has been exceeded.");
            }
            if (category.MaxFilesPerEntity.HasValue && !string.IsNullOrWhiteSpace(command.EntityType) && !string.IsNullOrWhiteSpace(command.EntityId))
            {
                var count = activeFiles.Count(x => x.CategoryCode == category.Code && x.EntityType == command.EntityType && x.EntityId == command.EntityId);
                if (count >= category.MaxFilesPerEntity.Value) throw new BusinessValidationException("FILE_COUNT_LIMIT_EXCEEDED", "The configured file-count limit has been exceeded.");
            }

            if (command.Content.Position != 0) command.Content.Position = 0;
            var stored = await storage.UploadWithPolicyAsync(category.Code, originalName, command.Content, detectedMime, command.DeclaredFileSize, new FileStoreUploadPolicy(effectiveLimit, Split(category.AllowedExtensions), Split(category.AllowedMimeTypes)), new FileStoreUploadContext(command.UserId, command.ProjectId, command.EntityType, command.EntityId), cancellationToken);
            var ledger = new StoredFile { FileId = stored.FileId, FileKey = stored.FileKey, CategoryCode = category.Code, OriginalFileName = originalName, Extension = stored.Extension, MimeType = stored.MimeType, FileSizeBytes = stored.FileSize, UploadedByUserId = command.UserId, ProjectId = command.ProjectId, EntityType = Normalize(command.EntityType), EntityId = Normalize(command.EntityId), CreatedAt = DateTime.UtcNow };
            await uow.Repository<StoredFile>().AddAsync(ledger);
            await uow.SaveChangesAsync();
            return new FileUploadResult(stored.FileId, stored.FileKey, stored.FileName, stored.OriginalFileName, stored.Extension, stored.MimeType, stored.FileSize, stored.Category, stored.Url, stored.PreviewUrl, stored.ThumbnailUrl);
        }
        finally { UploadGate.Release(); }
    }

    private static string NormalizeCode(string value) => value.Trim().ToUpperInvariant();
    private static string? Normalize(string? value) => string.IsNullOrWhiteSpace(value) ? null : value.Trim();
    private static string[] Split(string? value) => (value ?? string.Empty).Split([',', ';', '\n', '\r'], StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
}
