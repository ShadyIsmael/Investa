using System.Net.Mime;
using System.Text.Json;
using Microsoft.AspNetCore.StaticFiles;
using Microsoft.Extensions.FileProviders;

var builder = WebApplication.CreateBuilder(args);

// ── Configuration ─────────────────────────────────────────────────────────────
var cfg = builder.Configuration;
var storagePath = Path.GetFullPath(cfg["Storage:RootPath"] ?? "Storage");
var apiKey      = cfg["Auth:ApiKey"] ?? "change-me";
var maxMb       = int.TryParse(cfg["Storage:MaxFileSizeMB"], out var mb) ? mb : 50;
var port        = int.TryParse(cfg["Server:Port"], out var p) ? p : 5240;

Directory.CreateDirectory(storagePath);
var contentTypeProvider = new FileExtensionContentTypeProvider();
var allowedExtensions = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
{
    ".jpg", ".jpeg", ".png", ".webp", ".gif",
    ".mp4", ".mov", ".avi", ".webm",
    ".pdf", ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx",
    ".txt", ".csv", ".rtf", ".zip", ".json"
};
var fileCategories = new[]
{
    new FileCategoryContract("OpportunityCover", "Opportunity cover image", "image"),
    new FileCategoryContract("OpportunityGallery", "Opportunity gallery image", "image"),
    new FileCategoryContract("OpportunityPublicDocument", "Public opportunity document", "document"),
    new FileCategoryContract("OpportunityPrivateDocument", "Private opportunity document", "document"),
    new FileCategoryContract("FinancialReport", "Financial reports and statements", "document"),
    new FileCategoryContract("Contract", "Contracts and agreements", "document"),
    new FileCategoryContract("Legal", "Legal and compliance documents", "document"),
    new FileCategoryContract("InternalFile", "Internal business files", "document"),
    new FileCategoryContract("ProjectUpdateMedia", "Project update media", "media"),
    new FileCategoryContract("Image", "General image", "image"),
    new FileCategoryContract("Video", "General video", "video"),
    new FileCategoryContract("PitchVideo", "Public pitch video", "video"),
    new FileCategoryContract("Presentation", "Presentation files", "document"),
    new FileCategoryContract("Spreadsheet", "Spreadsheet files", "document"),
    new FileCategoryContract("Archive", "Archive files", "archive"),
    new FileCategoryContract("General", "General business files", "general")
};

// ── Services ──────────────────────────────────────────────────────────────────
builder.Services.AddCors(o => o.AddPolicy("AllowAll", p =>
    p.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader()));

builder.WebHost.UseUrls($"http://0.0.0.0:{port}");

var app = builder.Build();
app.UseCors("AllowAll");

// ── Static file serving  (/storage/**) ───────────────────────────────────────
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider  = new PhysicalFileProvider(storagePath),
    RequestPath   = "/storage",
    ServeUnknownFileTypes = true,
    DefaultContentType    = MediaTypeNames.Application.Octet
});

// ── API-key middleware ────────────────────────────────────────────────────────
app.Use(async (ctx, next) =>
{
    // Skip static file paths and health
    if (ctx.Request.Path.StartsWithSegments("/storage") ||
        ctx.Request.Path.StartsWithSegments("/health"))
    {
        await next(ctx);
        return;
    }
    if (!ctx.Request.Headers.TryGetValue("X-Api-Key", out var key) || key != apiKey)
    {
        ctx.Response.StatusCode = 401;
        await ctx.Response.WriteAsJsonAsync(new { error = "Invalid or missing API key" });
        return;
    }
    await next(ctx);
});

// ── Health ────────────────────────────────────────────────────────────────────
app.MapGet("/health", () => Results.Ok(new { status = "ok", version = "1.0" }));

// File category catalog. Clients should discover supported categories here instead of hardcoding them.
app.MapGet("/categories", () => Results.Ok(fileCategories.OrderBy(c => c.Name)));

