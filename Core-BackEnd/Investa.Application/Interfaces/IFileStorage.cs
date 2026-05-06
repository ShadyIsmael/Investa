using System.IO;

namespace Investa.Application.Interfaces;

public interface IFileStorage
{
    /// <summary>
    /// Saves the provided stream to the specified relative path under the configured web root and returns the public URL path.
    /// </summary>
    Task<string> SaveFileAsync(string relativePath, Stream data, string contentType);

    /// <summary>
    /// Deletes the file located at the specified relative path. Returns true if deleted or not found.
    /// </summary>
    Task<bool> DeleteFileAsync(string relativePath);

    /// <summary>
    /// Ensure the directory exists for the given relative path.
    /// </summary>
    Task EnsureDirectoryAsync(string relativeDirectory);
}