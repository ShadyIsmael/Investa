using Investa.Application.DTOs;

namespace Investa.Application.Interfaces;

public interface IFundingDeclarationService
{
    Task<FundingDeclarationDto> CreateAsync(
        Guid founderId,
        int opportunityId,
        int participationId,
        FundingDeclarationCreateCommand command,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<FundingDeclarationDto>> GetForParticipationAsync(
        Guid actorId,
        int opportunityId,
        int participationId,
        bool isAdmin = false,
        CancellationToken cancellationToken = default);

    Task<FundingDeclarationProofDownload> DownloadProofAsync(
        Guid actorId,
        int declarationId,
        bool isAdmin = false,
        CancellationToken cancellationToken = default);

    Task<FundingDeclarationDto> ConfirmAsync(
        Guid investorId,
        int declarationId,
        string? comment,
        CancellationToken cancellationToken = default);

    Task<FundingDeclarationDto> DisputeAsync(
        Guid investorId,
        int declarationId,
        string reason,
        CancellationToken cancellationToken = default);
}
