using System.Net.Mime;
using Microsoft.Extensions.FileProviders;

var builder = WebApplication.CreateBuilder(args);

// ── Configuration ─────────────────────────────────────────────────────────────
var cfg = builder.Configuration;
var storagePath = Path.GetFullPath(cfg["Storage:RootPath"] ?? "Storage");
var apiKey      = cfg["Auth:ApiKey"] ?? "change-me";
var maxMb       = int.TryParse(cfg["Storage:MaxFileSizeMB"], out var mb) ? mb : 50;
var port        = int.TryParse(cfg["Server:Port"], out var p) ? p : 5240;

Directory.CreateDirectory(storagePath);

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

// ── Upload  POST /files/{category} ───────────────────────────────────────────
app.MapPost("/files/{category}", async (string category, HttpRequest request) =>
{
    category = SanitizeSegment(category);
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

        var dir = Path.Combine(storagePath, category);
        Directory.CreateDirectory(dir);

        var ext      = Path.GetExtension(file.FileName);
        var safeName = $"{DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()}_{Guid.NewGuid():N}{ext}";
        var fullPath = Path.Combine(dir, safeName);

        await using var fs = File.Create(fullPath);
        await file.CopyToAsync(fs);

        uploads.Add(new
        {
            fileName    = safeName,
            originalName = file.FileName,
            category,
            sizeBytes   = file.Length,
            contentType = file.ContentType,
            url         = $"/storage/{category}/{safeName}",
            uploadedAt  = DateTime.UtcNow
        });
    }

    return uploads.Count == 1 ? Results.Ok(uploads[0]) : Results.Ok(uploads);
});

// ── List   GET /files/{category} ─────────────────────────────────────────────
app.MapGet("/files/{category}", (string category) =>
{
    category = SanitizeSegment(category);
    var dir  = Path.Combine(storagePath, category);
    if (!Directory.Exists(dir))
        return Results.Ok(Array.Empty<object>());

    var files = Directory.GetFiles(dir)
        .Select(f =>
        {
            var info = new FileInfo(f);
            return new
            {
                fileName    = info.Name,
                category,
                sizeBytes   = info.Length,
                url         = $"/storage/{category}/{info.Name}",
                createdAt   = info.CreationTimeUtc
            };
        })
        .OrderByDescending(f => f.createdAt)
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

// ── Delete  DELETE /files/{category}/{filename} ───────────────────────────────
app.MapDelete("/files/{category}/{filename}", (string category, string filename) =>
{
    category = SanitizeSegment(category);
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
            var info  = Directory.GetFiles(dir, "*", SearchOption.AllDirectories);
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

