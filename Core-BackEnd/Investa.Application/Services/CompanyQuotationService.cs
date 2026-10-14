using System.Text.Json;
using Investa.Application.Common;
using Investa.Application.DTOs;
using Investa.Application.Interfaces;
using Investa.Domain.Entities;
using Investa.Domain.Entities.Company;
using Investa.Domain.Entities.Enums;
using Investa.Domain.Entities.Security;
using Microsoft.EntityFrameworkCore;

namespace Investa.Application.Services;

public sealed class CompanyQuotationService(IUnitOfWork uow) : ICompanyQuotationService
{
    private static readonly HashSet<string> AllowedUnits = new(StringComparer.OrdinalIgnoreCase)
    {
        "Unit", "User", "Seat", "Month", "Year", "Project", "Hour", "Day"
    };

    public async Task<CompanyQuotationPageDto> ListAsync(CompanyQuotationListQuery request, CancellationToken cancellationToken = default)
    {
        var page = Math.Max(1, request.Page);
        var pageSize = Math.Clamp(request.PageSize, 1, 100);
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var query = uow.Repository<CompanyQuotation>().Query();

        if (request.Status.HasValue) query = query.Where(x => x.Status == request.Status.Value);
        if (request.CustomerId.HasValue) query = query.Where(x => x.CustomerId == request.CustomerId.Value);
        if (request.SalesOpportunityId.HasValue) query = query.Where(x => x.SalesOpportunityId == request.SalesOpportunityId.Value);
        if (!string.IsNullOrWhiteSpace(request.Currency)) query = query.Where(x => x.Currency == request.Currency.Trim().ToUpper());
        if (request.IssueDateFrom.HasValue) query = query.Where(x => x.IssueDate >= request.IssueDateFrom.Value);
        if (request.IssueDateTo.HasValue) query = query.Where(x => x.IssueDate <= request.IssueDateTo.Value);
        if (request.ValidUntilFrom.HasValue) query = query.Where(x => x.ValidUntil >= request.ValidUntilFrom.Value);
        if (request.ValidUntilTo.HasValue) query = query.Where(x => x.ValidUntil <= request.ValidUntilTo.Value);
        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var term = request.Search.Trim().ToLowerInvariant();
            query = query.Where(x => x.QuotationNumber.ToLower().Contains(term)
                || x.CustomerCodeSnapshot.ToLower().Contains(term)
                || x.CustomerNameSnapshot.ToLower().Contains(term)
                || (x.SalesOpportunity != null && (x.SalesOpportunity.OpportunityCode.ToLower().Contains(term) || x.SalesOpportunity.Title.ToLower().Contains(term))));
        }

        var total = await query.CountAsync(cancellationToken);
        var descending = !string.Equals(request.SortDirection, "asc", StringComparison.OrdinalIgnoreCase);
        var sortBy = (request.SortBy ?? "createdAt").Trim().ToLowerInvariant();
        query = sortBy switch
        {
            "quotationnumber" => descending ? query.OrderByDescending(x => x.QuotationNumber).ThenBy(x => x.Id) : query.OrderBy(x => x.QuotationNumber).ThenBy(x => x.Id),
            "customer" => descending ? query.OrderByDescending(x => x.CustomerNameSnapshot).ThenBy(x => x.Id) : query.OrderBy(x => x.CustomerNameSnapshot).ThenBy(x => x.Id),
            "issuedate" => descending ? query.OrderByDescending(x => x.IssueDate).ThenBy(x => x.Id) : query.OrderBy(x => x.IssueDate).ThenBy(x => x.Id),
            "validuntil" => descending ? query.OrderByDescending(x => x.ValidUntil).ThenBy(x => x.Id) : query.OrderBy(x => x.ValidUntil).ThenBy(x => x.Id),
            "status" => descending ? query.OrderByDescending(x => x.Status).ThenBy(x => x.Id) : query.OrderBy(x => x.Status).ThenBy(x => x.Id),
            "grandtotal" => descending ? query.OrderByDescending(x => x.GrandTotal).ThenBy(x => x.Id) : query.OrderBy(x => x.GrandTotal).ThenBy(x => x.Id),
            "updatedat" => descending ? query.OrderByDescending(x => x.UpdatedAt).ThenBy(x => x.Id) : query.OrderBy(x => x.UpdatedAt).ThenBy(x => x.Id),
            _ => descending ? query.OrderByDescending(x => x.CreatedAt).ThenBy(x => x.Id) : query.OrderBy(x => x.CreatedAt).ThenBy(x => x.Id),
        };

