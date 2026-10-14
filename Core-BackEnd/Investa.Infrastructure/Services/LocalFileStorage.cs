using System.IO;
using System.Threading.Tasks;
using Investa.Application.Interfaces;
using Microsoft.Extensions.Hosting;

namespace Investa.Infrastructure.Services;

public class LocalFileStorage : IFileStorage
{
    private readonly IHostEnvironment _env;

    public LocalFileStorage(IHostEnvironment env)
    {
        _env = env;
    }

    private string GetWebRootPath()
    {
        var contentRoot = _env.ContentRootPath ?? Directory.GetCurrentDirectory();
        return Path.Combine(contentRoot, "wwwroot");
    }

    public Task EnsureDirectoryAsync(string relativeDirectory)
    {
        var dir = Path.Combine(GetWebRootPath(), relativeDirectory.TrimStart('/', '\\'));
        if (!Directory.Exists(dir)) Directory.CreateDirectory(dir);
        return Task.CompletedTask;
    }

    public async Task<bool> DeleteFileAsync(string relativePath)
    {
        try
        {
            var file = Path.Combine(GetWebRootPath(), relativePath.TrimStart('/', '\\'));
            if (File.Exists(file)) File.Delete(file);
            return true;
        }
        catch
        {
            return false;
        }
    }

    public async Task<string> SaveFileAsync(string relativePath, Stream data, string contentType)
    {
        var fullPath = Path.Combine(GetWebRootPath(), relativePath.TrimStart('/', '\\'));
        var dir = Path.GetDirectoryName(fullPath)!;
        if (!Directory.Exists(dir)) Directory.CreateDirectory(dir);
        using (var fs = new FileStream(fullPath, FileMode.Create, FileAccess.Write))
        {
            await data.CopyToAsync(fs);
            await fs.FlushAsync();
        }
        // Return public URL path, ensure prefixed with /
        var webRelative = "/" + relativePath.TrimStart('/', '\\').Replace("\\", "/");
        return webRelative;
    }

    public Task<byte[]> ReadFileAsync(string storedPath, CancellationToken cancellationToken = default)
    {
        var fullPath = Path.Combine(GetWebRootPath(), storedPath.TrimStart('/', '\\').Replace('/', Path.DirectorySeparatorChar));
        return File.ReadAllBytesAsync(fullPath, cancellationToken);
    }

    public Task<FileStoreMetadataDto?> GetFileMetadataAsync(string fileKey, CancellationToken cancellationToken = default)
    {
        return Task.FromResult<FileStoreMetadataDto?>(null);
    }

    public async Task<FileStoreUploadResult> UploadWithPolicyAsync(string categoryCode, string originalFileName, Stream data, string contentType, long declaredFileSize, FileStoreUploadPolicy policy, FileStoreUploadContext context, CancellationToken cancellationToken = default)
    {
        var extension = Path.GetExtension(Path.GetFileName(originalFileName)).ToLowerInvariant();
        var fileName = $"{DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()}_{Guid.NewGuid():N}{extension}";
        var relativePath = $"uploads/{categoryCode}/{fileName}";
        var url = await SaveFileAsync(relativePath, data, contentType);
        return new FileStoreUploadResult(Guid.NewGuid().ToString("N"), $"uploads-{categoryCode}/{fileName}", fileName, Path.GetFileName(originalFileName), extension, contentType, declaredFileSize, categoryCode, url, null, null);
    }
}
