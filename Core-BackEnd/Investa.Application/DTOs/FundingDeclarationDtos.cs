using System.ComponentModel.DataAnnotations;
using Investa.Domain.Entities.Enums;

namespace Investa.Application.DTOs;

public sealed class CreateFundingDeclarationRequest
{
    [Range(typeof(decimal), "0.01", "79228162514264337593543950335")]
    public decimal Amount { get; set; }

    [Required, StringLength(3, MinimumLength = 3)]
    public string CurrencyCode { get; set; } = string.Empty;

    [Required]
    public DateTime? ReceivedDate { get; set; }

    [Required, StringLength(30)]
    public string PaymentMethod { get; set; } = string.Empty;

    [StringLength(200)]
    public string? ExternalReference { get; set; }

    [StringLength(2000)]
    public string? Notes { get; set; }

    // Concrete collection type is required for ASP.NET Core's multipart form collection binder.
    // The public command/response contracts remain read-only at the service boundary.
    public List<FundingDeclarationLegAllocationRequest> LegAllocations { get; set; } = new();
}

public sealed class FundingDeclarationLegAllocationRequest
{
    [Range(1, int.MaxValue)]
    public int OfferLegId { get; set; }

    [Range(typeof(decimal), "0.01", "79228162514264337593543950335")]
    public decimal AllocatedAmount { get; set; }
}

public sealed class FundingDeclarationDto
{
    public int Id { get; init; }
    public int ParticipationId { get; init; }
    public int OpportunityId { get; init; }
    public Guid FounderId { get; init; }
    public Guid InvestorId { get; init; }
    public decimal Amount { get; init; }
    public string CurrencyCode { get; init; } = string.Empty;
    public DateTime ReceivedDate { get; init; }
    public string PaymentMethod { get; init; } = string.Empty;
    public string? ExternalReference { get; init; }
    public string? Notes { get; init; }
    public bool ProofAvailable { get; init; }
    public string? ProofFileName { get; init; }
    public long? ProofFileSize { get; init; }
    public string? ProofMimeType { get; init; }
    public string? ProofDownloadUrl { get; init; }
    public string Status { get; init; } = FundingDeclarationStatus.PendingConfirmation.ToString();
    public DateTime DeclaredAt { get; init; }
    public Guid CreatedBy { get; init; }
    public DateTime? ConfirmedAt { get; init; }
    public Guid? ConfirmedByInvestorId { get; init; }
    public string? ConfirmationComment { get; init; }
    public DateTime? DisputedAt { get; init; }
    public Guid? DisputedByInvestorId { get; init; }
    public string? DisputeReason { get; init; }
    public IReadOnlyList<FundingDeclarationLegAllocationDto> LegAllocations { get; init; } = Array.Empty<FundingDeclarationLegAllocationDto>();
}

public sealed class FundingDeclarationLegAllocationDto
{
    public int Id { get; init; }
    public int OfferLegId { get; init; }
    public int OfferLegNumber { get; init; }
    public string LegType { get; init; } = string.Empty;
    public decimal AllocatedAmount { get; init; }
    public string CurrencyCode { get; init; } = string.Empty;
}

public sealed class ConfirmFundingDeclarationRequest
{
    [StringLength(2000)]
    public string? Comment { get; set; }
}

public sealed class DisputeFundingDeclarationRequest
{
    [Required, StringLength(2000, MinimumLength = 1)]
    public string Reason { get; set; } = string.Empty;
}

public sealed record FundingDeclarationCreateCommand(
    decimal Amount,
    string CurrencyCode,
    DateTime ReceivedDate,
    string PaymentMethod,
    string? ExternalReference,
    string? Notes,
    string? IdempotencyKey = null,
    Stream? ProofContent = null,
    string? ProofOriginalFileName = null,
    string? ProofContentType = null,
    long ProofFileSize = 0,
    IReadOnlyList<FundingDeclarationLegAllocationRequest>? LegAllocations = null);

public sealed record FundingDeclarationProofDownload(
    byte[] Content,
    string FileName,
    string ContentType);
