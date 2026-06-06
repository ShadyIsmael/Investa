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

        _baseUrl = (config["FileStore:BaseUrl"] ?? "http://localhost:5240").TrimEnd('/');
        _apiKey = config["FileStore:ApiKey"] ?? "investa-filestore-key-change-in-production";

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
        // FileStore creates category directories automatically on upload — nothing to do here.
        return Task.CompletedTask;
    }
}