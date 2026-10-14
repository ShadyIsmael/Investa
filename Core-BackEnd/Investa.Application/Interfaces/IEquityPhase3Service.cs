using Investa.Application.DTOs;
using Investa.Domain.Entities.Enums;

namespace Investa.Application.Interfaces;

public interface IEquityPhase3Service
{
    // Dividends
    Task<EquityDividendDeclarationDto> CreateDividendDeclarationAsync(Guid actorId, CreateDividendDeclarationRequest request, bool isAdmin, CancellationToken ct = default);
    Task<EquityDividendDeclarationDto> GenerateEntitlementsAsync(Guid actorId, int declarationId, bool isAdmin, CancellationToken ct = default);
    Task<IReadOnlyList<EquityDividendDeclarationDto>> GetDividendDeclarationsAsync(Guid actorId, int opportunityId, bool isAdmin, CancellationToken ct = default);
    Task<EquityDividendEntitlementDto> GetDividendEntitlementAsync(Guid actorId, int entitlementId, CancellationToken ct = default);
    Task<EquityDividendDistributionDto> DeclareDistributionAsync(Guid actorId, DeclareExternalDistributionRequest request, bool isAdmin, CancellationToken ct = default);
    Task<EquityDividendDistributionDto> ConfirmDistributionAsync(Guid actorId, ConfirmDistributionRequest request, CancellationToken ct = default);

    // Transfers
    Task<EquityTransferDto> CreateTransferAsync(Guid actorId, CreateTransferRequest request, bool isAdmin, CancellationToken ct = default);
    Task<EquityTransferDto> SubmitTransferAsync(Guid actorId, int transferId, bool isAdmin, CancellationToken ct = default);
    Task<EquityTransferDto> AcknowledgeTransferAsync(Guid actorId, int transferId, bool approve, string? reason, CancellationToken ct = default);
    Task<EquityTransferDto> ApplyTransferAsync(Guid actorId, int transferId, bool isAdmin, CancellationToken ct = default);
    Task<IReadOnlyList<EquityTransferDto>> GetTransfersAsync(Guid actorId, int opportunityId, bool isAdmin, CancellationToken ct = default);

    // Closure
    Task<EquityClosureSnapshotDto> ClosePositionAsync(Guid actorId, int positionId, ClosePositionRequest request, bool isAdmin, CancellationToken ct = default);
    Task<EquityClosureSnapshotDto?> GetClosureSnapshotAsync(Guid actorId, int positionId, bool isAdmin, CancellationToken ct = default);
}
