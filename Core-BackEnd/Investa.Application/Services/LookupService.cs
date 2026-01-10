using Investa.Application.DTOs;
using Investa.Application.Interfaces;
using Investa.Domain.Entities;
using Investa.Domain.Entities.Enums;
using System.Collections.Generic;
using System.Linq;

namespace Investa.Application.Services;

public class LookupService : ILookupService
{
    private readonly IUnitOfWork _uow;
    private readonly Microsoft.Extensions.Localization.IStringLocalizer _localizer;

    public LookupService(IUnitOfWork uow, Microsoft.Extensions.Localization.IStringLocalizer localizer)
    {
        _uow = uow;
        _localizer = localizer;
    }

    public async Task<IEnumerable<LookupDto>> GetAllAsync()
    {
        var items = await _uow.Repository<Lookup>().GetAllAsync();
        return items.OrderBy(i => i.SortOrder).Select(Map).ToList();
    }

    public async Task<IEnumerable<LookupDto>> GetByTypeAsync(LookupType type)
    {
        var items = await _uow.Repository<Lookup>().FindAsync(l => l.Type == type);
        return items.OrderBy(i => i.SortOrder).Select(Map).ToList();
    }

    public async Task<LookupDto?> GetByIdAsync(int id)
    {
        var item = await _uow.Repository<Lookup>().GetByIdAsync(id);
        return item == null ? null : Map(item);
    }

    public async Task<LookupDto> CreateAsync(CreateLookupDto dto)
    {
        var entity = new Lookup
        {
            Type = dto.Type,
            Key = dto.Key,
            Value = dto.Value,
            ValueAr = dto.ValueAr,
            SortOrder = dto.SortOrder
        };

        await _uow.Repository<Lookup>().AddAsync(entity);
        await _uow.SaveChangesAsync();

        return Map(entity);
    }

    public async Task<bool> UpdateAsync(int id, UpdateLookupDto dto)
    {
        var repo = _uow.Repository<Lookup>();
        var existing = await repo.GetByIdAsync(id);
        if (existing == null) return false;

        existing.Type = dto.Type;
        existing.Key = dto.Key;
        existing.Value = dto.Value;
        existing.ValueAr = dto.ValueAr;
        existing.SortOrder = dto.SortOrder;

        await repo.UpdateAsync(existing);
        await _uow.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var repo = _uow.Repository<Lookup>();
        var existing = await repo.GetByIdAsync(id);
        if (existing == null) return false;

        await repo.DeleteAsync(existing);
        await _uow.SaveChangesAsync();
        return true;
    }

    public async Task<LookupNormalizationResultDto> NormalizeAndVerifyAsync()
    {
        // Normalize Lookups
        var repoLookup = _uow.Repository<Lookup>();
        var allLookups = (await repoLookup.GetAllAsync()).ToList();
        int fixedLookups = 0;
        foreach (var l in allLookups)
        {
            if (string.IsNullOrWhiteSpace(l.ValueAr))
            {
                l.ValueAr = l.Value;
                fixedLookups++;
                await repoLookup.UpdateAsync(l);
            }
        }

        // Normalize BusinessCategory
        var repoBc = _uow.Repository<Investa.Domain.Entities.BusinessCategory>();
        var allBc = (await repoBc.GetAllAsync()).ToList();
        int fixedBc = 0;
        foreach (var b in allBc)
        {
            if (string.IsNullOrWhiteSpace(b.ValueAr))
            {
                b.ValueAr = b.Value;
                fixedBc++;
                await repoBc.UpdateAsync(b);
            }
        }

        // Normalize ClientStatus
        var repoCs = _uow.Repository<Investa.Domain.Entities.ClientStatus>();
        var allCs = (await repoCs.GetAllAsync()).ToList();
        int fixedCs = 0;
        foreach (var s in allCs)
        {
            if (string.IsNullOrWhiteSpace(s.NameAr))
            {
                s.NameAr = s.NameEn;
                fixedCs++;
                await repoCs.UpdateAsync(s);
            }
        }

        await _uow.SaveChangesAsync();

        return new LookupNormalizationResultDto
        {
            LookupsTotal = allLookups.Count,
            LookupsFixed = fixedLookups,
            BusinessCategoriesTotal = allBc.Count,
            BusinessCategoriesFixed = fixedBc,
            ClientStatusesTotal = allCs.Count,
            ClientStatusesFixed = fixedCs
        };
    }

    private LookupDto Map(Lookup l)
    {
        var slug = l.Key?.ToLowerInvariant().Replace(' ', '-') ?? string.Empty;
        // localization key format: "Lookup.{Type}.{Key}"
        var locKey = $"Lookup.{l.Type}.{l.Key}";
        var localized = _localizer?[locKey];
        var display = (localized != null && !localized.ResourceNotFound) ? localized.Value : l.Value;

        return new LookupDto
        {
            Id = l.Id,
            Type = l.Type,
            Key = l.Key,
            Value = l.Value,
            ValueAr = l.ValueAr,
            SortOrder = l.SortOrder,
            Slug = slug,
            DisplayName = display
        };
    }
}