// ── Upload  POST /files/{category} ───────────────────────────────────────────
app.MapPost("/files/{category}", async (string category, HttpRequest request) =>
{
    category = NormalizeCategory(category, fileCategories);
    if (category.Length == 0)
        return Results.BadRequest(new { error = "Invalid category" });

    if (!request.HasFormContentType || !request.Form.Files.Any())
        return Results.BadRequest(new { error = "No file uploaded" });

    var uploads = new List<object>();

    foreach (var file in request.Form.Files)
    {
        if (file.Length == 0)
            continue;

        if (file.Length > maxMb * 1024L * 1024L)
            return Results.BadRequest(new { error = $"File exceeds {maxMb} MB limit" });

        var validationError = ValidateFile(file, allowedExtensions, contentTypeProvider);
        if (validationError is not null)
            return Results.BadRequest(new { error = validationError });

        var dir = Path.Combine(storagePath, category);
        Directory.CreateDirectory(dir);

        var ext      = Path.GetExtension(file.FileName).ToLowerInvariant();
        var safeName = $"{DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()}_{Guid.NewGuid():N}{ext}";
        var fullPath = Path.Combine(dir, safeName);

        await using var fs = File.Create(fullPath);
        await file.CopyToAsync(fs);

        var url = $"/storage/{category}/{safeName}";
        var mimeType = ResolveMimeType(safeName, file.ContentType, contentTypeProvider);
        var metadata = new FileMetadataContract(
            FileId: Guid.NewGuid().ToString("N"),
            FileKey: $"{category}/{safeName}",
            FileName: safeName,
            OriginalFileName: Path.GetFileName(file.FileName),
            Extension: ext,
            MimeType: mimeType,
            FileSize: file.Length,
            Category: category,
            Url: url,
            PreviewUrl: SupportsPreview(mimeType, ext) ? url : null,
            ThumbnailUrl: mimeType.StartsWith("image/", StringComparison.OrdinalIgnoreCase) ? url : null,
            Purpose: request.Form["purpose"].FirstOrDefault(),
            Visibility: request.Form["visibility"].FirstOrDefault(),
            UploadedBy: request.Form["uploadedBy"].FirstOrDefault() ?? request.Headers["X-User-Id"].FirstOrDefault(),
            UploadedAt: DateTime.UtcNow);

        await WriteMetadataAsync(fullPath, metadata);
        uploads.Add(ToUploadResponse(metadata));
    }

    return uploads.Count == 1 ? Results.Ok(uploads[0]) : Results.Ok(uploads);
});

// ── List   GET /files/{category} ─────────────────────────────────────────────
app.MapGet("/files/{category}", (string category) =>
{
    category = NormalizeCategory(category, fileCategories);
    var dir  = Path.Combine(storagePath, category);
    if (!Directory.Exists(dir))
        return Results.Ok(Array.Empty<object>());

    var files = Directory.GetFiles(dir)
        .Where(f => !f.EndsWith(".meta.json", StringComparison.OrdinalIgnoreCase))
        .Select(f =>
        {
            var info = new FileInfo(f);
            return ReadMetadataOrFallback(f, category, contentTypeProvider);
        })
        .OrderByDescending(f => f.UploadedAt)
        .Select(ToUploadResponse)
        .ToList();

    return Results.Ok(files);
});

// ── List all categories  GET /files ──────────────────────────────────────────
app.MapGet("/files", () =>
{
    if (!Directory.Exists(storagePath))
        return Results.Ok(Array.Empty<string>());

    var cats = Directory.GetDirectories(storagePath)
        .Select(d => Path.GetFileName(d))
        .OrderBy(n => n)
        .ToList();

    return Results.Ok(cats);
});

// Search metadata across categories, or within one category.
app.MapGet("/files/search", (string? category, string? q) =>
{
    var normalizedCategory = string.IsNullOrWhiteSpace(category) ? null : NormalizeCategory(category, fileCategories);
    var roots = normalizedCategory == null
        ? Directory.Exists(storagePath) ? Directory.GetDirectories(storagePath) : Array.Empty<string>()
        : [Path.Combine(storagePath, normalizedCategory)];

    var query = q?.Trim();
    var results = roots
        .Where(Directory.Exists)
        .SelectMany(Directory.GetFiles)
        .Where(f => !f.EndsWith(".meta.json", StringComparison.OrdinalIgnoreCase))
        .Select(f => ReadMetadataOrFallback(f, Path.GetFileName(Path.GetDirectoryName(f)) ?? "General", contentTypeProvider))
        .Where(m => string.IsNullOrWhiteSpace(query)
                    || m.FileName.Contains(query, StringComparison.OrdinalIgnoreCase)
                    || m.OriginalFileName.Contains(query, StringComparison.OrdinalIgnoreCase)
                    || m.Category.Contains(query, StringComparison.OrdinalIgnoreCase))
        .OrderByDescending(m => m.UploadedAt)
        .Select(ToUploadResponse)
        .ToList();

    return Results.Ok(results);
});

