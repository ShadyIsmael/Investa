using System;
using System.IO;
using System.Threading;
using System.Threading.Tasks;
using Investa.Application.Interfaces;

namespace Investa.Api.IntegrationTests;

public class TestFileStorage : IFileStorage
{
    public Task<string> SaveFileAsync(string relativePath, Stream data, string contentType)
    {
        return Task.FromResult($"/storage/{relativePath}");
    }

    public Task<byte[]> ReadFileAsync(string storedPath, CancellationToken cancellationToken = default)
    {
        return Task.FromResult(Array.Empty<byte>());
    }

    public Task<bool> DeleteFileAsync(string relativePath)
    {
        return Task.FromResult(true);
    }

    public Task EnsureDirectoryAsync(string relativeDirectory)
    {
        return Task.CompletedTask;
    }

    public Task<FileStoreMetadataDto?> GetFileMetadataAsync(string fileKey, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(fileKey) || fileKey == "nonexistent/file.jpg")
            return Task.FromResult<FileStoreMetadataDto?>(null);

        var segments = fileKey.Split('/');
        var category = segments[0];
        var fileName = segments.Length > 1 ? segments[^1] : fileKey;
        var ext = Path.GetExtension(fileName).ToLowerInvariant();
        var fileId = Path.GetFileNameWithoutExtension(fileName);

        var metadata = new FileStoreMetadataDto
        {
            FileId = fileId,
            FileKey = fileKey,
            FileName = fileName,
            OriginalFileName = fileName,
            Extension = ext,
            MimeType = ext switch
            {
                ".jpg" => "image/jpeg",
                ".png" => "image/png",
                ".pdf" => "application/pdf",
                ".docx" => "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                ".mp4" => "video/mp4",
                ".txt" => "text/plain",
                _ => "application/octet-stream"
            },
            FileSize = fileKey == "zero/byte.jpg" ? 0 : 150 * 1024,
            Category = category,
            Url = $"/storage/{fileKey}",
            PreviewUrl = ext is ".jpg" or ".png" or ".pdf" or ".mp4" ? $"/storage/{fileKey}" : null,
            ThumbnailUrl = ext is ".jpg" or ".png" ? $"/storage/{fileKey}" : null,
            UploadedBy = "test-user",
            UploadedAt = DateTime.UtcNow
        };

        return Task.FromResult<FileStoreMetadataDto?>(metadata);
    }
}
