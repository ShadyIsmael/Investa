using Investa.Application.DTOs.Investments;
using Investa.Application.Interfaces;
using Investa.Domain.Entities;
using System;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace Investa.Application.Services;

public class InvestmentEventService : IInvestmentEventService
{
    private readonly IUnitOfWork _unitOfWork;

    public InvestmentEventService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<InvestmentEventDto> AppendEventAsync(int investmentId, CreateInvestmentEventDto dto)
    {
        await _unitOfWork.BeginTransactionAsync();
        try
        {
            // compute next version (simple, transactional)
            var existing = (await _unitOfWork.Repository<InvestmentEvent>().FindAsync(e => e.InvestmentId == investmentId)).ToList();
            var currentMax = existing.Any() ? existing.Max(e => e.Version) : 0;

            var ev = new InvestmentEvent
            {
                InvestmentId = investmentId,
                EventType = dto.EventType,
                Visibility = NormalizeVisibility(dto.Visibility),
                Payload = dto.Payload,
                CreatedBy = dto.CreatedBy,
                CorrelationId = dto.CorrelationId,
                Metadata = dto.Metadata,
                Version = currentMax + 1,
                OccurredAt = DateTime.UtcNow
            };

            await _unitOfWork.Repository<InvestmentEvent>().AddAsync(ev);
            await UpdateInvestmentMomentumAsync(investmentId, ev);
            await _unitOfWork.SaveChangesAsync();
            await _unitOfWork.CommitTransactionAsync();

            return new InvestmentEventDto
            {
                Id = ev.Id,
                InvestmentId = ev.InvestmentId,
                EventType = ev.EventType,
                Visibility = ev.Visibility,
                Payload = ev.Payload,
                OccurredAt = ev.OccurredAt,
                CreatedBy = ev.CreatedBy,
                CorrelationId = ev.CorrelationId,
                Version = ev.Version,
                Metadata = ev.Metadata
            };
        }
        catch
        {
            await _unitOfWork.RollbackTransactionAsync();
            throw;
        }
    }

    public async Task<IEnumerable<InvestmentEventDto>> GetByInvestmentAsync(int investmentId)
    {
        var events = (await _unitOfWork.Repository<InvestmentEvent>().FindAsync(e => e.InvestmentId == investmentId))
                        .OrderBy(e => e.OccurredAt)
                        .Select(e => new InvestmentEventDto
                        {
                            Id = e.Id,
                            InvestmentId = e.InvestmentId,
                            EventType = e.EventType,
                            Visibility = e.Visibility,
                            Payload = e.Payload,
                            OccurredAt = e.OccurredAt,
                            CreatedBy = e.CreatedBy,
                            CorrelationId = e.CorrelationId,
                            Version = e.Version,
                            Metadata = e.Metadata
                        }).ToList();

        return events;
    }

    private async Task UpdateInvestmentMomentumAsync(int investmentId, InvestmentEvent ev)
    {
        var investment = await _unitOfWork.Repository<Investment>().GetByIdAsync(investmentId);
        if (investment == null)
            return;

        var isParticipantOnly = string.Equals(ev.Visibility, "ParticipantOnly", StringComparison.OrdinalIgnoreCase);
        if (isParticipantOnly)
            investment.ParticipantOnlyActivityCount++;
        else
            investment.PublicActivityCount++;

        investment.LastActivityAt = ev.OccurredAt;
        investment.MomentumScore = Math.Clamp(
            investment.MomentumScore + GetMomentumWeight(ev.EventType),
            0,
            10000);

        await _unitOfWork.Repository<Investment>().UpdateAsync(investment);
    }

    private static string NormalizeVisibility(string? visibility)
    {
        return string.Equals(visibility, "ParticipantOnly", StringComparison.OrdinalIgnoreCase)
            ? "ParticipantOnly"
            : "Public";
    }

    private static int GetMomentumWeight(string eventType)
    {
        return eventType.ToUpperInvariant() switch
        {
            "PROJECT_CREATED" => 300,
            "UPDATE_POSTED" => 180,
            "MILESTONE_ADDED" => 300,
            "ACHIEVEMENT_UPLOADED" => 240,
            "FUNDING_PROGRESS_UPDATED" => 220,
            "PARTICIPANT_APPROVED" => 160,
            "NEW_DISCUSSION_STARTED" => 120,
            "DOCUMENT_UPLOADED" => 100,
            "STATUS_CHANGED" => 140,
            _ => 75
        };
    }
}
