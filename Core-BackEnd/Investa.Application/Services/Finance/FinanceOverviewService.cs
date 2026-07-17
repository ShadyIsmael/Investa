using Investa.Application.DTOs.Finance;

namespace Investa.Application.Services.Finance;

public interface IFinanceOverviewService
{
    Task<FinanceOverviewDto> GetOverviewAsync(FinanceOverviewQuery query, CancellationToken cancellationToken = default);
}
