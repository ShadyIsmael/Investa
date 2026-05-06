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
}