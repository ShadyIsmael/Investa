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

    public async Task<LookupDto> CreateAsync(CreateLookupDto dto)
    {
        var entity = new Lookup
        {
            Type = dto.Type,
            Key = dto.Key,
            Value = dto.Value,
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
            SortOrder = l.SortOrder,
            Slug = slug,
            DisplayName = display
        };
    }
}
