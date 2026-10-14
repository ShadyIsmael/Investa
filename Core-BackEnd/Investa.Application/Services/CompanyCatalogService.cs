using System.Text.Json;
using Investa.Application.Common;
using Investa.Application.DTOs;
using Investa.Application.Interfaces;
using Investa.Domain.Entities;
using Investa.Domain.Entities.Company;
using Investa.Domain.Entities.Security;
using Microsoft.EntityFrameworkCore;

namespace Investa.Application.Services;

public sealed class CompanyCatalogService(IUnitOfWork uow) : ICompanyCatalogService
{
    private static readonly HashSet<string> AllowedUnits = new(StringComparer.OrdinalIgnoreCase)
    {
        "Unit", "User", "Seat", "Month", "Year", "Project", "Hour", "Day"
    };

    private static readonly HashSet<string> SupportedWorkspaceKeys = new(StringComparer.OrdinalIgnoreCase) { "fopx" };

    public async Task<CompanyCatalogItemPageDto> ListAsync(CompanyCatalogListQuery request, CancellationToken cancellationToken = default)
    {
        var page = Math.Max(1, request.Page);
        var pageSize = Math.Clamp(request.PageSize, 1, 100);
        var query = uow.Repository<CompanyCatalogItem>().Query();

        if (request.Type.HasValue) query = query.Where(x => x.Type == request.Type.Value);
        if (request.Status.HasValue) query = query.Where(x => x.Status == request.Status.Value);
        if (request.SupportsLicense.HasValue) query = query.Where(x => x.SupportsLicense == request.SupportsLicense.Value);
        if (request.SupportsSubscription.HasValue) query = query.Where(x => x.SupportsSubscription == request.SupportsSubscription.Value);
        if (request.SupportsWorkspace.HasValue) query = query.Where(x => x.SupportsWorkspace == request.SupportsWorkspace.Value);
        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var term = request.Search.Trim().ToLowerInvariant();
            query = query.Where(x => x.Code.ToLower().Contains(term)
                || x.Name.ToLower().Contains(term)
                || (x.Description != null && x.Description.ToLower().Contains(term)));
        }

        var total = await query.CountAsync(cancellationToken);
        var descending = string.Equals(request.SortDirection, "desc", StringComparison.OrdinalIgnoreCase);
        var sortBy = (request.SortBy ?? "createdAt").Trim().ToLowerInvariant();
        query = sortBy switch
        {
            "code" => descending ? query.OrderByDescending(x => x.Code) : query.OrderBy(x => x.Code),
            "name" => descending ? query.OrderByDescending(x => x.Name).ThenBy(x => x.Id) : query.OrderBy(x => x.Name).ThenBy(x => x.Id),
            "type" => descending ? query.OrderByDescending(x => x.Type).ThenBy(x => x.Name) : query.OrderBy(x => x.Type).ThenBy(x => x.Name),
            "baseprice" => descending ? query.OrderByDescending(x => x.BasePrice).ThenBy(x => x.Name) : query.OrderBy(x => x.BasePrice).ThenBy(x => x.Name),
            "updatedat" => descending ? query.OrderByDescending(x => x.UpdatedAt).ThenBy(x => x.Id) : query.OrderBy(x => x.UpdatedAt).ThenBy(x => x.Id),
            "status" => descending ? query.OrderByDescending(x => x.Status).ThenBy(x => x.Name) : query.OrderBy(x => x.Status).ThenBy(x => x.Name),
            _ => descending ? query.OrderByDescending(x => x.CreatedAt).ThenBy(x => x.Id) : query.OrderBy(x => x.CreatedAt).ThenBy(x => x.Id),
        };

        var items = await query.Skip((page - 1) * pageSize).Take(pageSize)
            .Select(x => new CompanyCatalogItemListItemDto
            {
                Id = x.Id,
                Code = x.Code,
                Name = x.Name,
                Type = x.Type,
                DefaultUnit = x.DefaultUnit,
                BasePrice = x.BasePrice,
                Currency = x.Currency,
                SupportsLicense = x.SupportsLicense,
                SupportsSubscription = x.SupportsSubscription,
                SupportsWorkspace = x.SupportsWorkspace,
                Status = x.Status,
                UpdatedAt = x.UpdatedAt,
            }).ToListAsync(cancellationToken);

