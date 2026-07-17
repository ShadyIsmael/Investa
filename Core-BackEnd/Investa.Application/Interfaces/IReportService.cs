using Investa.Application.DTOs;

namespace Investa.Application.Interfaces;

public interface IReportService
{
    Task<ReportDto> CreateAsync(Guid reporterUserId, CreateReportRequest request, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<ReportDto>> GetMineAsync(Guid reporterUserId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<ReportDto>> GetAdminReportsAsync(AdminReportQuery query, CancellationToken cancellationToken = default);
    Task<ReportDto> ConfirmAsync(int id, Guid reviewerUserId, ResolveReportRequest request, CancellationToken cancellationToken = default);
    Task<ReportDto> RejectAsync(int id, Guid reviewerUserId, ResolveReportRequest request, CancellationToken cancellationToken = default);
    Task<ReportDto> DismissAsync(int id, Guid reviewerUserId, ResolveReportRequest request, CancellationToken cancellationToken = default);
}