// Metadata  GET /files/{category}/{filename}/metadata
app.MapGet("/files/{category}/{filename}/metadata", (string category, string filename) =>
{
    var pathResult = ResolveStoredFilePath(storagePath, NormalizeCategory(category, fileCategories), filename);
    if (pathResult.Error is not null)
        return Results.BadRequest(new { error = pathResult.Error });

    if (!File.Exists(pathResult.Path))
        return Results.NotFound(new { error = "File not found" });

    var metadata = ReadMetadataOrFallback(pathResult.Path, NormalizeCategory(category, fileCategories), contentTypeProvider);
    return Results.Ok(ToUploadResponse(metadata));
});

// Download  GET /files/{category}/{filename}/download
app.MapGet("/files/{category}/{filename}/download", (string category, string filename) =>
{
    var normalizedCategory = NormalizeCategory(category, fileCategories);
    var pathResult = ResolveStoredFilePath(storagePath, normalizedCategory, filename);
    if (pathResult.Error is not null)
        return Results.BadRequest(new { error = pathResult.Error });

    if (!File.Exists(pathResult.Path))
        return Results.NotFound(new { error = "File not found" });

    var metadata = ReadMetadataOrFallback(pathResult.Path, normalizedCategory, contentTypeProvider);
    return Results.File(pathResult.Path, metadata.MimeType, metadata.OriginalFileName);
});

// Preview  GET /files/{category}/{filename}/preview
app.MapGet("/files/{category}/{filename}/preview", (string category, string filename) =>
{
    var normalizedCategory = NormalizeCategory(category, fileCategories);
    var pathResult = ResolveStoredFilePath(storagePath, normalizedCategory, filename);
    if (pathResult.Error is not null)
        return Results.BadRequest(new { error = pathResult.Error });

    if (!File.Exists(pathResult.Path))
        return Results.NotFound(new { error = "File not found" });

    var metadata = ReadMetadataOrFallback(pathResult.Path, normalizedCategory, contentTypeProvider);
    if (!SupportsPreview(metadata.MimeType, metadata.Extension))
        return Results.BadRequest(new { error = "Preview is not supported for this file type" });

    return Results.File(pathResult.Path, metadata.MimeType, enableRangeProcessing: true);
});

// ── Delete  DELETE /files/{category}/{filename} ───────────────────────────────
app.MapDelete("/files/{category}/{filename}", (string category, string filename) =>
{
    category = NormalizeCategory(category, fileCategories);
    filename = SanitizeSegment(filename);

    if (category.Length == 0 || filename.Length == 0)
        return Results.BadRequest(new { error = "Invalid path" });

    var fullPath = Path.Combine(storagePath, category, filename);

    // Prevent path traversal
    var expectedBase = Path.GetFullPath(Path.Combine(storagePath, category));
    var resolved     = Path.GetFullPath(fullPath);
    if (!resolved.StartsWith(expectedBase))
        return Results.BadRequest(new { error = "Invalid path" });

    if (!File.Exists(fullPath))
        return Results.NotFound(new { error = "File not found" });

    File.Delete(fullPath);
    var metadataPath = GetMetadataPath(fullPath);
    if (File.Exists(metadataPath))
        File.Delete(metadataPath);

    return Results.Ok(new { deleted = filename });
});

// ── Stats  GET /stats ─────────────────────────────────────────────────────────
app.MapGet("/stats", () =>
{
    var totalFiles = 0L;
    var totalBytes = 0L;
    var categories = new List<object>();

    if (Directory.Exists(storagePath))
    {
        foreach (var dir in Directory.GetDirectories(storagePath))
        {
            var info  = Directory.GetFiles(dir, "*", SearchOption.AllDirectories)
                .Where(f => !f.EndsWith(".meta.json", StringComparison.OrdinalIgnoreCase))
                .ToArray();
            var bytes = info.Sum(f => new FileInfo(f).Length);
            totalFiles += info.Length;
            totalBytes += bytes;
            categories.Add(new { category = Path.GetFileName(dir), fileCount = info.Length, sizeBytes = bytes });
        }
    }

    return Results.Ok(new { totalFiles, totalSizeBytes = totalBytes, categories });
});

