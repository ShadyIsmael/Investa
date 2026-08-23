using Investa.Application.Interfaces;
using Investa.Domain.Entities.Enums;

namespace Investa.Infrastructure.Services;

public class NullFileScanService : IFileScanService
{
    public Task<FileScanStatus> ScanAsync(string fileKey, CancellationToken cancellationToken = default)
    {
        return Task.FromResult(FileScanStatus.Clean);
    }
}
