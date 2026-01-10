using Investa.Application.DTOs;
using Investa.Application.Interfaces;
using Investa.Domain.Entities;
using System.Collections.Generic;
using System.Linq;

namespace Investa.Application.Services;

public class CategoryService : ICategoryService
{
    private readonly IUnitOfWork _uow;

    public CategoryService(IUnitOfWork uow)
    {
        _uow = uow;
    }

    public async Task<IEnumerable<CategoryDto>> GetAllAsync()
    {
        var items = await _uow.Repository<BusinessCategory>().GetAllAsync();
        return items.OrderBy(i => i.SortOrder).Select(Map).ToList();
    }

    public async Task<CategoryDto?> GetByIdAsync(int id)
    {
        var item = await _uow.Repository<BusinessCategory>().GetByIdAsync(id);
        return item == null ? null : Map(item);
    }

    public async Task<CategoryDto> CreateAsync(CreateCategoryDto dto)
    {
        var entity = new BusinessCategory
        {
            Key = dto.Key,
            Value = dto.Value,
            ValueAr = dto.ValueAr,
            SortOrder = dto.SortOrder
        };

        await _uow.Repository<BusinessCategory>().AddAsync(entity);
        await _uow.SaveChangesAsync();

        return Map(entity);
    }

    public async Task<bool> UpdateAsync(int id, UpdateCategoryDto dto)
    {
        var repo = _uow.Repository<BusinessCategory>();
        var existing = await repo.GetByIdAsync(id);
        if (existing == null) return false;

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
        var repo = _uow.Repository<BusinessCategory>();
        var existing = await repo.GetByIdAsync(id);
        if (existing == null) return false;

        await repo.DeleteAsync(existing);
        await _uow.SaveChangesAsync();
        return true;
    }

    private CategoryDto Map(BusinessCategory b)
    {
        var slug = b.Key?.ToLowerInvariant().Replace(' ', '-') ?? string.Empty;
        return new CategoryDto
        {
            Id = b.Id,
            Key = b.Key,
            Value = b.Value,
            ValueAr = b.ValueAr,
            SortOrder = b.SortOrder,
            Slug = slug
        };
    }
}