// ── Profile picture  POST /users/{userId}/profile-picture ────────────────────
// Accepts image/*. Replaces any existing profile picture for that user.
app.MapPost("/users/{userId}/profile-picture", async (string userId, HttpRequest request) =>
{
    userId = SanitizeSegment(userId);
    if (userId.Length == 0)
        return Results.BadRequest(new { error = "Invalid userId" });

    if (!request.HasFormContentType || !request.Form.Files.Any())
        return Results.BadRequest(new { error = "No file uploaded" });

    var file = request.Form.Files.First();
    if (file.Length == 0)
        return Results.BadRequest(new { error = "Empty file" });

    if (file.Length > maxMb * 1024L * 1024L)
        return Results.BadRequest(new { error = $"File exceeds {maxMb} MB limit" });

    // Only allow image types
    var allowed = new[] { "image/jpeg", "image/png", "image/webp", "image/gif" };
    if (!allowed.Contains(file.ContentType.ToLowerInvariant()))
        return Results.BadRequest(new { error = "Only JPEG, PNG, WebP or GIF images are accepted" });

    var dir = Path.Combine(storagePath, "profiles", userId);
    Directory.CreateDirectory(dir);

    // Delete any existing profile picture for this user
    foreach (var old in Directory.GetFiles(dir))
        File.Delete(old);

    var ext      = Path.GetExtension(file.FileName).ToLowerInvariant();
    if (string.IsNullOrEmpty(ext)) ext = ".jpg";
    var safeName = $"avatar{ext}";
    var fullPath = Path.Combine(dir, safeName);

    await using var fs = File.Create(fullPath);
    await file.CopyToAsync(fs);

    return Results.Ok(new
    {
        userId,
        fileName    = safeName,
        contentType = file.ContentType,
        sizeBytes   = file.Length,
        url         = $"/storage/profiles/{userId}/{safeName}",
        uploadedAt  = DateTime.UtcNow
    });
});

// ── Get profile picture info  GET /users/{userId}/profile-picture ─────────────
app.MapGet("/users/{userId}/profile-picture", (string userId) =>
{
    userId = SanitizeSegment(userId);
    if (userId.Length == 0)
        return Results.BadRequest(new { error = "Invalid userId" });

    var dir = Path.Combine(storagePath, "profiles", userId);
    if (!Directory.Exists(dir))
        return Results.NotFound(new { error = "No profile picture found" });

    var file = Directory.GetFiles(dir).FirstOrDefault();
    if (file is null)
        return Results.NotFound(new { error = "No profile picture found" });

    var info = new FileInfo(file);
    return Results.Ok(new
    {
        userId,
        fileName  = info.Name,
        sizeBytes = info.Length,
        url       = $"/storage/profiles/{userId}/{info.Name}",
        uploadedAt = info.LastWriteTimeUtc
    });
});

// ── Delete profile picture  DELETE /users/{userId}/profile-picture ─────────────
app.MapDelete("/users/{userId}/profile-picture", (string userId) =>
{
    userId = SanitizeSegment(userId);
    if (userId.Length == 0)
        return Results.BadRequest(new { error = "Invalid userId" });

    var dir = Path.Combine(storagePath, "profiles", userId);
    if (!Directory.Exists(dir))
        return Results.NotFound(new { error = "No profile picture found" });

    var files = Directory.GetFiles(dir);
    if (files.Length == 0)
        return Results.NotFound(new { error = "No profile picture found" });

    foreach (var f in files) File.Delete(f);

    return Results.Ok(new { userId, deleted = true });
});

