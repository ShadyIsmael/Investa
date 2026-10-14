using System.Text.Json;
using Investa.Application.Common;
using Investa.Application.DTOs;
using Investa.Application.Interfaces;
using Investa.Domain.Entities;
using Investa.Domain.Entities.Company;
using Investa.Domain.Entities.Security;
using Microsoft.EntityFrameworkCore;

namespace Investa.Application.Services;

public sealed class CompanySalesOpportunityService(IUnitOfWork uow) : ICompanySalesOpportunityService
{
    public async Task<CompanySalesOpportunityPageDto> ListAsync(CompanySalesOpportunityListQuery request, CancellationToken cancellationToken = default)
    {
        var page = Math.Max(1, request.Page);
        var pageSize = Math.Clamp(request.PageSize, 1, 100);
        var query = uow.Repository<CompanySalesOpportunity>().Query();

        if (request.Stage.HasValue) query = query.Where(x => x.Stage == request.Stage.Value);
        if (request.Status.HasValue) query = query.Where(x => x.Status == request.Status.Value);
        if (request.CustomerId.HasValue) query = query.Where(x => x.CustomerId == request.CustomerId.Value);
        if (request.CatalogItemId.HasValue) query = query.Where(x => x.InterestedItems.Any(item => item.CatalogItemId == request.CatalogItemId.Value));
        if (request.SalesOwnerUserId.HasValue) query = query.Where(x => x.SalesOwnerUserId == request.SalesOwnerUserId.Value);
        if (request.ExpectedCloseFrom.HasValue) query = query.Where(x => x.ExpectedCloseDate >= request.ExpectedCloseFrom.Value);
        if (request.ExpectedCloseTo.HasValue) query = query.Where(x => x.ExpectedCloseDate <= request.ExpectedCloseTo.Value);
        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var term = request.Search.Trim().ToLowerInvariant();
            query = query.Where(x => x.OpportunityCode.ToLower().Contains(term)
                || x.Title.ToLower().Contains(term)
                || x.Customer.CustomerCode.ToLower().Contains(term)
                || x.Customer.DisplayName.ToLower().Contains(term)
                || (x.SalesOwnerUser != null && x.SalesOwnerUser.Name.ToLower().Contains(term)));
        }

        var total = await query.CountAsync(cancellationToken);
        var descending = !string.Equals(request.SortDirection, "asc", StringComparison.OrdinalIgnoreCase);
        var sortBy = (request.SortBy ?? "createdAt").Trim().ToLowerInvariant();
        query = sortBy switch
        {
            "updatedat" => descending ? query.OrderByDescending(x => x.UpdatedAt).ThenBy(x => x.Id) : query.OrderBy(x => x.UpdatedAt).ThenBy(x => x.Id),
            "title" => descending ? query.OrderByDescending(x => x.Title).ThenBy(x => x.Id) : query.OrderBy(x => x.Title).ThenBy(x => x.Id),
            "customer" => descending ? query.OrderByDescending(x => x.Customer.DisplayName).ThenBy(x => x.Id) : query.OrderBy(x => x.Customer.DisplayName).ThenBy(x => x.Id),
            "stage" => descending ? query.OrderByDescending(x => x.Stage).ThenBy(x => x.Id) : query.OrderBy(x => x.Stage).ThenBy(x => x.Id),
            "status" => descending ? query.OrderByDescending(x => x.Status).ThenBy(x => x.Id) : query.OrderBy(x => x.Status).ThenBy(x => x.Id),
            "expectedvalue" => descending ? query.OrderByDescending(x => x.ExpectedValue).ThenBy(x => x.Id) : query.OrderBy(x => x.ExpectedValue).ThenBy(x => x.Id),
            "expectedclosedate" => descending ? query.OrderByDescending(x => x.ExpectedCloseDate).ThenBy(x => x.Id) : query.OrderBy(x => x.ExpectedCloseDate).ThenBy(x => x.Id),
            _ => descending ? query.OrderByDescending(x => x.CreatedAt).ThenBy(x => x.Id) : query.OrderBy(x => x.CreatedAt).ThenBy(x => x.Id),
        };

