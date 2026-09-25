using System.Text.Json;
using System.Text.RegularExpressions;
using Investa.Application.Interfaces;
using Investa.Application.Common;
using Microsoft.Extensions.Logging;

namespace Investa.Infrastructure.Services;

public partial class DefaultFileValidationService : IFileValidationService
{
    private static readonly HashSet<string> AllowedExtensions = new(StringComparer.OrdinalIgnoreCase)
    {
        ".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp", ".svg",
        ".pdf", ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx",
        ".txt", ".csv", ".mp4", ".mov", ".avi", ".mkv", ".webm",
        ".zip", ".rar", ".7z"
    };

    private static readonly HashSet<string> BlockedExtensions = new(StringComparer.OrdinalIgnoreCase)
    {
        ".exe", ".bat", ".cmd", ".com", ".msi", ".scr", ".ps1", ".vbs",
        ".js", ".jse", ".wsf", ".wsh", ".vbe", ".hta", ".cpl", ".reg",
        ".sh", ".bash", ".dll", ".sys", ".app", ".jar", ".class",
        ".html", ".htm", ".xhtml", ".asp", ".aspx", ".php", ".jsp",
        ".cfm", ".shtm", ".shtml"
    };

    private static readonly HashSet<string> ExecutableMimePrefixes = new(StringComparer.OrdinalIgnoreCase)
    {
        "application/x-msdownload", "application/x-msdos-program",
        "application/x-msi", "application/x-bat", "application/x-sh",
        "application/x-csh", "application/x-ms-shortcut",
        "application/vnd.microsoft.portable-executable"
    };

    private static readonly HashSet<string> UnsafeMimeTypes = new(StringComparer.OrdinalIgnoreCase)
    {
        "text/html", "text/javascript", "application/javascript",
        "application/x-javascript", "text/ecmascript", "application/ecmascript"
    };

    private static readonly int MaxFileSizeBytes = 100 * 1024 * 1024;
    private static readonly int MaxFileNameLength = 200;
    private static readonly int MaxNameLength = 255;
    private static readonly int MaxDescriptionLength = 1000;
    private static readonly int MaxCategoryLength = 100;
    private static readonly int MaxSearchTagsLength = 1000;

    private static readonly char[] UnsafeFilenameChars = ['<', '>', ':', '"', '/', '\\', '|', '?', '*', '\0', '\n', '\r'];

    private static readonly Regex InvalidPathCharsRegex = BuildInvalidPathCharsRegex();

    private static readonly Lazy<JsonSerializerOptions> SafeJsonOptions = new(() => new JsonSerializerOptions
    {
        Encoder = System.Text.Encodings.Web.JavaScriptEncoder.UnsafeRelaxedJsonEscaping,
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        WriteIndented = false
    });

    private readonly ILogger<DefaultFileValidationService> _logger;

    public DefaultFileValidationService(ILogger<DefaultFileValidationService> logger)
    {
        _logger = logger;
    }

    public FileMetadataResult ValidateAndResolve(string fileKey, string? expectedPurpose = null)
    {
        if (string.IsNullOrWhiteSpace(fileKey))
            throw new BusinessValidationException("FILE_KEY_REQUIRED", "FileKey is required.");

        if (fileKey.Length > 500)
            throw new BusinessValidationException("INVALID_FILE_KEY", "FileKey is too long.");

        if (fileKey.Contains("..", StringComparison.Ordinal) || fileKey.Contains("//", StringComparison.Ordinal))
            throw new BusinessValidationException("INVALID_FILE_KEY", "FileKey contains path traversal characters.");

        var segments = fileKey.Split('/');
        if (segments.Length < 2)
            throw new BusinessValidationException("INVALID_FILE_KEY", "FileKey must contain category and filename.");

        var category = segments[0];
        var fileName = segments[^1];

        if (string.IsNullOrWhiteSpace(category) || string.IsNullOrWhiteSpace(fileName))
            throw new BusinessValidationException("INVALID_FILE_KEY", "FileKey must contain non-empty category and filename.");

        var ext = Path.GetExtension(fileName).ToLowerInvariant();
        if (!AllowedExtensions.Contains(ext))
            throw new BusinessValidationException("FILE_EXTENSION_NOT_ALLOWED", $"File extension '{ext}' is not allowed.");

        if (BlockedExtensions.Contains(ext))
            throw new BusinessValidationException("FILE_TYPE_BLOCKED", $"File type '{ext}' is blocked for security reasons.");

        if (fileName.Length > MaxFileNameLength)
            throw new BusinessValidationException("FILENAME_TOO_LONG", $"Filename exceeds maximum length of {MaxFileNameLength} characters.");

        foreach (var c in UnsafeFilenameChars)
        {
            if (fileName.Contains(c))
                throw new BusinessValidationException("UNSAFE_FILENAME", "Filename contains unsafe characters.");
        }

        if (InvalidPathCharsRegex.IsMatch(fileName))
            throw new BusinessValidationException("UNSAFE_FILENAME", "Filename contains invalid characters.");

        return new FileMetadataResult
        {
            FileKey = fileKey,
            FileId = Path.GetFileNameWithoutExtension(fileName),
            FileName = fileName,
            OriginalFileName = fileName,
            Extension = ext,
            MimeType = ResolveMimeType(ext),
            FileSize = 0,
            Url = $"/storage/{category}/{fileName}",
            PreviewUrl = SupportsPreview(ext) ? $"/storage/{category}/{fileName}" : null,
            ThumbnailUrl = IsImageExtension(ext) ? $"/storage/{category}/{fileName}" : null
        };
    }