// ── Upload national ID  POST /users/{userId}/national-id -----------------------
// Stores national ID images under /storage/profiles/{userId}/national-id/
app.MapPost("/users/{userId}/national-id", async (string userId, HttpRequest request) =>
{
    userId = SanitizeSegment(userId);
    if (userId.Length == 0)
        return Results.BadRequest(new { error = "Invalid userId" });

    if (!request.HasFormContentType || !request.Form.Files.Any())
        return Results.BadRequest(new { error = "No file uploaded" });

    var file = request.Form.Files.First();
    if (file.Length == 0)
        return Results.BadRequest(new { error = "Empty file" });

    if (file.Length > maxMb * 1024L * 1024L)
        return Results.BadRequest(new { error = $"File exceeds {maxMb} MB limit" });

    // Only allow image types
    var allowed = new[] { "image/jpeg", "image/png", "image/webp", "image/gif" };
    if (!allowed.Contains(file.ContentType.ToLowerInvariant()))
        return Results.BadRequest(new { error = "Only JPEG, PNG, WebP or GIF images are accepted" });

    var dir = Path.Combine(storagePath, "profiles", userId, "national-id");
    Directory.CreateDirectory(dir);

    var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
    if (string.IsNullOrEmpty(ext)) ext = ".jpg";
    var safeName = $"{DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()}_{Guid.NewGuid():N}{ext}";
    var fullPath = Path.Combine(dir, safeName);

    await using var fs = File.Create(fullPath);
    await file.CopyToAsync(fs);

    return Results.Ok(new
    {
        userId,
        fileName = safeName,
        contentType = file.ContentType,
        sizeBytes = file.Length,
        url = $"/storage/profiles/{userId}/national-id/{safeName}",
        uploadedAt = DateTime.UtcNow
    });
});

// ── List national ID files  GET /users/{userId}/national-id --------------------
app.MapGet("/users/{userId}/national-id", (string userId) =>
{
    userId = SanitizeSegment(userId);
    if (userId.Length == 0)
        return Results.BadRequest(new { error = "Invalid userId" });

    var dir = Path.Combine(storagePath, "profiles", userId, "national-id");
    if (!Directory.Exists(dir))
        return Results.Ok(Array.Empty<object>());

    var files = Directory.GetFiles(dir)
        .Select(f =>
        {
            var info = new FileInfo(f);
            return new
            {
                fileName = info.Name,
                sizeBytes = info.Length,
                url = $"/storage/profiles/{userId}/national-id/{info.Name}",
                createdAt = info.LastWriteTimeUtc
            };
        })
        .OrderByDescending(f => f.createdAt)
        .ToList();

    return Results.Ok(files);
});

// ── Delete national ID file  DELETE /users/{userId}/national-id/{filename} ----
app.MapDelete("/users/{userId}/national-id/{filename}", (string userId, string filename) =>
{
    userId = SanitizeSegment(userId);
    filename = SanitizeSegment(filename);

    if (userId.Length == 0 || filename.Length == 0)
        return Results.BadRequest(new { error = "Invalid path" });

    var fullPath = Path.Combine(storagePath, "profiles", userId, "national-id", filename);

    var expectedBase = Path.GetFullPath(Path.Combine(storagePath, "profiles", userId, "national-id"));
    var resolved = Path.GetFullPath(fullPath);
    if (!resolved.StartsWith(expectedBase))
        return Results.BadRequest(new { error = "Invalid path" });

    if (!File.Exists(fullPath))
        return Results.NotFound(new { error = "File not found" });

    File.Delete(fullPath);
    return Results.Ok(new { userId, deleted = filename });
});

app.Run();

// ── Helpers ───────────────────────────────────────────────────────────────────
static string SanitizeSegment(string segment) =>
    Path.GetFileName(segment.Replace("..", "").Replace("/", "").Replace("\\", "").Trim());

static string NormalizeCategory(string category, IReadOnlyCollection<FileCategoryContract> knownCategories)
{
    var sanitized = SanitizeSegment(category);
    var known = knownCategories.FirstOrDefault(c => string.Equals(c.Name, sanitized, StringComparison.OrdinalIgnoreCase));
    return known?.Name ?? sanitized;
}

static string? ValidateFile(IFormFile file, ISet<string> allowedExtensions, FileExtensionContentTypeProvider contentTypeProvider)
{
    var originalName = Path.GetFileName(file.FileName);
    var ext = Path.GetExtension(originalName).ToLowerInvariant();
    if (string.IsNullOrWhiteSpace(ext) || !allowedExtensions.Contains(ext))
        return $"File extension '{ext}' is not allowed";

    var mimeType = ResolveMimeType(originalName, file.ContentType, contentTypeProvider);
    if (string.IsNullOrWhiteSpace(mimeType) || mimeType.Equals("application/x-msdownload", StringComparison.OrdinalIgnoreCase))
        return "File content type is not allowed";

    if (mimeType.Contains("javascript", StringComparison.OrdinalIgnoreCase)
        || mimeType.Equals("text/html", StringComparison.OrdinalIgnoreCase))
        return "Unsafe file content type is not allowed";

    return null;
}

