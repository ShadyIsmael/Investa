using System.ComponentModel.DataAnnotations;
using Investa.Domain.Entities.Enums;

namespace Investa.Domain.Entities;

public class InvestmentContract
{
    public int Id { get; set; }
    [Required, StringLength(80)] public string ContractNumber { get; set; } = string.Empty;
    public int OpportunityId { get; set; }
    public Guid FounderUserId { get; set; }
    public Guid InvestorUserId { get; set; }
    public InvestmentModel InvestmentModel { get; set; }
    public int CurrentVersionNumber { get; set; }
    public InvestmentContractStatus Status { get; set; } = InvestmentContractStatus.Active;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public Opportunity? Opportunity { get; set; }
    public AuthUser? FounderUser { get; set; }
    public AuthUser? InvestorUser { get; set; }
    public ICollection<InvestmentContractVersion> Versions { get; set; } = new List<InvestmentContractVersion>();
}

public class InvestmentContractVersion
{
    public int Id { get; set; }
    public int ContractId { get; set; }
    public int VersionNumber { get; set; }
    public InvestmentContractVersionType VersionType { get; set; }
    public int? PreviousVersionId { get; set; }
    public int SourceParticipationRequestId { get; set; }
    public int? SourceNegotiationOfferId { get; set; }
    public InvestmentContractVersionStatus Status { get; set; } = InvestmentContractVersionStatus.Active;
    [Required] public string TermsSnapshotJson { get; set; } = string.Empty;
    public string? PreviousTermsSnapshotJson { get; set; }
    public string? ChangesSnapshotJson { get; set; }
    public string? DocumentUrl { get; set; }
    [Required, StringLength(64)] public string DocumentHash { get; set; } = string.Empty;
    [Required] public string DocumentContent { get; set; } = string.Empty;
    public string? PdfDocumentUrl { get; set; }
    [StringLength(64)] public string? PdfDocumentHash { get; set; }
    public long? PdfDocumentSize { get; set; }
    public DateTime? PdfGeneratedAt { get; set; }
    public PdfGenerationStatus PdfGenerationStatus { get; set; } = PdfGenerationStatus.NotGenerated;
    [StringLength(1000)] public string? PdfGenerationError { get; set; }
    [StringLength(100)] public string PdfMimeType { get; set; } = "application/pdf";
    [StringLength(50)] public string PdfRendererVersion { get; set; } = "playwright-chromium-v1";
    [Timestamp] public byte[] RowVersion { get; set; } = [];
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? ActivatedAt { get; set; }
    public InvestmentContract? Contract { get; set; }
    public InvestmentContractVersion? PreviousVersion { get; set; }
    public OpportunityJoinRequest? SourceParticipationRequest { get; set; }
    public Chat.NegotiationOffer? SourceNegotiationOffer { get; set; }
    public ICollection<ContractEvent> Events { get; set; } = new List<ContractEvent>();
}

public class ContractEvent
{
    public long Id { get; set; }
    public int ContractVersionId { get; set; }
    public ContractEventType EventType { get; set; }
    public Guid? PerformedByUserId { get; set; }
    [Required, StringLength(500)] public string Description { get; set; } = string.Empty;
    public string? MetadataJson { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public InvestmentContractVersion? ContractVersion { get; set; }
    public AuthUser? PerformedByUser { get; set; }
}