    public void ValidateFileName(string fileName)
    {
        if (string.IsNullOrWhiteSpace(fileName))
            throw new BusinessValidationException("FILE_NAME_REQUIRED", "FileName is required.");

        if (fileName.Length > MaxNameLength)
            throw new BusinessValidationException("FILE_NAME_TOO_LONG", $"FileName exceeds maximum length of {MaxNameLength}.");

        var ext = Path.GetExtension(fileName).ToLowerInvariant();
        if (BlockedExtensions.Contains(ext))
            throw new BusinessValidationException("FILE_TYPE_BLOCKED", $"File type '{ext}' is blocked.");

        foreach (var c in UnsafeFilenameChars)
        {
            if (fileName.Contains(c))
                throw new BusinessValidationException("UNSAFE_FILENAME", "Filename contains unsafe characters.");
        }
    }

    public void ValidateMetadataSanitization(string? name, string? description, string? category, string? searchTags)
    {
        if (name != null && name.Length > MaxNameLength)
            throw new BusinessValidationException("NAME_TOO_LONG", $"Name exceeds maximum length of {MaxNameLength}.");

        if (description != null && description.Length > MaxDescriptionLength)
            throw new BusinessValidationException("DESCRIPTION_TOO_LONG", $"Description exceeds maximum length of {MaxDescriptionLength}.");

        if (category != null && category.Length > MaxCategoryLength)
            throw new BusinessValidationException("CATEGORY_TOO_LONG", $"Category exceeds maximum length of {MaxCategoryLength}.");

        if (searchTags != null && searchTags.Length > MaxSearchTagsLength)
            throw new BusinessValidationException("SEARCH_TAGS_TOO_LONG", $"SearchTags exceeds maximum length of {MaxSearchTagsLength}.");

        if (name != null && ContainsHtml(name))
            throw new BusinessValidationException("UNSAFE_METADATA", "Name contains unsafe HTML content.");

        if (description != null && ContainsHtml(description))
            throw new BusinessValidationException("UNSAFE_METADATA", "Description contains unsafe HTML content.");

        if (category != null && ContainsHtml(category))
            throw new BusinessValidationException("UNSAFE_METADATA", "Category contains unsafe HTML content.");

        if (searchTags != null && ContainsHtml(searchTags))
            throw new BusinessValidationException("UNSAFE_METADATA", "SearchTags contains unsafe HTML content.");
    }

    private static bool ContainsHtml(string value)
    {
        return value.Contains('<') && value.Contains('>');
    }

    private static string ResolveMimeType(string extension)
    {
        return extension.ToLowerInvariant() switch
        {
            ".jpg" or ".jpeg" => "image/jpeg",
            ".png" => "image/png",
            ".gif" => "image/gif",
            ".webp" => "image/webp",
            ".bmp" => "image/bmp",
            ".svg" => "image/svg+xml",
            ".pdf" => "application/pdf",
            ".doc" => "application/msword",
            ".docx" => "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            ".xls" => "application/vnd.ms-excel",
            ".xlsx" => "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            ".ppt" => "application/vnd.ms-powerpoint",
            ".pptx" => "application/vnd.openxmlformats-officedocument.presentationml.presentation",
            ".txt" => "text/plain",
            ".csv" => "text/csv",
            ".mp4" => "video/mp4",
            ".mov" => "video/quicktime",
            ".avi" => "video/x-msvideo",
            ".mkv" => "video/x-matroska",
            ".webm" => "video/webm",
            ".zip" => "application/zip",
            ".rar" => "application/vnd.rar",
            ".7z" => "application/x-7z-compressed",
            _ => "application/octet-stream"
        };
    }

    private static bool IsImageExtension(string extension)
    {
        return extension.ToLowerInvariant() is ".jpg" or ".jpeg" or ".png" or ".gif" or ".webp" or ".bmp" or ".svg";
    }

    private static bool SupportsPreview(string extension)
    {
        return IsImageExtension(extension)
            || extension is ".pdf" or ".txt" or ".csv"
            || extension is ".mp4" or ".mov" or ".avi" or ".mkv" or ".webm";
    }

    [GeneratedRegex("[\\x00-\\x1f\\x7f]")]
    private static partial Regex BuildInvalidPathCharsRegex();
}
