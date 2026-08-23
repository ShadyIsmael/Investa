using Investa.Domain.Entities.Enums;

namespace Investa.Application.Interfaces;

public interface IFileScanService
{
    Task<FileScanStatus> ScanAsync(string fileKey, CancellationToken cancellationToken = default);
}