static string ResolveMimeType(string fileName, string? suppliedContentType, FileExtensionContentTypeProvider contentTypeProvider)
{
    if (contentTypeProvider.TryGetContentType(fileName, out var detected))
        return detected;

    return string.IsNullOrWhiteSpace(suppliedContentType)
        ? MediaTypeNames.Application.Octet
        : suppliedContentType;
}

static bool SupportsPreview(string mimeType, string extension)
{
    return mimeType.StartsWith("image/", StringComparison.OrdinalIgnoreCase)
        || mimeType.StartsWith("video/", StringComparison.OrdinalIgnoreCase)
        || mimeType.Equals("application/pdf", StringComparison.OrdinalIgnoreCase)
        || extension.Equals(".txt", StringComparison.OrdinalIgnoreCase)
        || extension.Equals(".csv", StringComparison.OrdinalIgnoreCase);
}

static string GetMetadataPath(string fullPath) => $"{fullPath}.meta.json";

static async Task WriteMetadataAsync(string fullPath, FileMetadataContract metadata)
{
    var json = JsonSerializer.Serialize(metadata, new JsonSerializerOptions { WriteIndented = true });
    await File.WriteAllTextAsync(GetMetadataPath(fullPath), json);
}

static FileMetadataContract ReadMetadataOrFallback(
    string fullPath,
    string category,
    FileExtensionContentTypeProvider contentTypeProvider)
{
    var metadataPath = GetMetadataPath(fullPath);
    if (File.Exists(metadataPath))
    {
        try
        {
            var json = File.ReadAllText(metadataPath);
            var metadata = JsonSerializer.Deserialize<FileMetadataContract>(json);
            if (metadata is not null)
                return metadata;
        }
        catch
        {
            // Fall back to filesystem metadata if sidecar metadata is unreadable.
        }
    }

    var info = new FileInfo(fullPath);
    var ext = info.Extension.ToLowerInvariant();
    var mimeType = ResolveMimeType(info.Name, null, contentTypeProvider);
    var url = $"/storage/{category}/{info.Name}";
    return new FileMetadataContract(
        FileId: Path.GetFileNameWithoutExtension(info.Name),
        FileKey: $"{category}/{info.Name}",
        FileName: info.Name,
        OriginalFileName: info.Name,
        Extension: ext,
        MimeType: mimeType,
        FileSize: info.Length,
        Category: category,
        Url: url,
        PreviewUrl: SupportsPreview(mimeType, ext) ? url : null,
        ThumbnailUrl: mimeType.StartsWith("image/", StringComparison.OrdinalIgnoreCase) ? url : null,
        Purpose: null,
        Visibility: null,
        UploadedBy: null,
        UploadedAt: info.CreationTimeUtc);
}

static object ToUploadResponse(FileMetadataContract metadata) => new
{
    metadata.FileId,
    metadata.FileKey,
    metadata.FileName,
    metadata.OriginalFileName,
    originalName = metadata.OriginalFileName,
    metadata.Extension,
    metadata.MimeType,
    contentType = metadata.MimeType,
    metadata.FileSize,
    sizeBytes = metadata.FileSize,
    metadata.Category,
    metadata.Url,
    metadata.PreviewUrl,
    metadata.ThumbnailUrl,
    metadata.Purpose,
    metadata.Visibility,
    metadata.UploadedBy,
    metadata.UploadedAt,
    createdAt = metadata.UploadedAt
};

static (string? Path, string? Error) ResolveStoredFilePath(string storagePath, string category, string filename)
{
    category = SanitizeSegment(category);
    filename = SanitizeSegment(filename);

    if (category.Length == 0 || filename.Length == 0 || filename.EndsWith(".meta.json", StringComparison.OrdinalIgnoreCase))
        return (null, "Invalid path");

    var expectedBase = Path.GetFullPath(Path.Combine(storagePath, category));
    var fullPath = Path.Combine(expectedBase, filename);
    var resolved = Path.GetFullPath(fullPath);

    if (!resolved.StartsWith(expectedBase, StringComparison.OrdinalIgnoreCase))
        return (null, "Invalid path");

    return (resolved, null);
}

public sealed record FileCategoryContract(string Name, string Description, string Kind);

public sealed record FileMetadataContract(
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
    string? ThumbnailUrl,
    string? Purpose,
    string? Visibility,
    string? UploadedBy,
    DateTime UploadedAt);

