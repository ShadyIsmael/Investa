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
                Payload = dto.Payload,
                CreatedBy = dto.CreatedBy,
                CorrelationId = dto.CorrelationId,
                Metadata = dto.Metadata,
                Version = currentMax + 1,
                OccurredAt = DateTime.UtcNow
            };

            await _unitOfWork.Repository<InvestmentEvent>().AddAsync(ev);
            await _unitOfWork.SaveChangesAsync();
            await _unitOfWork.CommitTransactionAsync();

            return new InvestmentEventDto
            {
                Id = ev.Id,
                InvestmentId = ev.InvestmentId,
                EventType = ev.EventType,
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
                            Payload = e.Payload,
                            OccurredAt = e.OccurredAt,
                            CreatedBy = e.CreatedBy,
                            CorrelationId = e.CorrelationId,
                            Version = e.Version,
                            Metadata = e.Metadata
                        }).ToList();

        return events;
    }
}