        var items = await query.Skip((page - 1) * pageSize).Take(pageSize).Select(x => new CompanyQuotationListItemDto
        {
            Id = x.Id,
            QuotationNumber = x.QuotationNumber,
            CustomerId = x.CustomerId,
            CustomerCode = x.CustomerCodeSnapshot,
            CustomerName = x.CustomerNameSnapshot,
            SalesOpportunityId = x.SalesOpportunityId,
            SalesOpportunityCode = x.SalesOpportunity == null ? null : x.SalesOpportunity.OpportunityCode,
            SalesOpportunityTitle = x.SalesOpportunity == null ? null : x.SalesOpportunity.Title,
            Status = x.Status,
            IssueDate = x.IssueDate,
            ValidUntil = x.ValidUntil,
            IsExpired = x.Status != CompanyQuotationStatus.Accepted && x.Status != CompanyQuotationStatus.Rejected && x.ValidUntil.HasValue && x.ValidUntil.Value < today,
            Currency = x.Currency,
            Subtotal = x.Subtotal,
            DiscountTotal = x.DiscountTotal,
            TaxTotal = x.TaxTotal,
            GrandTotal = x.GrandTotal,
            UpdatedAt = x.UpdatedAt,
        }).ToListAsync(cancellationToken);

        return new CompanyQuotationPageDto { Page = page, PageSize = pageSize, Total = total, Items = items };
    }

    public async Task<CompanyQuotationDetailDto?> GetAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var quotation = await FindAsync(id, cancellationToken);
        return quotation is null ? null : ToDetail(quotation);
    }

    public async Task<CompanyQuotationDetailDto> CreateAsync(CompanyQuotationUpsertRequest request, CancellationToken cancellationToken = default, Guid? actorId = null)
    {
        var prepared = await ValidateAndPrepareAsync(request, null, cancellationToken);
        var sequence = (await uow.Repository<CompanyQuotation>().Query().Select(x => (int?)x.NumberSequence).MaxAsync(cancellationToken) ?? 0) + 1;
        var now = DateTime.UtcNow;
        var quotation = new CompanyQuotation
        {
            Id = Guid.NewGuid(), NumberSequence = sequence, QuotationNumber = $"QTN-{sequence:000000}",
            CustomerId = prepared.Customer.Id, SalesOpportunityId = prepared.Opportunity?.Id, ContactId = prepared.Contact?.Id,
            CustomerCodeSnapshot = prepared.Customer.CustomerCode, CustomerNameSnapshot = prepared.Customer.DisplayName,
            ContactNameSnapshot = prepared.Contact?.Name, ContactEmailSnapshot = prepared.Contact?.Email, ContactPhoneSnapshot = prepared.Contact?.Phone,
            Status = CompanyQuotationStatus.Draft, IssueDate = prepared.IssueDate, ValidUntil = prepared.ValidUntil, Currency = prepared.Currency,
            PaymentTerms = prepared.PaymentTerms, CommercialTerms = prepared.CommercialTerms, Notes = prepared.Notes,
            Subtotal = prepared.Totals.Subtotal, DiscountTotal = prepared.Totals.DiscountTotal, TaxTotal = prepared.Totals.TaxTotal, GrandTotal = prepared.Totals.GrandTotal,
            CreatedAt = now, UpdatedAt = now,
        };
        await uow.Repository<CompanyQuotation>().AddAsync(quotation);
        await AddLinesAsync(quotation.Id, prepared.Lines, cancellationToken);
        await AddAuditAsync(actorId, quotation, "Created", new { quotation.QuotationNumber, quotation.CustomerId, quotation.SalesOpportunityId, quotation.Currency, quotation.GrandTotal, lineCount = prepared.Lines.Count });
        await uow.SaveChangesAsync();
        return (await GetAsync(quotation.Id, cancellationToken))!;
    }

    public async Task<CompanyQuotationDetailDto?> UpdateAsync(Guid id, CompanyQuotationUpsertRequest request, CancellationToken cancellationToken = default, Guid? actorId = null)
    {
        var snapshot = await FindAsync(id, cancellationToken);
        if (snapshot is null) return null;
        EnsureDraft(snapshot);
        var quotation = await FindForUpdateAsync(id, cancellationToken);
        if (quotation is null) return null;
        EnsureDraft(quotation);
        var prepared = await ValidateAndPrepareAsync(request, quotation, cancellationToken);

        quotation.CustomerId = prepared.Customer.Id; quotation.SalesOpportunityId = prepared.Opportunity?.Id; quotation.ContactId = prepared.Contact?.Id;
        quotation.CustomerCodeSnapshot = prepared.Customer.CustomerCode; quotation.CustomerNameSnapshot = prepared.Customer.DisplayName;
        quotation.ContactNameSnapshot = prepared.Contact?.Name; quotation.ContactEmailSnapshot = prepared.Contact?.Email; quotation.ContactPhoneSnapshot = prepared.Contact?.Phone;
        quotation.IssueDate = prepared.IssueDate; quotation.ValidUntil = prepared.ValidUntil; quotation.Currency = prepared.Currency;
        quotation.PaymentTerms = prepared.PaymentTerms; quotation.CommercialTerms = prepared.CommercialTerms; quotation.Notes = prepared.Notes;
        quotation.Subtotal = prepared.Totals.Subtotal; quotation.DiscountTotal = prepared.Totals.DiscountTotal; quotation.TaxTotal = prepared.Totals.TaxTotal; quotation.GrandTotal = prepared.Totals.GrandTotal; quotation.UpdatedAt = DateTime.UtcNow;

        foreach (var existingLine in quotation.Lines.ToList())
        {
            await uow.Repository<CompanyQuotationLine>().DeleteAsync(existingLine);
            quotation.Lines.Remove(existingLine);
        }
        await AddLinesAsync(quotation.Id, prepared.Lines, cancellationToken);
        await AddAuditAsync(actorId, quotation, "Updated", new { quotation.QuotationNumber, quotation.CustomerId, quotation.Currency, quotation.GrandTotal, lineCount = prepared.Lines.Count });
        await uow.Repository<CompanyQuotation>().UpdateAsync(quotation);
        await uow.SaveChangesAsync();
        return await GetAsync(id, cancellationToken);
    }

    public Task<CompanyQuotationDetailDto?> MarkSentAsync(Guid id, CancellationToken cancellationToken = default, Guid? actorId = null) => TransitionAsync(id, CompanyQuotationStatus.Sent, null, cancellationToken, actorId);
    public Task<CompanyQuotationDetailDto?> MarkAcceptedAsync(Guid id, CancellationToken cancellationToken = default, Guid? actorId = null) => TransitionAsync(id, CompanyQuotationStatus.Accepted, null, cancellationToken, actorId);
    public Task<CompanyQuotationDetailDto?> MarkRejectedAsync(Guid id, string rejectionReason, CancellationToken cancellationToken = default, Guid? actorId = null) => TransitionAsync(id, CompanyQuotationStatus.Rejected, rejectionReason, cancellationToken, actorId);

    public async Task<IReadOnlyList<CompanyQuotationCustomerLookupDto>> CustomerLookupAsync(string? search, CancellationToken cancellationToken = default)
    {
        var query = uow.Repository<CompanyCustomer>().Query().Where(x => x.Status == CompanyCustomerStatus.Active);
        if (!string.IsNullOrWhiteSpace(search)) { var term = search.Trim().ToLowerInvariant(); query = query.Where(x => x.CustomerCode.ToLower().Contains(term) || x.DisplayName.ToLower().Contains(term)); }
        return await query.OrderBy(x => x.DisplayName).Take(50).Select(x => new CompanyQuotationCustomerLookupDto { Id = x.Id, CustomerCode = x.CustomerCode, DisplayName = x.DisplayName }).ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<CompanyQuotationContactLookupDto>> ContactLookupAsync(Guid customerId, string? search, CancellationToken cancellationToken = default)
    {
        var query = uow.Repository<CompanyCustomerContact>().Query().Where(x => x.CustomerId == customerId && x.IsActive);
        if (!string.IsNullOrWhiteSpace(search)) { var term = search.Trim().ToLowerInvariant(); query = query.Where(x => x.Name.ToLower().Contains(term) || (x.Email != null && x.Email.ToLower().Contains(term))); }
        return await query.OrderBy(x => x.Name).Take(50).Select(x => new CompanyQuotationContactLookupDto { Id = x.Id, Name = x.Name, Email = x.Email, Phone = x.Phone }).ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<CompanyQuotationOpportunityLookupDto>> OpportunityLookupAsync(Guid? customerId, string? search, CancellationToken cancellationToken = default)
    {
        var query = uow.Repository<CompanySalesOpportunity>().Query().Where(x => x.Status != CompanySalesOpportunityStatus.Lost);
        if (customerId.HasValue) query = query.Where(x => x.CustomerId == customerId.Value);
        if (!string.IsNullOrWhiteSpace(search)) { var term = search.Trim().ToLowerInvariant(); query = query.Where(x => x.OpportunityCode.ToLower().Contains(term) || x.Title.ToLower().Contains(term)); }
        return await query.OrderByDescending(x => x.UpdatedAt).Take(50).Select(x => new CompanyQuotationOpportunityLookupDto { Id = x.Id, OpportunityCode = x.OpportunityCode, Title = x.Title, CustomerId = x.CustomerId, ContactId = x.PrimaryContactId, CustomerDisplayName = x.Customer.DisplayName, Status = x.Status, Currency = x.Currency, InterestedCatalogItemIds = x.InterestedItems.Select(item => item.CatalogItemId).ToList() }).ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<CompanyQuotationCatalogLookupDto>> CatalogLookupAsync(string? search, CancellationToken cancellationToken = default)
    {
        var query = uow.Repository<CompanyCatalogItem>().Query().Where(x => x.Status == CompanyCatalogItemStatus.Active);
        if (!string.IsNullOrWhiteSpace(search)) { var term = search.Trim().ToLowerInvariant(); query = query.Where(x => x.Code.ToLower().Contains(term) || x.Name.ToLower().Contains(term)); }
        return await query.OrderBy(x => x.Name).Take(100).Select(x => new CompanyQuotationCatalogLookupDto { Id = x.Id, Code = x.Code, Name = x.Name, Description = x.Description, Type = x.Type, DefaultUnit = x.DefaultUnit, BasePrice = x.BasePrice, Currency = x.Currency, SupportsLicense = x.SupportsLicense, SupportsSubscription = x.SupportsSubscription }).ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<CompanyQuotationCurrencyLookupDto>> CurrencyLookupAsync(string? search, CancellationToken cancellationToken = default)
    {
        var query = uow.Repository<Currency>().Query().Where(x => x.IsActive);
        if (!string.IsNullOrWhiteSpace(search)) { var term = search.Trim().ToLowerInvariant(); query = query.Where(x => x.ISOCode.ToLower().Contains(term) || x.EnglishName.ToLower().Contains(term) || x.ArabicName.ToLower().Contains(term)); }
        return await query.OrderBy(x => x.ISOCode).Take(100).Select(x => new CompanyQuotationCurrencyLookupDto { Code = x.ISOCode, Name = x.EnglishName, Symbol = x.Symbol }).ToListAsync(cancellationToken);
    }

    private async Task<CompanyQuotationDetailDto?> TransitionAsync(Guid id, CompanyQuotationStatus target, string? rejectionReason, CancellationToken cancellationToken, Guid? actorId)
    {
        var quotation = await FindForUpdateAsync(id, cancellationToken);
        if (quotation is null) return null;
        var reason = Normalize(rejectionReason);
        if (target == CompanyQuotationStatus.Rejected && (reason is null || reason.Length > 1000)) throw new BusinessValidationException("QUOTATION_REJECTION_REASON_REQUIRED", "A rejection reason is required and must be at most 1,000 characters.");
        if (target == CompanyQuotationStatus.Sent && quotation.Status != CompanyQuotationStatus.Draft) throw new BusinessValidationException("QUOTATION_TRANSITION_INVALID", "Only Draft quotations can be sent.");
        if ((target == CompanyQuotationStatus.Accepted || target == CompanyQuotationStatus.Rejected) && quotation.Status != CompanyQuotationStatus.Sent) throw new BusinessValidationException("QUOTATION_TRANSITION_INVALID", "Only Sent quotations can be accepted or rejected.");
        quotation.Status = target; quotation.SentAt = target == CompanyQuotationStatus.Sent ? DateTime.UtcNow : quotation.SentAt;
        quotation.AcceptedAt = target == CompanyQuotationStatus.Accepted ? DateTime.UtcNow : quotation.AcceptedAt;
        quotation.RejectedAt = target == CompanyQuotationStatus.Rejected ? DateTime.UtcNow : quotation.RejectedAt;
        quotation.RejectionReason = target == CompanyQuotationStatus.Rejected ? reason : quotation.RejectionReason;
        quotation.UpdatedAt = DateTime.UtcNow;
        await AddAuditAsync(actorId, quotation, target.ToString(), new { quotation.QuotationNumber, quotation.Status, quotation.SentAt, quotation.AcceptedAt, quotation.RejectedAt, quotation.RejectionReason });
        await uow.Repository<CompanyQuotation>().UpdateAsync(quotation);
        await uow.SaveChangesAsync();
        return await GetAsync(id, cancellationToken);
    }

    private async Task<PreparedQuotation> ValidateAndPrepareAsync(CompanyQuotationUpsertRequest request, CompanyQuotation? existing, CancellationToken cancellationToken)
    {
        var customer = await uow.Repository<CompanyCustomer>().Query().SingleOrDefaultAsync(x => x.Id == request.CustomerId, cancellationToken)
            ?? throw new BusinessValidationException("QUOTATION_CUSTOMER_NOT_FOUND", "The selected Company Customer was not found.");
        if (customer.Status != CompanyCustomerStatus.Active && (existing is null || existing.CustomerId != customer.Id)) throw new BusinessValidationException("QUOTATION_CUSTOMER_INACTIVE", "New quotations must target an active Company Customer.");

        var issueDate = request.IssueDate ?? DateOnly.FromDateTime(DateTime.UtcNow);
        if (request.ValidUntil.HasValue && request.ValidUntil.Value < issueDate) throw new BusinessValidationException("QUOTATION_VALID_UNTIL_INVALID", "Valid until must be on or after the issue date.");
        var currency = NormalizeCurrency(request.Currency) ?? throw new BusinessValidationException("QUOTATION_CURRENCY_REQUIRED", "Currency is required for a quotation.");
        if (!await uow.Repository<Currency>().Query().AnyAsync(x => x.ISOCode == currency && x.IsActive, cancellationToken)) throw new BusinessValidationException("QUOTATION_CURRENCY_INVALID", "Currency must be an active currency master code.");

        CompanySalesOpportunity? opportunity = null;
        if (request.SalesOpportunityId.HasValue)
        {
            opportunity = await uow.Repository<CompanySalesOpportunity>().Query().Include(x => x.InterestedItems).SingleOrDefaultAsync(x => x.Id == request.SalesOpportunityId.Value, cancellationToken)
                ?? throw new BusinessValidationException("QUOTATION_OPPORTUNITY_NOT_FOUND", "The selected Company Sales Opportunity was not found.");
            if (opportunity.CustomerId != customer.Id) throw new BusinessValidationException("QUOTATION_OPPORTUNITY_CUSTOMER_MISMATCH", "The Sales Opportunity must belong to the selected Company Customer.");
            if (opportunity.Status == CompanySalesOpportunityStatus.Lost) throw new BusinessValidationException("QUOTATION_OPPORTUNITY_NOT_SUITABLE", "A Lost Sales Opportunity cannot be linked to a new quotation.");
        }

        CompanyCustomerContact? contact = null;
        if (request.ContactId.HasValue)
        {
            contact = await uow.Repository<CompanyCustomerContact>().Query().SingleOrDefaultAsync(x => x.Id == request.ContactId.Value, cancellationToken);
            if (contact is null || contact.CustomerId != customer.Id || (!contact.IsActive && (existing is null || existing.ContactId != contact.Id))) throw new BusinessValidationException("QUOTATION_CONTACT_INVALID", "The selected contact must belong to the customer and be active for a new quotation.");
        }

        var lines = request.Lines ?? [];
        if (lines.Count == 0) throw new BusinessValidationException("QUOTATION_LINES_REQUIRED", "At least one quotation line is required.");
        if (lines.Count > 100) throw new BusinessValidationException("QUOTATION_LINES_INVALID", "A quotation can contain at most 100 lines.");
        var catalogIds = lines.Where(x => x.CatalogItemId.HasValue).Select(x => x.CatalogItemId!.Value).Distinct().ToArray();
        var catalogItems = await uow.Repository<CompanyCatalogItem>().Query().Where(x => catalogIds.Contains(x.Id)).ToDictionaryAsync(x => x.Id, cancellationToken);
        var existingCatalogIds = existing?.Lines.Select(x => x.CatalogItemId).Where(x => x.HasValue).Select(x => x!.Value).ToHashSet() ?? [];
        foreach (var catalogId in catalogIds)
        {
            if (!catalogItems.ContainsKey(catalogId)) throw new BusinessValidationException("QUOTATION_CATALOG_ITEM_NOT_FOUND", "One or more selected catalog items were not found.");
            if (catalogItems[catalogId].Status != CompanyCatalogItemStatus.Active && !existingCatalogIds.Contains(catalogId)) throw new BusinessValidationException("QUOTATION_CATALOG_ITEM_INACTIVE", "New quotation lines must target active catalog items.");
        }

        var preparedLines = new List<PreparedLine>();
        for (var index = 0; index < lines.Count; index++)
        {
            var input = lines[index];
            var catalog = input.CatalogItemId.HasValue ? catalogItems[input.CatalogItemId.Value] : null;
            var itemName = catalog?.Name ?? Normalize(input.ItemName);
            if (itemName is null || itemName.Length > 200) throw new BusinessValidationException("QUOTATION_LINE_NAME_REQUIRED", "Each custom quotation line requires a name of at most 200 characters.");
            var description = Normalize(input.Description) ?? Normalize(catalog?.Description) ?? itemName;
            if (description.Length > 4000) throw new BusinessValidationException("QUOTATION_LINE_DESCRIPTION_INVALID", "Line description must be at most 4,000 characters.");
            var unit = Normalize(input.Unit) ?? Normalize(catalog?.DefaultUnit) ?? "Unit";
            if (!AllowedUnits.Contains(unit)) throw new BusinessValidationException("QUOTATION_UNIT_INVALID", "Line unit is not supported.");
            unit = AllowedUnits.First(x => string.Equals(x, unit, StringComparison.OrdinalIgnoreCase));
            var unitPrice = input.UnitPrice;
            if (!unitPrice.HasValue && catalog?.BasePrice is not null && string.Equals(NormalizeCurrency(catalog.Currency), currency, StringComparison.OrdinalIgnoreCase)) unitPrice = catalog.BasePrice;
            if (!unitPrice.HasValue || unitPrice.Value < 0) throw new BusinessValidationException("QUOTATION_UNIT_PRICE_INVALID", "Unit price is required and cannot be negative.");
            if (input.Quantity <= 0) throw new BusinessValidationException("QUOTATION_QUANTITY_INVALID", "Quantity must be greater than zero.");
            if (input.DiscountValue < 0) throw new BusinessValidationException("QUOTATION_DISCOUNT_INVALID", "Discount cannot be negative.");
            if (!Enum.IsDefined(input.DiscountType)) throw new BusinessValidationException("QUOTATION_DISCOUNT_INVALID", "Discount type is invalid.");
            if (input.DiscountType == CompanyQuotationDiscountType.Percentage && input.DiscountValue > 100) throw new BusinessValidationException("QUOTATION_DISCOUNT_INVALID", "Percentage discount must be between 0 and 100.");
            if (input.TaxRate is < 0 or > 100) throw new BusinessValidationException("QUOTATION_TAX_INVALID", "Tax rate must be between 0 and 100.");

            try
            {
                var subtotal = Money(input.Quantity * unitPrice.Value);
                var discount = input.DiscountType switch
                {
                    CompanyQuotationDiscountType.None => 0m,
                    CompanyQuotationDiscountType.Percentage => Money(subtotal * input.DiscountValue / 100m),
                    CompanyQuotationDiscountType.FixedAmount => Money(input.DiscountValue),
                    _ => 0m,
                };
                if (discount > subtotal) throw new BusinessValidationException("QUOTATION_DISCOUNT_INVALID", "Discount cannot reduce a line below zero.");
                var taxable = Money(subtotal - discount);
                var tax = Money(taxable * input.TaxRate / 100m);
                var total = Money(taxable + tax);
                preparedLines.Add(new PreparedLine(index + 1, input.SortOrder ?? index, catalog?.Id, catalog?.Code, itemName, description, input.Quantity, unit, Money(unitPrice.Value), input.DiscountType, Money(input.DiscountValue), discount, Money(input.TaxRate), tax, subtotal, total));
            }
            catch (OverflowException)
            {
                throw new BusinessValidationException("QUOTATION_AMOUNT_INVALID", "Quotation amounts exceed the supported decimal precision.");
            }
        }

        QuotationTotals totals;
        try
        {
            totals = new QuotationTotals(Money(preparedLines.Sum(x => x.Subtotal)), Money(preparedLines.Sum(x => x.DiscountAmount)), Money(preparedLines.Sum(x => x.TaxAmount)), Money(preparedLines.Sum(x => x.LineTotal)));
        }
        catch (OverflowException)
        {
            throw new BusinessValidationException("QUOTATION_AMOUNT_INVALID", "Quotation totals exceed the supported decimal precision.");
        }
        return new PreparedQuotation(customer, opportunity, contact, issueDate, request.ValidUntil, currency, NormalizeLong(request.PaymentTerms, "QUOTATION_PAYMENT_TERMS_INVALID"), NormalizeLong(request.CommercialTerms, "QUOTATION_COMMERCIAL_TERMS_INVALID"), NormalizeLong(request.Notes, "QUOTATION_NOTES_INVALID"), preparedLines, totals);
    }

    private async Task AddLinesAsync(Guid quotationId, IReadOnlyList<PreparedLine> lines, CancellationToken cancellationToken)
    {
        foreach (var line in lines.OrderBy(x => x.SortOrder).ThenBy(x => x.LineNumber))
        {
            await uow.Repository<CompanyQuotationLine>().AddAsync(new CompanyQuotationLine
            {
                Id = Guid.NewGuid(), QuotationId = quotationId, LineNumber = line.LineNumber, SortOrder = line.SortOrder, CatalogItemId = line.CatalogItemId,
                ItemCodeSnapshot = line.ItemCode, ItemNameSnapshot = line.ItemName, Description = line.Description, Quantity = line.Quantity, Unit = line.Unit, UnitPrice = line.UnitPrice,
                DiscountType = line.DiscountType, DiscountValue = line.DiscountValue, DiscountAmount = line.DiscountAmount, TaxRate = line.TaxRate, TaxAmount = line.TaxAmount,
                LineSubtotal = line.Subtotal, LineTotal = line.LineTotal,
            });
        }
    }

    private async Task<CompanyQuotation?> FindAsync(Guid id, CancellationToken cancellationToken) => await uow.Repository<CompanyQuotation>().Query().AsNoTracking().Include(x => x.Customer).Include(x => x.SalesOpportunity).Include(x => x.Contact).Include(x => x.Contract).Include(x => x.Lines).ThenInclude(x => x.CatalogItem).SingleOrDefaultAsync(x => x.Id == id, cancellationToken);
    private async Task<CompanyQuotation?> FindForUpdateAsync(Guid id, CancellationToken cancellationToken) => await uow.Repository<CompanyQuotation>().GetSingleAsync(x => x.Id == id, x => x.Lines, x => x.Customer, x => x.SalesOpportunity!, x => x.Contact!);

    private static void EnsureDraft(CompanyQuotation quotation)
    {
        if (quotation.Status != CompanyQuotationStatus.Draft) throw new BusinessValidationException("QUOTATION_IMMUTABLE", "Only Draft quotations can be edited.");
    }

    private async Task AddAuditAsync(Guid? actorId, CompanyQuotation quotation, string action, object changes) => await uow.Repository<AuditLog>().AddAsync(new AuditLog { UserId = actorId, EntityType = nameof(CompanyQuotation), EntityId = quotation.Id.ToString(), Action = action, Changes = JsonSerializer.Serialize(changes), Timestamp = DateTime.UtcNow });

    private static CompanyQuotationDetailDto ToDetail(CompanyQuotation x)
    {
        return new CompanyQuotationDetailDto
        {
            Id = x.Id, QuotationNumber = x.QuotationNumber, CustomerId = x.CustomerId, CustomerCode = x.CustomerCodeSnapshot, CustomerName = x.CustomerNameSnapshot, ContractId = x.Contract?.Id,
            SalesOpportunityId = x.SalesOpportunityId, SalesOpportunityCode = x.SalesOpportunity?.OpportunityCode, SalesOpportunityTitle = x.SalesOpportunity?.Title, Status = x.Status,
            IssueDate = x.IssueDate, ValidUntil = x.ValidUntil, IsExpired = IsExpired(x), Currency = x.Currency, Subtotal = x.Subtotal, DiscountTotal = x.DiscountTotal, TaxTotal = x.TaxTotal, GrandTotal = x.GrandTotal, UpdatedAt = x.UpdatedAt,
            ContactId = x.ContactId, ContactName = x.ContactNameSnapshot, ContactEmail = x.ContactEmailSnapshot, ContactPhone = x.ContactPhoneSnapshot, CustomerNameSnapshot = x.CustomerNameSnapshot, CustomerCodeSnapshot = x.CustomerCodeSnapshot,
            PaymentTerms = x.PaymentTerms, CommercialTerms = x.CommercialTerms, Notes = x.Notes, SentAt = x.SentAt, AcceptedAt = x.AcceptedAt, RejectedAt = x.RejectedAt, RejectionReason = x.RejectionReason, CreatedAt = x.CreatedAt,
            Lines = x.Lines.OrderBy(line => line.SortOrder).ThenBy(line => line.LineNumber).Select(line => new CompanyQuotationLineDto { Id = line.Id, LineNumber = line.LineNumber, CatalogItemId = line.CatalogItemId, ItemCode = line.ItemCodeSnapshot, ItemName = line.ItemNameSnapshot, Description = line.Description, Quantity = line.Quantity, Unit = line.Unit, UnitPrice = line.UnitPrice, DiscountType = line.DiscountType, DiscountValue = line.DiscountValue, DiscountAmount = line.DiscountAmount, TaxRate = line.TaxRate, TaxAmount = line.TaxAmount, LineSubtotal = line.LineSubtotal, LineTotal = line.LineTotal }).ToList(),
        };
    }

    private static bool IsExpired(CompanyQuotation x) => x.Status != CompanyQuotationStatus.Accepted && x.Status != CompanyQuotationStatus.Rejected && x.ValidUntil.HasValue && x.ValidUntil.Value < DateOnly.FromDateTime(DateTime.UtcNow);
    private static decimal Money(decimal value) => decimal.Round(value, 2, MidpointRounding.AwayFromZero);
    private static string? Normalize(string? value) => string.IsNullOrWhiteSpace(value) ? null : value.Trim();
    private static string? NormalizeLong(string? value, string errorCode) { var normalized = Normalize(value); if (normalized?.Length > 4000) throw new BusinessValidationException(errorCode, "Quotation terms and notes must be at most 4,000 characters."); return normalized; }
    private static string? NormalizeCurrency(string? value) { var normalized = Normalize(value)?.ToUpperInvariant(); if (normalized is null) return null; if (normalized.Length != 3 || !normalized.All(x => x is >= 'A' and <= 'Z')) throw new BusinessValidationException("QUOTATION_CURRENCY_INVALID", "Currency must be an ISO-style three-letter code."); return normalized; }

    private sealed record PreparedQuotation(CompanyCustomer Customer, CompanySalesOpportunity? Opportunity, CompanyCustomerContact? Contact, DateOnly IssueDate, DateOnly? ValidUntil, string Currency, string? PaymentTerms, string? CommercialTerms, string? Notes, IReadOnlyList<PreparedLine> Lines, QuotationTotals Totals);
    private sealed record PreparedLine(int LineNumber, int SortOrder, Guid? CatalogItemId, string? ItemCode, string ItemName, string Description, decimal Quantity, string Unit, decimal UnitPrice, CompanyQuotationDiscountType DiscountType, decimal DiscountValue, decimal DiscountAmount, decimal TaxRate, decimal TaxAmount, decimal Subtotal, decimal LineTotal);
    private sealed record QuotationTotals(decimal Subtotal, decimal DiscountTotal, decimal TaxTotal, decimal GrandTotal);
}
