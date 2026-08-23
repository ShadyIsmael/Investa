using System.Text.Json;
using Investa.Application.Common;
using Investa.Application.DTOs;
using Investa.Application.Interfaces;
using Investa.Domain.Entities;
using Investa.Domain.Entities.Enums;
using Investa.Domain.Entities.Security;

namespace Investa.Application.Services;

public sealed class OpportunityObligationCompletionService(
    IUnitOfWork uow,
    IUserNotificationService notifications,
    IEmailService email) : IOpportunityObligationCompletionService
{
    public async Task<OpportunityObligationCompletionDto> GetAsync(Guid actorId, int opportunityId, bool isAdmin, CancellationToken cancellationToken = default)
    {
        var opportunity = await GetAuthorizedAsync(actorId, opportunityId, isAdmin);
        return await BuildAsync(opportunity);
    }

    public async Task<OpportunityObligationCompletionDto> InitiateAsync(Guid actorId, int opportunityId, bool isAdmin, CancellationToken cancellationToken = default)
    {
        var opportunity = await GetAuthorizedAsync(actorId, opportunityId, isAdmin);
        if (!isAdmin && opportunity.FounderId != actorId)
            throw new BusinessValidationException("OBLIGATION_INITIATION_DENIED", "Only the Opportunity founder or an administrator can initiate completion.");
        if (opportunity.FundingStatus != OpportunityFundingStatus.Closed)
            throw new BusinessValidationException("FUNDING_MUST_BE_CLOSED", "Funding must be Closed before obligation completion can begin.");
        if (await uow.Repository<OpportunityJoinRequest>().ExistsAsync(p => p.OpportunityId == opportunityId
            && p.RequestType == OpportunityJoinRequestType.InvestmentParticipation && p.Status == OpportunityJoinRequestStatus.Pending))
            throw new BusinessValidationException("PENDING_PARTICIPATIONS_EXIST", "Resolve all pending Participations before obligation completion begins.");
        var participations = (await uow.Repository<OpportunityJoinRequest>().FindAsync(p =>
            p.OpportunityId == opportunityId && p.RequestType == OpportunityJoinRequestType.InvestmentParticipation
            && p.Status == OpportunityJoinRequestStatus.Approved)).OrderBy(p => p.Id).ToArray();
        if (participations.Length == 0)
            throw new BusinessValidationException("NO_APPROVED_PARTICIPATIONS", "The Opportunity has no approved Participations with obligations.");

        var existing = await uow.Repository<ParticipationObligationConfirmation>().FindAsync(c => c.OpportunityId == opportunityId);
        var existingKeys = existing.Select(c => (c.ParticipationRequestId, c.PartyRole)).ToHashSet();
        var created = new List<ParticipationObligationConfirmation>();
        foreach (var participation in participations)
        {
            Add(participation, opportunity.FounderId, ObligationPartyRole.Founder);
            Add(participation, participation.InvestorId, ObligationPartyRole.Investor);
        }
        foreach (var confirmation in created)
            await uow.Repository<ParticipationObligationConfirmation>().AddAsync(confirmation);
        opportunity.ObligationCompletionStatus = ObligationCompletionStatus.AwaitingConfirmations;
        opportunity.UpdatedAt = DateTime.UtcNow;
        await uow.Repository<Opportunity>().UpdateAsync(opportunity);
        await AuditAsync(actorId, opportunityId, "Initiate", new { ParticipationCount=participations.Length, RequiredConfirmationCount=participations.Length*2 });
        await uow.SaveChangesAsync();

        foreach (var confirmation in created)
            await NotifyRequiredPartyAsync(confirmation, opportunity, actorId, cancellationToken);
        return await BuildAsync(opportunity);

        void Add(OpportunityJoinRequest participation, Guid userId, ObligationPartyRole role)
        {
            if (existingKeys.Contains((participation.Id, role))) return;
            var confirmation = new ParticipationObligationConfirmation {
                ParticipationRequestId=participation.Id, OpportunityId=opportunityId, RequiredUserId=userId,
                PartyRole=role, Status=ObligationConfirmationStatus.Pending
            };
            created.Add(confirmation);
        }
    }

    public async Task<OpportunityObligationCompletionDto> ConfirmAsync(Guid actorId, int opportunityId, int participationRequestId, ConfirmObligationCompletionRequest request, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(request.IdempotencyKey) || string.IsNullOrWhiteSpace(request.Statement))
            throw new BusinessValidationException("CONFIRMATION_FIELDS_REQUIRED", "Idempotency key and confirmation statement are required.");
        if (request.AcknowledgeNoPaymentProof != true)
            throw new BusinessValidationException("DISCLAIMER_ACKNOWLEDGEMENT_REQUIRED", "Confirm that this declaration does not create, settle, or prove payment.");
        var opportunity = await uow.Repository<Opportunity>().GetByIdAsync(opportunityId)
            ?? throw new BusinessValidationException("OPPORTUNITY_NOT_FOUND", "Opportunity was not found.");
        var confirmation = (await uow.Repository<ParticipationObligationConfirmation>().FindAsync(c =>
            c.OpportunityId == opportunityId && c.ParticipationRequestId == participationRequestId && c.RequiredUserId == actorId)).SingleOrDefault()
            ?? throw new BusinessValidationException("CONFIRMATION_NOT_AUTHORIZED", "You are not a required confirming party for this Participation.");
        if (confirmation.Status == ObligationConfirmationStatus.Confirmed)
        {
            if (string.Equals(confirmation.IdempotencyKey, request.IdempotencyKey.Trim(), StringComparison.Ordinal))
                return await BuildAsync(opportunity);
            throw new BusinessValidationException("ALREADY_CONFIRMED", "This party has already confirmed completion.");
        }
        var now = DateTime.UtcNow;
        confirmation.Status=ObligationConfirmationStatus.Confirmed;
        confirmation.ConfirmedByUserId=actorId;
        confirmation.ConfirmedAt=now;
        confirmation.ConfirmationStatement=request.Statement.Trim();
        confirmation.IdempotencyKey=request.IdempotencyKey.Trim();
        confirmation.UpdatedAt=now;
        await uow.Repository<ParticipationObligationConfirmation>().UpdateAsync(confirmation);
        await AuditAsync(actorId, confirmation.Id.ToString(), "Confirm", new {
            confirmation.OpportunityId, confirmation.ParticipationRequestId, confirmation.PartyRole,
            Disclaimer="Declaration only; no payment creation, settlement, movement, or proof."
        });
        await uow.SaveChangesAsync();

        var summary = await BuildAsync(opportunity);
        if (summary.RequiredParticipationCount > 0 && summary.CompletedParticipationCount == summary.RequiredParticipationCount)
        {
            opportunity.ObligationCompletionStatus=ObligationCompletionStatus.Completed;
            opportunity.UpdatedAt=now;
            await uow.Repository<Opportunity>().UpdateAsync(opportunity);
            await AuditAsync(actorId, opportunityId, "Complete", new { CompletedAt=now });
            await uow.SaveChangesAsync();
            summary = await BuildAsync(opportunity);
            await NotifyOpportunityCompletedAsync(opportunity, actorId, cancellationToken);
        }
        return summary;
    }

    private async Task<Opportunity> GetAuthorizedAsync(Guid actorId, int opportunityId, bool isAdmin)
    {
        var opportunity = await uow.Repository<Opportunity>().GetByIdAsync(opportunityId)
            ?? throw new BusinessValidationException("OPPORTUNITY_NOT_FOUND", "Opportunity was not found.");
        if (isAdmin || opportunity.FounderId == actorId) return opportunity;
        var investor = await uow.Repository<OpportunityJoinRequest>().ExistsAsync(p => p.OpportunityId == opportunityId
            && p.InvestorId == actorId && p.RequestType == OpportunityJoinRequestType.InvestmentParticipation
            && p.Status == OpportunityJoinRequestStatus.Approved);
        if (!investor) throw new BusinessValidationException("OBLIGATION_ACCESS_DENIED", "Only obligated parties can access completion.");
        return opportunity;
    }

    private async Task<OpportunityObligationCompletionDto> BuildAsync(Opportunity opportunity)
    {
        var participations = (await uow.Repository<OpportunityJoinRequest>().FindAsync(p => p.OpportunityId == opportunity.Id
            && p.RequestType == OpportunityJoinRequestType.InvestmentParticipation && p.Status == OpportunityJoinRequestStatus.Approved))
            .OrderBy(p => p.ParticipationSequence).ThenBy(p => p.Id).ToArray();
        var confirmations = await uow.Repository<ParticipationObligationConfirmation>().FindAsync(c => c.OpportunityId == opportunity.Id);
        var items = participations.Select(p => {
            var rows=confirmations.Where(c=>c.ParticipationRequestId==p.Id).OrderBy(c=>c.PartyRole).ToArray();
            return new ParticipationObligationCompletionDto {
                ParticipationRequestId=p.Id, ParticipationSequence=p.ParticipationSequence, InvestorId=p.InvestorId,
                IsCompleted=rows.Length==2 && rows.All(c=>c.Status==ObligationConfirmationStatus.Confirmed),
                Confirmations=rows.Select(ToDto).ToArray()
            };
        }).ToArray();
        return new OpportunityObligationCompletionDto {
            OpportunityId=opportunity.Id, Status=opportunity.ObligationCompletionStatus,
            RequiredParticipationCount=items.Length, CompletedParticipationCount=items.Count(i=>i.IsCompleted), Participations=items
        };
    }

    private async Task NotifyRequiredPartyAsync(ParticipationObligationConfirmation c, Opportunity o, Guid actor, CancellationToken token)
    {
        var user=await uow.Repository<AuthUser>().GetByIdAsync(c.RequiredUserId);
        await notifications.CreateEventAsync(new(c.RequiredUserId, "ObligationCompletionConfirmationRequired",
            $"{c.ParticipationRequestId}:{c.PartyRole}", "Completion confirmation required",
            $"Confirm your side of the obligations for Opportunity {o.Title}. This declaration is not proof of payment.",
            "info", $"/admin/opportunities/{o.Id}/obligations", actor, o.Id), token);
        if (!string.IsNullOrWhiteSpace(user?.Email))
            await email.SendEmailAsync(new SendEmailRequest { To=user.Email, UserId=user.Id.ToString(),
                Subject=$"Completion confirmation required — {o.Title}",
                HtmlBody=$"<p>Please confirm your side of the obligations for Opportunity <strong>{System.Net.WebUtility.HtmlEncode(o.Title)}</strong>.</p><p>This confirmation does not create, move, settle, or prove payment.</p>" }, token);
    }

    private async Task NotifyOpportunityCompletedAsync(Opportunity o, Guid actor, CancellationToken token)
    {
        var userIds=(await uow.Repository<ParticipationObligationConfirmation>().FindAsync(c=>c.OpportunityId==o.Id))
            .Select(c=>c.RequiredUserId).Append(o.FounderId).Distinct().ToArray();
        foreach(var userId in userIds)
        {
            var user=await uow.Repository<AuthUser>().GetByIdAsync(userId);
            await notifications.CreateEventAsync(new(userId, "OpportunityObligationsCompleted", o.Id.ToString(),
                "Opportunity obligations completed", $"All required parties confirmed completion for {o.Title}. No payment is created or proven by these confirmations.",
                "success", $"/admin/opportunities/{o.Id}/obligations", actor, o.Id), token);
            if(!string.IsNullOrWhiteSpace(user?.Email))
                await email.SendEmailAsync(new SendEmailRequest { To=user.Email, UserId=user.Id.ToString(),
                    Subject=$"Obligations completed — {o.Title}",
                    HtmlBody=$"<p>All required parties confirmed obligation completion for <strong>{System.Net.WebUtility.HtmlEncode(o.Title)}</strong>.</p><p>This status does not create, move, settle, or prove payment.</p>" }, token);
        }
    }

    private async Task AuditAsync(Guid actor, object entityId, string action, object changes) =>
        await uow.Repository<AuditLog>().AddAsync(new AuditLog { UserId=actor, EntityType="OpportunityObligationCompletion",
            EntityId=entityId.ToString()!, Action=action, Changes=JsonSerializer.Serialize(changes), Timestamp=DateTime.UtcNow });

    private static ObligationConfirmationDto ToDto(ParticipationObligationConfirmation c) => new() {
        Id=c.Id, PartyRole=c.PartyRole, RequiredUserId=c.RequiredUserId, Status=c.Status,
        ConfirmedByUserId=c.ConfirmedByUserId, ConfirmedAt=c.ConfirmedAt, ConfirmationStatement=c.ConfirmationStatement
    };
}
