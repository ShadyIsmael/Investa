using System.IO;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text.Json;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Investa.Application.Interfaces;

namespace Investa.Infrastructure.Services;

/// <summary>
/// IFileStorage implementation that proxies all file operations to the centralized
/// Investa.FileStore microservice. This is the SINGLE source of truth for all file
/// storage across the platform — no more local wwwroot file storage.
/// </summary>
public class FileStoreStorage : IFileStorage
{
    private readonly HttpClient _http;
    private readonly string _baseUrl;
    private readonly string _apiKey;
    private readonly ILogger<FileStoreStorage> _logger;

    public FileStoreStorage(HttpClient http, IConfiguration config, ILogger<FileStoreStorage> logger)
    {
        _http = http;
        _logger = logger;

        _baseUrl = (config["FileStore:BaseUrl"]
            ?? throw new InvalidOperationException("Required configuration 'FileStore:BaseUrl' is missing."))
            .TrimEnd('/');
        _apiKey = config["FileStore:ApiKey"]
            ?? throw new InvalidOperationException("Required secret 'FileStore:ApiKey' is missing.");

        _http.DefaultRequestHeaders.Remove("X-Api-Key");
        _http.DefaultRequestHeaders.Add("X-Api-Key", _apiKey);
    }

    /// <summary>
    /// Saves the provided stream to Investa.FileStore under the appropriate category.
    /// The relative path (e.g. "uploads/investments/1/123_img.jpg") is converted to:
    ///   Category: "investments-1"  (directory segments joined with '-')
    ///   Filename: "123_img.jpg"    (the file name portion)
    /// Returns the public URL path relative to the FileStore root (e.g. "/storage/investments-1/123_img.jpg").
    /// </summary>
    public async Task<string> SaveFileAsync(string relativePath, Stream data, string contentType)
    {
        var normalized = relativePath.Replace("\\", "/").TrimStart('/');
        var lastSlash = normalized.LastIndexOf('/');
        var category = lastSlash >= 0
            ? normalized[..lastSlash].Replace('/', '-')
            : "general";
        var fileName = lastSlash >= 0 ? normalized[(lastSlash + 1)..] : normalized;

        var url = $"{_baseUrl}/files/{Uri.EscapeDataString(category)}";

        using var content = new MultipartFormDataContent();
        var streamContent = new StreamContent(data);
        streamContent.Headers.ContentType = new MediaTypeHeaderValue(contentType);
        content.Add(streamContent, "file", fileName);

        var response = await _http.PostAsync(url, content);
        var body = await response.Content.ReadAsStringAsync();

        if (!response.IsSuccessStatusCode)
        {
            _logger.LogError("FileStore upload failed ({Status}): {Body}", response.StatusCode, body);
            throw new IOException($"FileStore upload failed: {response.StatusCode}");
        }

        using var doc = JsonDocument.Parse(body);
        var fileUrl = doc.RootElement.GetProperty("url").GetString()
                      ?? throw new IOException("FileStore response missing 'url' field");

        _logger.LogInformation("File saved via FileStore: {Category}/{File} → {Url}", category, fileName, fileUrl);
        return fileUrl;
    }

    public async Task<byte[]> ReadFileAsync(string storedPath, CancellationToken cancellationToken = default)
    {
        var url = Uri.TryCreate(storedPath, UriKind.Absolute, out var absolute)
            ? absolute.ToString()
            : $"{_baseUrl}/{storedPath.TrimStart('/')}";
        using var response = await _http.GetAsync(url, cancellationToken);
        if (!response.IsSuccessStatusCode)
            throw new IOException($"FileStore download failed: {response.StatusCode}");
        return await response.Content.ReadAsByteArrayAsync(cancellationToken);
    }

    /// <summary>
    /// Deletes a file from Investa.FileStore by converting the relative path to category + filename.
    /// </summary>
    public async Task<bool> DeleteFileAsync(string relativePath)
    {
        try
        {
            var normalized = relativePath.Replace("\\", "/").TrimStart('/');
            var lastSlash = normalized.LastIndexOf('/');
            var category = lastSlash >= 0
                ? normalized[..lastSlash].Replace('/', '-')
                : "general";
            var fileName = lastSlash >= 0 ? normalized[(lastSlash + 1)..] : normalized;

            var url = $"{_baseUrl}/files/{Uri.EscapeDataString(category)}/{Uri.EscapeDataString(fileName)}";
            var response = await _http.DeleteAsync(url);

            if (response.IsSuccessStatusCode)
            {
                _logger.LogInformation("File deleted via FileStore: {Category}/{File}", category, fileName);
                return true;
            }

            _logger.LogWarning("FileStore delete returned {Status} for {Path}", response.StatusCode, relativePath);
            return response.StatusCode == System.Net.HttpStatusCode.NotFound; // not found = effectively deleted
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to delete file via FileStore: {Path}", relativePath);
            return false;
        }
    }

    /// <summary>
    /// Ensures the directory exists. FileStore handles directories automatically on upload,
    /// so this is a no-op.
    /// </summary>
    public Task EnsureDirectoryAsync(string relativeDirectory)
    {
        return Task.CompletedTask;
    }

    public async Task<FileStoreMetadataDto?> GetFileMetadataAsync(string fileKey, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(fileKey))
            return null;

        var segments = fileKey.Split('/');
        if (segments.Length < 2)
            return null;

        var category = Uri.EscapeDataString(segments[0]);
        var filename = Uri.EscapeDataString(segments[^1]);

        var url = $"{_baseUrl}/files/{category}/{filename}/metadata";

        try
        {
            using var response = await _http.GetAsync(url, cancellationToken);

            if (!response.IsSuccessStatusCode)
            {
                if (response.StatusCode == System.Net.HttpStatusCode.NotFound)
                    return null;

                _logger.LogWarning("FileStore metadata lookup failed ({Status}) for {FileKey}", response.StatusCode, fileKey);
                return null;
            }

            var body = await response.Content.ReadAsStringAsync(cancellationToken);
            using var doc = JsonDocument.Parse(body);
            var root = doc.RootElement;

            return new FileStoreMetadataDto
            {
                FileId = root.GetProperty("fileId").GetString() ?? string.Empty,
                FileKey = root.GetProperty("fileKey").GetString() ?? fileKey,
                FileName = root.GetProperty("fileName").GetString() ?? string.Empty,
                OriginalFileName = root.TryGetProperty("originalFileName", out var ofn) ? ofn.GetString() ?? string.Empty : string.Empty,
                Extension = root.GetProperty("extension").GetString() ?? string.Empty,
                MimeType = root.GetProperty("mimeType").GetString() ?? string.Empty,
                FileSize = root.GetProperty("fileSize").GetInt64(),
                Category = root.GetProperty("category").GetString() ?? string.Empty,
                Url = root.GetProperty("url").GetString() ?? string.Empty,
                PreviewUrl = root.TryGetProperty("previewUrl", out var pu) ? pu.GetString() : null,
                ThumbnailUrl = root.TryGetProperty("thumbnailUrl", out var tu) ? tu.GetString() : null,
                UploadedBy = root.TryGetProperty("uploadedBy", out var ub) ? ub.GetString() : null,
                UploadedAt = root.TryGetProperty("uploadedAt", out var ua) ? ua.GetDateTime() : DateTime.UtcNow
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get file metadata for {FileKey}", fileKey);
            return null;
        }
    }
}
