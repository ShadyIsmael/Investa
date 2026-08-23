using Investa.Application.DTOs;

namespace Investa.Application.Interfaces;

public interface IFounderDashboardService
{
    Task<FounderDashboardDto> GetAsync(Guid founderId, DateTime? fromUtc = null, DateTime? toUtc = null, CancellationToken cancellationToken = default);
}