        return new CompanyCatalogItemPageDto { Page = page, PageSize = pageSize, Total = total, Items = items };
    }

    public async Task<CompanyCatalogItemDetailDto?> GetAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var item = await FindAsync(id, cancellationToken);
        return item is null ? null : ToDetail(item);
    }

    public async Task<CompanyCatalogItemDetailDto> CreateAsync(CompanyCatalogItemUpsertRequest request, CancellationToken cancellationToken = default, Guid? actorId = null)
    {
        var values = await NormalizeAndValidateAsync(request, cancellationToken);
        var sequence = (await uow.Repository<CompanyCatalogItem>().Query().Select(x => (int?)x.CodeSequence).MaxAsync(cancellationToken) ?? 0) + 1;
        var now = DateTime.UtcNow;
        var item = new CompanyCatalogItem
        {
            Id = Guid.NewGuid(), CodeSequence = sequence, Code = $"CAT-{sequence:000000}", Name = values.Name,
            Description = values.Description, Type = request.Type, Status = CompanyCatalogItemStatus.Active,
            DefaultUnit = values.DefaultUnit, BasePrice = request.BasePrice, Currency = values.Currency,
            SupportsLicense = request.SupportsLicense, SupportsSubscription = request.SupportsSubscription,
            SupportsWorkspace = request.SupportsWorkspace, WorkspaceKey = values.WorkspaceKey, CreatedAt = now, UpdatedAt = now,
        };
        await uow.Repository<CompanyCatalogItem>().AddAsync(item);
        await AddAuditAsync(actorId, nameof(CompanyCatalogItem), item.Id, "Created", new { item.Code, item.Name, item.Type, item.Status });
        await uow.SaveChangesAsync();
        return ToDetail(item);
    }

    public async Task<CompanyCatalogItemDetailDto?> UpdateAsync(Guid id, CompanyCatalogItemUpsertRequest request, CancellationToken cancellationToken = default, Guid? actorId = null)
    {
        var values = await NormalizeAndValidateAsync(request, cancellationToken);
        var item = await FindAsync(id, cancellationToken);
        if (item is null) return null;
        item.Name = values.Name; item.Description = values.Description; item.Type = request.Type; item.DefaultUnit = values.DefaultUnit;
        item.BasePrice = request.BasePrice; item.Currency = values.Currency; item.SupportsLicense = request.SupportsLicense;
        item.SupportsSubscription = request.SupportsSubscription; item.SupportsWorkspace = request.SupportsWorkspace; item.WorkspaceKey = values.WorkspaceKey;
        item.UpdatedAt = DateTime.UtcNow;
        await AddAuditAsync(actorId, nameof(CompanyCatalogItem), item.Id, "Updated", new { item.Code, item.Name, item.Type, item.BasePrice, item.Currency, item.UpdatedAt });
        await uow.SaveChangesAsync();
        return ToDetail(item);
    }

    public async Task<CompanyCatalogItemDetailDto?> SetStatusAsync(Guid id, CompanyCatalogItemStatus status, CancellationToken cancellationToken = default, Guid? actorId = null)
    {
        if (!Enum.IsDefined(status)) throw new BusinessValidationException("CATALOG_STATUS_INVALID", "The catalog item status is invalid.");
        var item = await FindAsync(id, cancellationToken);
        if (item is null) return null;
        item.Status = status; item.UpdatedAt = DateTime.UtcNow;
        await AddAuditAsync(actorId, nameof(CompanyCatalogItem), item.Id, "StatusChanged", new { item.Code, item.Status, item.UpdatedAt });
        await uow.SaveChangesAsync();
        return ToDetail(item);
    }

    private async Task<(string Name, string? Description, string? DefaultUnit, string? Currency, string? WorkspaceKey)> NormalizeAndValidateAsync(CompanyCatalogItemUpsertRequest request, CancellationToken cancellationToken)
    {
        if (!Enum.IsDefined(request.Type)) throw new BusinessValidationException("CATALOG_TYPE_INVALID", "The catalog item type is invalid.");
        if (string.IsNullOrWhiteSpace(request.Name) || request.Name.Trim().Length > 200)
            throw new BusinessValidationException("CATALOG_NAME_REQUIRED", "Name is required and must be at most 200 characters.");
        if (request.Description?.Trim().Length > 1000)
            throw new BusinessValidationException("CATALOG_DESCRIPTION_INVALID", "Description must be at most 1000 characters.");
        if (request.BasePrice is < 0)
            throw new BusinessValidationException("CATALOG_PRICE_INVALID", "Base price cannot be negative.");

        var unit = Normalize(request.DefaultUnit);
        if (unit is not null && !AllowedUnits.Contains(unit))
            throw new BusinessValidationException("CATALOG_UNIT_INVALID", "Default unit is not supported.");
        unit = unit is null ? null : AllowedUnits.First(x => string.Equals(x, unit, StringComparison.OrdinalIgnoreCase));

        var currency = NormalizeCurrency(request.Currency);
        if (request.BasePrice.HasValue && currency is null)
            throw new BusinessValidationException("CATALOG_CURRENCY_REQUIRED", "Currency is required when a base price is supplied.");
        if (currency is not null && !await uow.Repository<Currency>().Query().AnyAsync(x => x.ISOCode == currency && x.IsActive, cancellationToken))
            throw new BusinessValidationException("CATALOG_CURRENCY_INVALID", "Currency must be an active currency master code.");

        var workspaceKey = Normalize(request.WorkspaceKey)?.ToLowerInvariant();
        if (!request.SupportsWorkspace && workspaceKey is not null)
            throw new BusinessValidationException("CATALOG_WORKSPACE_NOT_SUPPORTED", "Workspace key must be empty when workspace capability is disabled.");
        if (request.SupportsWorkspace && (workspaceKey is null || !SupportedWorkspaceKeys.Contains(workspaceKey)))
            throw new BusinessValidationException("CATALOG_WORKSPACE_INVALID", "A supported workspace key is required when workspace capability is enabled.");

        return (request.Name.Trim(), Normalize(request.Description), unit, currency, workspaceKey);
    }

    private async Task<CompanyCatalogItem?> FindAsync(Guid id, CancellationToken cancellationToken) =>
        await uow.Repository<CompanyCatalogItem>().GetSingleAsync(x => x.Id == id);

    private async Task AddAuditAsync(Guid? actorId, string entityType, Guid entityId, string action, object changes)
    {
        await uow.Repository<AuditLog>().AddAsync(new AuditLog { UserId = actorId, EntityType = entityType, EntityId = entityId.ToString(), Action = action, Changes = JsonSerializer.Serialize(changes), Timestamp = DateTime.UtcNow });
    }

    private static string? Normalize(string? value) => string.IsNullOrWhiteSpace(value) ? null : value.Trim();
    private static string? NormalizeCurrency(string? value)
    {
        var normalized = Normalize(value)?.ToUpperInvariant();
        if (normalized is null) return null;
        if (normalized.Length != 3 || !normalized.All(character => character is >= 'A' and <= 'Z'))
            throw new BusinessValidationException("CATALOG_CURRENCY_INVALID", "Currency must be an ISO-style three-letter code.");
        return normalized;
    }

    private static CompanyCatalogItemDetailDto ToDetail(CompanyCatalogItem item) => new()
    {
        Id = item.Id, Code = item.Code, Name = item.Name, Description = item.Description, Type = item.Type, Status = item.Status,
        DefaultUnit = item.DefaultUnit, BasePrice = item.BasePrice, Currency = item.Currency, SupportsLicense = item.SupportsLicense,
        SupportsSubscription = item.SupportsSubscription, SupportsWorkspace = item.SupportsWorkspace, WorkspaceKey = item.WorkspaceKey,
        CreatedAt = item.CreatedAt, UpdatedAt = item.UpdatedAt,
    };
}