        var items = await query.Skip((page - 1) * pageSize).Take(pageSize).Select(ToListProjection).ToListAsync(cancellationToken);
        return new CompanySalesOpportunityPageDto { Page = page, PageSize = pageSize, Total = total, Items = items };
    }

    public async Task<CompanySalesOpportunityDetailDto?> GetAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var opportunity = await FindAsync(id, cancellationToken);
        return opportunity is null ? null : ToDetail(opportunity);
    }

    public async Task<CompanySalesOpportunityDetailDto> CreateAsync(CompanySalesOpportunityUpsertRequest request, CancellationToken cancellationToken = default, Guid? actorId = null)
    {
        await ValidateRequestAsync(request, null, cancellationToken);
        var sequence = (await uow.Repository<CompanySalesOpportunity>().Query().Select(x => (int?)x.CodeSequence).MaxAsync(cancellationToken) ?? 0) + 1;
        var now = DateTime.UtcNow;
        var opportunity = new CompanySalesOpportunity
        {
            Id = Guid.NewGuid(), CodeSequence = sequence, OpportunityCode = $"SAL-{sequence:000000}",
            Title = request.Title.Trim(), CustomerId = request.CustomerId, PrimaryContactId = request.PrimaryContactId,
            Stage = request.Stage, Status = CompanySalesOpportunityStatus.Open, ExpectedValue = request.ExpectedValue,
            Currency = NormalizeCurrency(request.Currency), Probability = request.Probability, ExpectedCloseDate = request.ExpectedCloseDate,
            SalesOwnerUserId = request.SalesOwnerUserId, Source = request.Source, Description = Normalize(request.Description),
            Notes = Normalize(request.Notes), CreatedAt = now, UpdatedAt = now,
        };
        await uow.Repository<CompanySalesOpportunity>().AddAsync(opportunity);
        foreach (var catalogItemId in request.CatalogItemIds.Distinct()) await uow.Repository<CompanySalesOpportunityItem>().AddAsync(new CompanySalesOpportunityItem { Id = Guid.NewGuid(), SalesOpportunityId = opportunity.Id, CatalogItemId = catalogItemId });
        await AddAuditAsync(actorId, opportunity, "Created", new { opportunity.OpportunityCode, opportunity.Title, opportunity.CustomerId, opportunity.Stage, opportunity.Status });
        await uow.SaveChangesAsync();
        return (await FindAsync(opportunity.Id, cancellationToken)) is { } saved ? ToDetail(saved) : ToDetail(opportunity);
    }

    public async Task<CompanySalesOpportunityDetailDto?> UpdateAsync(Guid id, CompanySalesOpportunityUpsertRequest request, CancellationToken cancellationToken = default, Guid? actorId = null)
    {
        var snapshot = await FindAsync(id, cancellationToken);
        if (snapshot is null) return null;
        EnsureOpen(snapshot);
        var opportunity = await FindForUpdateAsync(id, cancellationToken);
        if (opportunity is null) return null;
        EnsureOpen(opportunity);
        await ValidateRequestAsync(request, opportunity, cancellationToken);
        var oldStage = opportunity.Stage;
        opportunity.Title = request.Title.Trim(); opportunity.CustomerId = request.CustomerId; opportunity.PrimaryContactId = request.PrimaryContactId;
        opportunity.Stage = request.Stage; opportunity.ExpectedValue = request.ExpectedValue; opportunity.Currency = NormalizeCurrency(request.Currency);
        opportunity.Probability = request.Probability; opportunity.ExpectedCloseDate = request.ExpectedCloseDate; opportunity.SalesOwnerUserId = request.SalesOwnerUserId;
        opportunity.Source = request.Source; opportunity.Description = Normalize(request.Description); opportunity.Notes = Normalize(request.Notes); opportunity.UpdatedAt = DateTime.UtcNow;
        var requestedIds = request.CatalogItemIds.Distinct().ToHashSet();
        var trackedItems = opportunity.InterestedItems.ToList();
        foreach (var existing in trackedItems.Where(item => !requestedIds.Contains(item.CatalogItemId)).ToList()) { await uow.Repository<CompanySalesOpportunityItem>().DeleteAsync(existing); opportunity.InterestedItems.Remove(existing); }
        var existingIds = trackedItems.Select(item => item.CatalogItemId).Where(requestedIds.Contains).ToHashSet();
        foreach (var itemId in requestedIds.Where(itemId => !existingIds.Contains(itemId))) opportunity.InterestedItems.Add(new CompanySalesOpportunityItem { Id = Guid.NewGuid(), SalesOpportunityId = opportunity.Id, CatalogItemId = itemId });
        await AddAuditAsync(actorId, opportunity, "Updated", new { opportunity.OpportunityCode, opportunity.Title, opportunity.CustomerId, opportunity.UpdatedAt });
        if (oldStage != opportunity.Stage) await AddAuditAsync(actorId, opportunity, "StageChanged", new { opportunity.OpportunityCode, Before = oldStage, After = opportunity.Stage });
        await uow.Repository<CompanySalesOpportunity>().UpdateAsync(opportunity);
        await uow.SaveChangesAsync();
        return await GetAsync(id, cancellationToken);
    }

    public async Task<CompanySalesOpportunityDetailDto?> SetStageAsync(Guid id, CompanySalesOpportunityStage stage, CancellationToken cancellationToken = default, Guid? actorId = null)
    {
        if (!Enum.IsDefined(stage)) throw new BusinessValidationException("SALES_OPPORTUNITY_STAGE_INVALID", "The opportunity stage is invalid.");
        var snapshot = await FindAsync(id, cancellationToken);
        if (snapshot is null) return null;
        EnsureOpen(snapshot);
        var opportunity = await FindForUpdateAsync(id, cancellationToken);
        if (opportunity is null) return null;
        EnsureOpen(opportunity);
        var before = opportunity.Stage;
        opportunity.Stage = stage; opportunity.UpdatedAt = DateTime.UtcNow;
        await AddAuditAsync(actorId, opportunity, "StageChanged", new { opportunity.OpportunityCode, Before = before, After = stage });
        await uow.Repository<CompanySalesOpportunity>().UpdateAsync(opportunity);
        await uow.SaveChangesAsync();
        return await GetAsync(id, cancellationToken);
    }

    public async Task<CompanySalesOpportunityDetailDto?> MarkWonAsync(Guid id, CancellationToken cancellationToken = default, Guid? actorId = null)
    {
        var snapshot = await FindAsync(id, cancellationToken);
        if (snapshot is null) return null;
        EnsureOpen(snapshot);
        var opportunity = await FindForUpdateAsync(id, cancellationToken);
        if (opportunity is null) return null;
        EnsureOpen(opportunity);
        opportunity.Status = CompanySalesOpportunityStatus.Won; opportunity.WonAt = DateTime.UtcNow; opportunity.UpdatedAt = opportunity.WonAt.Value;
        await AddAuditAsync(actorId, opportunity, "Won", new { opportunity.OpportunityCode, opportunity.WonAt });
        await uow.Repository<CompanySalesOpportunity>().UpdateAsync(opportunity);
        await uow.SaveChangesAsync();
        return await GetAsync(id, cancellationToken);
    }

    public async Task<CompanySalesOpportunityDetailDto?> MarkLostAsync(Guid id, string lostReason, CancellationToken cancellationToken = default, Guid? actorId = null)
    {
        var reason = Normalize(lostReason);
        if (reason is null || reason.Length > 1000) throw new BusinessValidationException("SALES_OPPORTUNITY_LOST_REASON_REQUIRED", "A lost reason is required and must be at most 1,000 characters.");
        var snapshot = await FindAsync(id, cancellationToken);
        if (snapshot is null) return null;
        EnsureOpen(snapshot);
        var opportunity = await FindForUpdateAsync(id, cancellationToken);
        if (opportunity is null) return null;
        EnsureOpen(opportunity);
        opportunity.Status = CompanySalesOpportunityStatus.Lost; opportunity.LostReason = reason; opportunity.LostAt = DateTime.UtcNow; opportunity.UpdatedAt = opportunity.LostAt.Value;
        await AddAuditAsync(actorId, opportunity, "Lost", new { opportunity.OpportunityCode, opportunity.LostReason, opportunity.LostAt });
        await uow.Repository<CompanySalesOpportunity>().UpdateAsync(opportunity);
        await uow.SaveChangesAsync();
        return await GetAsync(id, cancellationToken);
    }

    public async Task<IReadOnlyList<CompanySalesOpportunityCustomerLookupDto>> CustomerLookupAsync(string? search, CancellationToken cancellationToken = default)
    {
        var query = uow.Repository<CompanyCustomer>().Query().Where(x => x.Status == CompanyCustomerStatus.Active);
        if (!string.IsNullOrWhiteSpace(search)) { var term = search.Trim().ToLowerInvariant(); query = query.Where(x => x.CustomerCode.ToLower().Contains(term) || x.DisplayName.ToLower().Contains(term)); }
        return await query.OrderBy(x => x.DisplayName).Take(50).Select(x => new CompanySalesOpportunityCustomerLookupDto { Id = x.Id, CustomerCode = x.CustomerCode, DisplayName = x.DisplayName }).ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<CompanySalesOpportunityContactLookupDto>> ContactLookupAsync(Guid customerId, string? search, CancellationToken cancellationToken = default)
    {
        var query = uow.Repository<CompanyCustomerContact>().Query().Where(x => x.CustomerId == customerId && x.IsActive);
        if (!string.IsNullOrWhiteSpace(search)) { var term = search.Trim().ToLowerInvariant(); query = query.Where(x => x.Name.ToLower().Contains(term) || (x.Email != null && x.Email.ToLower().Contains(term))); }
        return await query.OrderBy(x => x.Name).Take(50).Select(x => new CompanySalesOpportunityContactLookupDto { Id = x.Id, Name = x.Name, Email = x.Email }).ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<CompanySalesOpportunityCatalogLookupDto>> CatalogLookupAsync(string? search, CancellationToken cancellationToken = default)
    {
        var query = uow.Repository<CompanyCatalogItem>().Query().Where(x => x.Status == CompanyCatalogItemStatus.Active);
        if (!string.IsNullOrWhiteSpace(search)) { var term = search.Trim().ToLowerInvariant(); query = query.Where(x => x.Code.ToLower().Contains(term) || x.Name.ToLower().Contains(term)); }
        return await query.OrderBy(x => x.Name).Take(100).Select(x => new CompanySalesOpportunityCatalogLookupDto { Id = x.Id, Code = x.Code, Name = x.Name, Type = x.Type }).ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<CompanySalesOpportunityOwnerLookupDto>> OwnerLookupAsync(string? search, CancellationToken cancellationToken = default)
    {
        var query = uow.Repository<AuthUser>().Query().Where(x => x.Status && x.UserType == Investa.Domain.Entities.Enums.UserType.OrgUser);
        if (!string.IsNullOrWhiteSpace(search)) { var term = search.Trim().ToLowerInvariant(); query = query.Where(x => x.Name.ToLower().Contains(term) || (x.Email != null && x.Email.ToLower().Contains(term))); }
        return await query.OrderBy(x => x.Name).Take(50).Select(x => new CompanySalesOpportunityOwnerLookupDto { Id = x.Id, Name = x.Name, Email = x.Email }).ToListAsync(cancellationToken);
    }

    private async Task ValidateRequestAsync(CompanySalesOpportunityUpsertRequest request, CompanySalesOpportunity? existing, CancellationToken cancellationToken)
    {
        if (!Enum.IsDefined(request.Stage)) throw new BusinessValidationException("SALES_OPPORTUNITY_STAGE_INVALID", "The opportunity stage is invalid.");
        if (request.Source.HasValue && !Enum.IsDefined(request.Source.Value)) throw new BusinessValidationException("SALES_OPPORTUNITY_SOURCE_INVALID", "The opportunity source is invalid.");
        if (string.IsNullOrWhiteSpace(request.Title) || request.Title.Trim().Length > 200) throw new BusinessValidationException("SALES_OPPORTUNITY_TITLE_REQUIRED", "Title is required and must be at most 200 characters.");
        if (request.ExpectedValue is < 0) throw new BusinessValidationException("SALES_OPPORTUNITY_VALUE_INVALID", "Expected value cannot be negative.");
        if (request.Probability is < 0 or > 100) throw new BusinessValidationException("SALES_OPPORTUNITY_PROBABILITY_INVALID", "Probability must be between 0 and 100.");
        if (request.Description?.Trim().Length > 4000 || request.Notes?.Trim().Length > 4000) throw new BusinessValidationException("SALES_OPPORTUNITY_TEXT_INVALID", "Description and notes must be at most 4,000 characters.");
        var customer = await uow.Repository<CompanyCustomer>().Query().SingleOrDefaultAsync(x => x.Id == request.CustomerId, cancellationToken);
        if (customer is null) throw new BusinessValidationException("SALES_OPPORTUNITY_CUSTOMER_NOT_FOUND", "The selected Company Customer was not found.");
        if (customer.Status != CompanyCustomerStatus.Active && (existing is null || existing.CustomerId != request.CustomerId)) throw new BusinessValidationException("SALES_OPPORTUNITY_CUSTOMER_INACTIVE", "New relationships must target an active Company Customer.");
        if (request.PrimaryContactId.HasValue)
        {
            var contact = await uow.Repository<CompanyCustomerContact>().Query().SingleOrDefaultAsync(x => x.Id == request.PrimaryContactId.Value, cancellationToken);
            if (contact is null || contact.CustomerId != request.CustomerId || !contact.IsActive) throw new BusinessValidationException("SALES_OPPORTUNITY_CONTACT_INVALID", "The selected contact must be an active contact of the selected Company Customer.");
        }
        if (request.SalesOwnerUserId.HasValue && !await uow.Repository<AuthUser>().Query().AnyAsync(x => x.Id == request.SalesOwnerUserId.Value && x.Status && x.UserType == Investa.Domain.Entities.Enums.UserType.OrgUser, cancellationToken)) throw new BusinessValidationException("SALES_OPPORTUNITY_OWNER_INVALID", "The selected sales owner is not an active internal user.");
        var currency = NormalizeCurrency(request.Currency);
        if (currency is not null && !await uow.Repository<Currency>().Query().AnyAsync(x => x.ISOCode == currency && x.IsActive, cancellationToken)) throw new BusinessValidationException("SALES_OPPORTUNITY_CURRENCY_INVALID", "Currency must be an active currency master code.");
        var requestedIds = request.CatalogItemIds.Distinct().ToArray();
        if (requestedIds.Length > 100) throw new BusinessValidationException("SALES_OPPORTUNITY_ITEMS_INVALID", "An opportunity can reference at most 100 catalog items.");
        var existingIds = existing?.InterestedItems.Select(x => x.CatalogItemId).ToHashSet() ?? [];
        var catalogItems = await uow.Repository<CompanyCatalogItem>().Query().Where(x => requestedIds.Contains(x.Id)).Select(x => new { x.Id, x.Status }).ToListAsync(cancellationToken);
        if (catalogItems.Count != requestedIds.Length) throw new BusinessValidationException("SALES_OPPORTUNITY_ITEM_NOT_FOUND", "One or more selected catalog items were not found.");
        if (catalogItems.Any(x => x.Status != CompanyCatalogItemStatus.Active && !existingIds.Contains(x.Id))) throw new BusinessValidationException("SALES_OPPORTUNITY_ITEM_INACTIVE", "New catalog item relationships must target active items.");
    }

    private async Task<CompanySalesOpportunity?> FindAsync(Guid id, CancellationToken cancellationToken) => await uow.Repository<CompanySalesOpportunity>().Query().AsNoTracking()
        .Include(x => x.Customer).Include(x => x.PrimaryContact).Include(x => x.SalesOwnerUser).Include(x => x.InterestedItems).ThenInclude(x => x.CatalogItem).SingleOrDefaultAsync(x => x.Id == id, cancellationToken);

    private async Task<CompanySalesOpportunity?> FindForUpdateAsync(Guid id, CancellationToken cancellationToken) => await uow.Repository<CompanySalesOpportunity>().GetSingleAsync(x => x.Id == id, x => x.Customer, x => x.PrimaryContact!, x => x.SalesOwnerUser!, x => x.InterestedItems);

    private static void EnsureOpen(CompanySalesOpportunity opportunity)
    {
        if (opportunity.Status != CompanySalesOpportunityStatus.Open) throw new BusinessValidationException("SALES_OPPORTUNITY_CLOSED", "Won and Lost opportunities are read-only and cannot be reopened.");
    }

    private async Task AddAuditAsync(Guid? actorId, CompanySalesOpportunity opportunity, string action, object changes) => await uow.Repository<AuditLog>().AddAsync(new AuditLog { UserId = actorId, EntityType = nameof(CompanySalesOpportunity), EntityId = opportunity.Id.ToString(), Action = action, Changes = JsonSerializer.Serialize(changes), Timestamp = DateTime.UtcNow });

    private static CompanySalesOpportunityListItemDto ToList(CompanySalesOpportunity x) => new()
    {
        Id = x.Id, OpportunityCode = x.OpportunityCode, Title = x.Title, CustomerId = x.CustomerId, CustomerCode = x.Customer.CustomerCode, CustomerDisplayName = x.Customer.DisplayName,
        Stage = x.Stage, Status = x.Status, InterestedItems = x.InterestedItems.OrderBy(item => item.CatalogItem.Name).Select(item => new CompanySalesOpportunityItemSummaryDto { Id = item.Id, CatalogItemId = item.CatalogItemId, Code = item.CatalogItem.Code, Name = item.CatalogItem.Name, Type = item.CatalogItem.Type }).ToList(),
        ExpectedValue = x.ExpectedValue, Currency = x.Currency, Probability = x.Probability, ExpectedCloseDate = x.ExpectedCloseDate, SalesOwnerUserId = x.SalesOwnerUserId, SalesOwnerName = x.SalesOwnerUser?.Name, CreatedAt = x.CreatedAt, UpdatedAt = x.UpdatedAt,
    };

    private static readonly System.Linq.Expressions.Expression<Func<CompanySalesOpportunity, CompanySalesOpportunityListItemDto>> ToListProjection = x => new CompanySalesOpportunityListItemDto
    {
        Id = x.Id, OpportunityCode = x.OpportunityCode, Title = x.Title, CustomerId = x.CustomerId, CustomerCode = x.Customer.CustomerCode, CustomerDisplayName = x.Customer.DisplayName,
        Stage = x.Stage, Status = x.Status, InterestedItems = x.InterestedItems.OrderBy(item => item.CatalogItem.Name).Select(item => new CompanySalesOpportunityItemSummaryDto { Id = item.Id, CatalogItemId = item.CatalogItemId, Code = item.CatalogItem.Code, Name = item.CatalogItem.Name, Type = item.CatalogItem.Type }).ToList(),
        ExpectedValue = x.ExpectedValue, Currency = x.Currency, Probability = x.Probability, ExpectedCloseDate = x.ExpectedCloseDate, SalesOwnerUserId = x.SalesOwnerUserId, SalesOwnerName = x.SalesOwnerUser == null ? null : x.SalesOwnerUser.Name, CreatedAt = x.CreatedAt, UpdatedAt = x.UpdatedAt,
    };

    private static CompanySalesOpportunityDetailDto ToDetail(CompanySalesOpportunity x)
    {
        var list = ToList(x);
        return new CompanySalesOpportunityDetailDto
        {
            Id = list.Id, OpportunityCode = list.OpportunityCode, Title = list.Title, CustomerId = list.CustomerId, CustomerCode = list.CustomerCode, CustomerDisplayName = list.CustomerDisplayName,
            Stage = list.Stage, Status = list.Status, InterestedItems = list.InterestedItems, ExpectedValue = list.ExpectedValue, Currency = list.Currency, Probability = list.Probability,
            ExpectedCloseDate = list.ExpectedCloseDate, SalesOwnerUserId = list.SalesOwnerUserId, SalesOwnerName = list.SalesOwnerName, CreatedAt = list.CreatedAt, UpdatedAt = list.UpdatedAt,
            PrimaryContactId = x.PrimaryContactId, PrimaryContactName = x.PrimaryContact?.Name, Source = x.Source, Description = x.Description, Notes = x.Notes, LostReason = x.LostReason, WonAt = x.WonAt, LostAt = x.LostAt,
        };
    }

    private static string? Normalize(string? value) => string.IsNullOrWhiteSpace(value) ? null : value.Trim();
    private static string? NormalizeCurrency(string? value) => Normalize(value)?.ToUpperInvariant();
}
