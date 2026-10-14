using Investa.Application.DTOs;
using Investa.Domain.Entities;

namespace Investa.Application.Interfaces;

public interface ILoanRepaymentService
{
    Task<LoanRepaymentRecordDto> CreateAsync(Guid founderId, int opportunityId, int loanObligationId, CreateLoanRepaymentDeclarationCommand command, CancellationToken cancellationToken = default);
    Task<LoanRepaymentRecordDto> ConfirmAsync(Guid investorId, int declarationId, string? comment, CancellationToken cancellationToken = default);
    Task<LoanRepaymentRecordDto> DisputeAsync(Guid investorId, int declarationId, string reason, CancellationToken cancellationToken = default);
    Task<LoanRepaymentProofDownload> DownloadProofAsync(Guid actorId, int declarationId, bool isAdmin = false, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<LoanRepaymentRecordDto>> GetForParticipationAsync(Guid actorId, int opportunityId, int participationId, bool isAdmin = false, CancellationToken cancellationToken = default);
    Task<IReadOnlyDictionary<int, LoanRepaymentSummaryDto>> GetSummariesByObligationAsync(IEnumerable<int> obligationIds, CancellationToken cancellationToken = default);
}

public sealed record CreateLoanRepaymentDeclarationCommand(
    decimal Amount,
    string Currency,
    DateTime ExternalPaymentDate,
    string? ExternalReference,
    IReadOnlyList<int>? InstallmentIds = null,
    string? IdempotencyKey = null,
    Stream? ProofContent = null,
    string? ProofOriginalFileName = null,
    string? ProofContentType = null,
    long ProofFileSize = 0);

public sealed record LoanRepaymentProofDownload(byte[] Content, string FileName, string ContentType);
