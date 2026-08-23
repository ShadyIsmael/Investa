using System.ComponentModel.DataAnnotations;
using Investa.Domain.Entities.Enums;

namespace Investa.Application.DTOs;

public sealed class OpportunityObligationCompletionDto
{
    public int OpportunityId { get; set; }
    public ObligationCompletionStatus Status { get; set; }
    public int RequiredParticipationCount { get; set; }
    public int CompletedParticipationCount { get; set; }
    public IReadOnlyList<ParticipationObligationCompletionDto> Participations { get; set; } = [];
}

public sealed class ParticipationObligationCompletionDto
{
    public int ParticipationRequestId { get; set; }
    public int ParticipationSequence { get; set; }
    public Guid InvestorId { get; set; }
    public bool IsCompleted { get; set; }
    public IReadOnlyList<ObligationConfirmationDto> Confirmations { get; set; } = [];
}

public sealed class ObligationConfirmationDto
{
    public long Id { get; set; }
    public ObligationPartyRole PartyRole { get; set; }
    public Guid RequiredUserId { get; set; }
    public ObligationConfirmationStatus Status { get; set; }
    public Guid? ConfirmedByUserId { get; set; }
    public DateTime? ConfirmedAt { get; set; }
    public string? ConfirmationStatement { get; set; }
}

public sealed class ConfirmObligationCompletionRequest
{
    [Required, StringLength(100)] public string IdempotencyKey { get; set; } = string.Empty;
    [Required, StringLength(1000)] public string Statement { get; set; } = string.Empty;
    [Required] public bool? AcknowledgeNoPaymentProof { get; set; }
}
