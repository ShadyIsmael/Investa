using System.ComponentModel.DataAnnotations;
using Investa.Domain.Entities.Enums;

namespace Investa.Domain.Entities.Chat;

public class NegotiationOffer
{
    public int Id { get; set; }

    public Guid ConversationId { get; set; }

    public Guid CreatedByUserId { get; set; }

    public int Version { get; set; }

    public int? ParentOfferId { get; set; }

    public NegotiationOfferStatus Status { get; set; } = NegotiationOfferStatus.Pending;

    [StringLength(1000)]
    public string? Note { get; set; }

    [StringLength(10)]
    public string Currency { get; set; } = "Credits";

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Conversation? Conversation { get; set; }

    public AuthUser? CreatedByUser { get; set; }

    public NegotiationOffer? ParentOffer { get; set; }

    public ICollection<NegotiationOfferLeg> Legs { get; set; } = new List<NegotiationOfferLeg>();
}
