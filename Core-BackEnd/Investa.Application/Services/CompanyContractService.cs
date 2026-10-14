using System.Text.Json;
using Investa.Application.Common;
using Investa.Application.DTOs;
using Investa.Application.Interfaces;
using Investa.Domain.Entities;
using Investa.Domain.Entities.Company;
using Investa.Domain.Entities.Security;
using Microsoft.EntityFrameworkCore;

namespace Investa.Application.Services;

public sealed class CompanyContractService(IUnitOfWork uow) : ICompanyContractService
{
    public async Task<CompanyContractPageDto> ListAsync(CompanyContractListQuery request, CancellationToken cancellationToken = default)
    {
        var page = Math.Max(1, request.Page);
        var pageSize = Math.Clamp(request.PageSize, 1, 100);
        var query = uow.Repository<CompanyContract>().Query();

        if (request.Status.HasValue) query = query.Where(x => x.Status == request.Status.Value);
        if (request.CustomerId.HasValue) query = query.Where(x => x.CustomerId == request.CustomerId.Value);
        if (request.SalesOpportunityId.HasValue) query = query.Where(x => x.SalesOpportunityId == request.SalesOpportunityId.Value);
        if (!string.IsNullOrWhiteSpace(request.Currency)) query = query.Where(x => x.Currency == request.Currency.Trim().ToUpper());
        if (request.EffectiveDateFrom.HasValue) query = query.Where(x => x.EffectiveDate >= request.EffectiveDateFrom.Value);
        if (request.EffectiveDateTo.HasValue) query = query.Where(x => x.EffectiveDate <= request.EffectiveDateTo.Value);
        if (request.StartDateFrom.HasValue) query = query.Where(x => x.StartDate >= request.StartDateFrom.Value);
        if (request.StartDateTo.HasValue) query = query.Where(x => x.StartDate <= request.StartDateTo.Value);
        if (request.EndDateFrom.HasValue) query = query.Where(x => x.EndDate >= request.EndDateFrom.Value);
        if (request.EndDateTo.HasValue) query = query.Where(x => x.EndDate <= request.EndDateTo.Value);
        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var term = request.Search.Trim().ToLowerInvariant();
            query = query.Where(x => x.ContractNumber.ToLower().Contains(term)
                || x.CustomerCodeSnapshot.ToLower().Contains(term)
                || x.CustomerNameSnapshot.ToLower().Contains(term)
                || x.SourceQuotation.QuotationNumber.ToLower().Contains(term)
                || (x.SalesOpportunity != null && (x.SalesOpportunity.OpportunityCode.ToLower().Contains(term) || x.SalesOpportunity.Title.ToLower().Contains(term))));
        }

        var total = await query.CountAsync(cancellationToken);
        var descending = !string.Equals(request.SortDirection, "asc", StringComparison.OrdinalIgnoreCase);
        var sortBy = (request.SortBy ?? "createdAt").Trim().ToLowerInvariant();
        query = sortBy switch
        {
            "contractnumber" => descending ? query.OrderByDescending(x => x.ContractNumber).ThenBy(x => x.Id) : query.OrderBy(x => x.ContractNumber).ThenBy(x => x.Id),
            "customer" => descending ? query.OrderByDescending(x => x.CustomerNameSnapshot).ThenBy(x => x.Id) : query.OrderBy(x => x.CustomerNameSnapshot).ThenBy(x => x.Id),
            "status" => descending ? query.OrderByDescending(x => x.Status).ThenBy(x => x.Id) : query.OrderBy(x => x.Status).ThenBy(x => x.Id),
            "effectivedate" => descending ? query.OrderByDescending(x => x.EffectiveDate).ThenBy(x => x.Id) : query.OrderBy(x => x.EffectiveDate).ThenBy(x => x.Id),
            "startdate" => descending ? query.OrderByDescending(x => x.StartDate).ThenBy(x => x.Id) : query.OrderBy(x => x.StartDate).ThenBy(x => x.Id),
            "enddate" => descending ? query.OrderByDescending(x => x.EndDate).ThenBy(x => x.Id) : query.OrderBy(x => x.EndDate).ThenBy(x => x.Id),
            "grandtotal" => descending ? query.OrderByDescending(x => x.GrandTotal).ThenBy(x => x.Id) : query.OrderBy(x => x.GrandTotal).ThenBy(x => x.Id),
            "updatedat" => descending ? query.OrderByDescending(x => x.UpdatedAt).ThenBy(x => x.Id) : query.OrderBy(x => x.UpdatedAt).ThenBy(x => x.Id),
            _ => descending ? query.OrderByDescending(x => x.CreatedAt).ThenBy(x => x.Id) : query.OrderBy(x => x.CreatedAt).ThenBy(x => x.Id),
        };

        var items = await query.Skip((page - 1) * pageSize).Take(pageSize).Select(x => new CompanyContractListItemDto
        {
            Id = x.Id,
            ContractNumber = x.ContractNumber,
            CustomerId = x.CustomerId,
            CustomerCode = x.CustomerCodeSnapshot,
            CustomerName = x.CustomerNameSnapshot,
            SourceQuotationId = x.SourceQuotationId,
            SourceQuotationNumber = x.SourceQuotation.QuotationNumber,
            SalesOpportunityId = x.SalesOpportunityId,
            SalesOpportunityCode = x.SalesOpportunity == null ? null : x.SalesOpportunity.OpportunityCode,
            SalesOpportunityTitle = x.SalesOpportunity == null ? null : x.SalesOpportunity.Title,
            Status = x.Status,
            Currency = x.Currency,
            EffectiveDate = x.EffectiveDate,
            StartDate = x.StartDate,
            EndDate = x.EndDate,
            GrandTotal = x.GrandTotal,
            UpdatedAt = x.UpdatedAt,
        }).ToListAsync(cancellationToken);

        return new CompanyContractPageDto { Page = page, PageSize = pageSize, Total = total, Items = items };
    }

    public async Task<CompanyContractDetailDto?> GetAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var contract = await FindAsync(id, cancellationToken);
        return contract is null ? null : ToDetail(contract);
    }

    public async Task<CompanyContractDetailDto?> GetBySourceQuotationAsync(Guid quotationId, CancellationToken cancellationToken = default)
    {
        var contract = await uow.Repository<CompanyContract>().Query()
            .Include(x => x.SourceQuotation)
            .Include(x => x.SalesOpportunity)
            .Include(x => x.Lines)
            .SingleOrDefaultAsync(x => x.SourceQuotationId == quotationId, cancellationToken);
        return contract is null ? null : ToDetail(contract);
    }

    public async Task<CompanyContractDetailDto> CreateFromQuotationAsync(CompanyContractFromQuotationRequest request, CancellationToken cancellationToken = default, Guid? actorId = null)
    {
        if (request.SourceQuotationId == Guid.Empty) throw new BusinessValidationException("CONTRACT_SOURCE_QUOTATION_REQUIRED", "An accepted Company Quotation is required.");

        var existing = await GetBySourceQuotationAsync(request.SourceQuotationId, cancellationToken);
        if (existing is not null) return existing;

        var quotation = await uow.Repository<CompanyQuotation>().Query()
            .Include(x => x.Customer)
            .Include(x => x.SalesOpportunity)
            .Include(x => x.Contact)
            .Include(x => x.Lines)
            .ThenInclude(x => x.CatalogItem)
            .SingleOrDefaultAsync(x => x.Id == request.SourceQuotationId, cancellationToken)
            ?? throw new BusinessValidationException("CONTRACT_SOURCE_QUOTATION_NOT_FOUND", "The source Company Quotation was not found.");

        ValidateSourceQuotation(quotation);
        ValidateDates(request.EffectiveDate, request.StartDate, request.EndDate);
        if (!await uow.Repository<Currency>().Query().AnyAsync(x => x.ISOCode == quotation.Currency && x.IsActive, cancellationToken))
            throw new BusinessValidationException("CONTRACT_CURRENCY_INVALID", "The source quotation currency must remain an active currency master code.");

        var now = DateTime.UtcNow;
        var sequence = (await uow.Repository<CompanyContract>().Query().Select(x => (int?)x.NumberSequence).MaxAsync(cancellationToken) ?? 0) + 1;
        var contract = new CompanyContract
        {
            Id = Guid.NewGuid(),
            NumberSequence = sequence,
            ContractNumber = $"CTR-{sequence:000000}",
            CustomerId = quotation.CustomerId,
            SourceQuotationId = quotation.Id,
            SalesOpportunityId = quotation.SalesOpportunityId,
            ContactId = quotation.ContactId,
            CustomerCodeSnapshot = quotation.CustomerCodeSnapshot,
            CustomerNameSnapshot = quotation.CustomerNameSnapshot,
            CustomerLegalNameSnapshot = quotation.Customer.LegalName,
            ContactNameSnapshot = quotation.ContactNameSnapshot,
            ContactEmailSnapshot = quotation.ContactEmailSnapshot,
            ContactPhoneSnapshot = quotation.ContactPhoneSnapshot,
            Status = CompanyContractStatus.Draft,
            Currency = quotation.Currency,
            EffectiveDate = request.EffectiveDate,
            StartDate = request.StartDate,
            EndDate = request.EndDate,
            SignedDate = request.SignedDate,
            Subtotal = quotation.Subtotal,
            DiscountTotal = quotation.DiscountTotal,
            TaxTotal = quotation.TaxTotal,
            GrandTotal = quotation.GrandTotal,
            PaymentTerms = request.PaymentTerms is null ? quotation.PaymentTerms : NormalizeLong(request.PaymentTerms, "CONTRACT_PAYMENT_TERMS_INVALID"),
            CommercialTerms = request.CommercialTerms is null ? quotation.CommercialTerms : NormalizeLong(request.CommercialTerms, "CONTRACT_COMMERCIAL_TERMS_INVALID"),
            Notes = request.Notes is null ? quotation.Notes : NormalizeLong(request.Notes, "CONTRACT_NOTES_INVALID"),
            CreatedAt = now,
            UpdatedAt = now,
        };

        foreach (var sourceLine in quotation.Lines.OrderBy(x => x.SortOrder).ThenBy(x => x.LineNumber))
        {
            if (sourceLine.CatalogItemId.HasValue && sourceLine.CatalogItem is null)
                throw new BusinessValidationException("CONTRACT_CATALOG_REFERENCE_INVALID", "A quotation catalog reference is no longer available.");

            contract.Lines.Add(new CompanyContractLine
            {
                Id = Guid.NewGuid(),
                ContractId = contract.Id,
                SourceQuotationLineId = sourceLine.Id,
                LineNumber = sourceLine.LineNumber,
                SortOrder = sourceLine.SortOrder,
                CatalogItemId = sourceLine.CatalogItemId,
                ItemCodeSnapshot = sourceLine.ItemCodeSnapshot,
                ItemNameSnapshot = sourceLine.ItemNameSnapshot,
                Description = sourceLine.Description,
                Unit = sourceLine.Unit,
                Quantity = sourceLine.Quantity,
                UnitPrice = sourceLine.UnitPrice,
                DiscountType = (CompanyContractDiscountType)sourceLine.DiscountType,
                DiscountValue = sourceLine.DiscountValue,
                DiscountAmount = sourceLine.DiscountAmount,
                TaxRate = sourceLine.TaxRate,
                TaxAmount = sourceLine.TaxAmount,
                LineSubtotal = sourceLine.LineSubtotal,
                LineTotal = sourceLine.LineTotal,
                SupportsLicenseSnapshot = sourceLine.CatalogItem?.SupportsLicense ?? false,
                SupportsSubscriptionSnapshot = sourceLine.CatalogItem?.SupportsSubscription ?? false,
            });
        }

        try
        {
            await uow.BeginTransactionAsync();
            await uow.Repository<CompanyContract>().AddAsync(contract);
            await AddAuditAsync(actorId, contract, "CreatedFromQuotation", new { contract.ContractNumber, contract.SourceQuotationId, contract.CustomerId, contract.Currency, contract.GrandTotal, lineCount = contract.Lines.Count });
            await uow.SaveChangesAsync();
            await uow.CommitTransactionAsync();
        }
        catch (DbUpdateException)
        {
            await uow.RollbackTransactionAsync();
            var concurrent = await GetBySourceQuotationAsync(request.SourceQuotationId, cancellationToken);
            if (concurrent is not null) return concurrent;
            throw new BusinessValidationException("CONTRACT_CREATION_CONFLICT", "Contract creation conflicted with another commercial document. Retry the operation.");
        }

        return (await GetAsync(contract.Id, cancellationToken))!;
    }

    public async Task<CompanyContractDetailDto?> UpdateDraftAsync(Guid id, CompanyContractMetadataUpdateRequest request, CancellationToken cancellationToken = default, Guid? actorId = null)
    {
        var contract = await FindForUpdateAsync(id, cancellationToken);
        if (contract is null) return null;
        EnsureDraft(contract);
        ValidateDates(request.EffectiveDate, request.StartDate, request.EndDate);
        contract.EffectiveDate = request.EffectiveDate;
        contract.StartDate = request.StartDate;
        contract.EndDate = request.EndDate;
        contract.SignedDate = request.SignedDate;
        contract.PaymentTerms = NormalizeLong(request.PaymentTerms, "CONTRACT_PAYMENT_TERMS_INVALID");
        contract.CommercialTerms = NormalizeLong(request.CommercialTerms, "CONTRACT_COMMERCIAL_TERMS_INVALID");
        contract.Notes = NormalizeLong(request.Notes, "CONTRACT_NOTES_INVALID");
        contract.UpdatedAt = DateTime.UtcNow;
        await AddAuditAsync(actorId, contract, "Updated", new { contract.ContractNumber, contract.EffectiveDate, contract.StartDate, contract.EndDate, contract.SignedDate });
        await uow.Repository<CompanyContract>().UpdateAsync(contract);
        await uow.SaveChangesAsync();
        return await GetAsync(id, cancellationToken);
    }

    public Task<CompanyContractDetailDto?> ActivateAsync(Guid id, CancellationToken cancellationToken = default, Guid? actorId = null) => TransitionAsync(id, CompanyContractStatus.Active, null, cancellationToken, actorId);
    public Task<CompanyContractDetailDto?> CompleteAsync(Guid id, CancellationToken cancellationToken = default, Guid? actorId = null) => TransitionAsync(id, CompanyContractStatus.Completed, null, cancellationToken, actorId);
    public Task<CompanyContractDetailDto?> TerminateAsync(Guid id, string terminationReason, CancellationToken cancellationToken = default, Guid? actorId = null) => TransitionAsync(id, CompanyContractStatus.Terminated, terminationReason, cancellationToken, actorId);

    private async Task<CompanyContractDetailDto?> TransitionAsync(Guid id, CompanyContractStatus target, string? terminationReason, CancellationToken cancellationToken, Guid? actorId)
    {
        var contract = await FindForUpdateAsync(id, cancellationToken);
        if (contract is null) return null;
        var reason = Normalize(terminationReason);
        if (target == CompanyContractStatus.Terminated && (reason is null || reason.Length > 1000))
            throw new BusinessValidationException("CONTRACT_TERMINATION_REASON_REQUIRED", "A termination reason is required and must be at most 1,000 characters.");

        switch (target)
        {
            case CompanyContractStatus.Active:
                EnsureDraft(contract);
                ValidateDates(contract.EffectiveDate, contract.StartDate, contract.EndDate);
                if (contract.Lines.Count == 0) throw new BusinessValidationException("CONTRACT_LINES_REQUIRED", "An active contract must contain at least one line.");
                if (contract.SourceQuotation.Status != CompanyQuotationStatus.Accepted) throw new BusinessValidationException("CONTRACT_SOURCE_QUOTATION_INVALID", "The source quotation must still be Accepted.");
                ValidateContractTotals(contract);
                contract.ActivatedAt = DateTime.UtcNow;
                break;
            case CompanyContractStatus.Completed:
                if (contract.Status != CompanyContractStatus.Active) throw new BusinessValidationException("CONTRACT_TRANSITION_INVALID", "Only Active contracts can be completed.");
                contract.CompletedAt = DateTime.UtcNow;
                break;
            case CompanyContractStatus.Terminated:
                if (contract.Status != CompanyContractStatus.Active) throw new BusinessValidationException("CONTRACT_TRANSITION_INVALID", "Only Active contracts can be terminated.");
                contract.TerminatedAt = DateTime.UtcNow;
                contract.TerminationReason = reason;
                break;
            default:
                throw new BusinessValidationException("CONTRACT_TRANSITION_INVALID", "The requested Contract transition is not supported.");
        }

        contract.Status = target;
        contract.UpdatedAt = DateTime.UtcNow;
        await AddAuditAsync(actorId, contract, target.ToString(), new { contract.ContractNumber, contract.SourceQuotationId, contract.Status, contract.TerminationReason });
        await uow.Repository<CompanyContract>().UpdateAsync(contract);
        await uow.SaveChangesAsync();
        return await GetAsync(id, cancellationToken);
    }

    private async Task<CompanyContract?> FindAsync(Guid id, CancellationToken cancellationToken)
    {
        return await uow.Repository<CompanyContract>().Query()
            .Include(x => x.Customer)
            .Include(x => x.SourceQuotation)
            .Include(x => x.SalesOpportunity)
            .Include(x => x.Contact)
            .Include(x => x.Lines)
            .ThenInclude(x => x.SourceQuotationLine)
            .Include(x => x.Lines)
            .ThenInclude(x => x.CatalogItem)
            .SingleOrDefaultAsync(x => x.Id == id, cancellationToken);
    }

    private async Task<CompanyContract?> FindForUpdateAsync(Guid id, CancellationToken cancellationToken)
    {
        return await uow.Repository<CompanyContract>().GetSingleAsync(x => x.Id == id, x => x.Lines, x => x.SourceQuotation);
    }

    private static void ValidateSourceQuotation(CompanyQuotation quotation)
    {
        if (quotation.Status != CompanyQuotationStatus.Accepted)
            throw new BusinessValidationException("CONTRACT_SOURCE_QUOTATION_INVALID", "Only an Accepted Company Quotation can create a Contract.");
        if (quotation.Lines.Count == 0)
            throw new BusinessValidationException("CONTRACT_LINES_REQUIRED", "The accepted quotation must contain at least one line.");

        var subtotal = 0m;
        var discount = 0m;
        var tax = 0m;
        var total = 0m;
        try
        {
            foreach (var line in quotation.Lines)
            {
                if (line.Quantity <= 0 || line.UnitPrice < 0 || line.TaxRate is < 0 or > 100 || line.DiscountValue < 0)
                    throw new BusinessValidationException("CONTRACT_SOURCE_QUOTATION_INVALID", "The accepted quotation contains invalid commercial line values.");
                var lineSubtotal = Money(line.Quantity * line.UnitPrice);
                var lineDiscount = line.DiscountType switch
                {
                    CompanyQuotationDiscountType.None => 0m,
                    CompanyQuotationDiscountType.Percentage when line.DiscountValue <= 100 => Money(lineSubtotal * line.DiscountValue / 100m),
                    CompanyQuotationDiscountType.FixedAmount => Money(line.DiscountValue),
                    _ => throw new BusinessValidationException("CONTRACT_SOURCE_QUOTATION_INVALID", "The accepted quotation contains an invalid discount."),
                };
                if (lineDiscount > lineSubtotal) throw new BusinessValidationException("CONTRACT_SOURCE_QUOTATION_INVALID", "The accepted quotation contains a discount below zero.");
                var lineTax = Money(Money(lineSubtotal - lineDiscount) * line.TaxRate / 100m);
                var lineTotal = Money(Money(lineSubtotal - lineDiscount) + lineTax);
                if (line.LineSubtotal != lineSubtotal || line.DiscountAmount != lineDiscount || line.TaxAmount != lineTax || line.LineTotal != lineTotal)
                    throw new BusinessValidationException("CONTRACT_SOURCE_QUOTATION_INVALID", "The accepted quotation totals are inconsistent.");
                subtotal += lineSubtotal;
                discount += lineDiscount;
                tax += lineTax;
                total += lineTotal;
            }
        }
        catch (OverflowException)
        {
            throw new BusinessValidationException("CONTRACT_AMOUNT_INVALID", "Contract amounts exceed the supported decimal precision.");
        }

        if (Money(subtotal) != quotation.Subtotal || Money(discount) != quotation.DiscountTotal || Money(tax) != quotation.TaxTotal || Money(total) != quotation.GrandTotal)
            throw new BusinessValidationException("CONTRACT_SOURCE_QUOTATION_INVALID", "The accepted quotation totals are inconsistent.");
    }

    private static void ValidateContractTotals(CompanyContract contract)
    {
        try
        {
            var subtotal = Money(contract.Lines.Sum(x => x.LineSubtotal));
            var discount = Money(contract.Lines.Sum(x => x.DiscountAmount));
            var tax = Money(contract.Lines.Sum(x => x.TaxAmount));
            var total = Money(contract.Lines.Sum(x => x.LineTotal));
            if (subtotal != contract.Subtotal || discount != contract.DiscountTotal || tax != contract.TaxTotal || total != contract.GrandTotal)
                throw new BusinessValidationException("CONTRACT_TOTALS_INVALID", "Contract commercial totals are inconsistent.");
        }
        catch (OverflowException)
        {
            throw new BusinessValidationException("CONTRACT_AMOUNT_INVALID", "Contract amounts exceed the supported decimal precision.");
        }
    }

    private static void ValidateDates(DateOnly? effectiveDate, DateOnly? startDate, DateOnly? endDate)
    {
        if (endDate.HasValue && startDate.HasValue && endDate.Value < startDate.Value)
            throw new BusinessValidationException("CONTRACT_DATES_INVALID", "End date must be on or after start date.");
        if (endDate.HasValue && effectiveDate.HasValue && endDate.Value < effectiveDate.Value)
            throw new BusinessValidationException("CONTRACT_DATES_INVALID", "End date must be on or after effective date.");
    }

    private static void EnsureDraft(CompanyContract contract)
    {
        if (contract.Status != CompanyContractStatus.Draft)
            throw new BusinessValidationException("CONTRACT_IMMUTABLE", "Only Draft contracts can be edited or activated.");
    }

    private async Task AddAuditAsync(Guid? actorId, CompanyContract contract, string action, object changes)
    {
        await uow.Repository<AuditLog>().AddAsync(new AuditLog
        {
            UserId = actorId,
            EntityType = nameof(CompanyContract),
            EntityId = contract.Id.ToString(),
            Action = action,
            Changes = JsonSerializer.Serialize(changes),
            Timestamp = DateTime.UtcNow,
        });
    }

    private static CompanyContractDetailDto ToDetail(CompanyContract x) => new()
    {
        Id = x.Id,
        ContractNumber = x.ContractNumber,
        CustomerId = x.CustomerId,
        CustomerCode = x.CustomerCodeSnapshot,
        CustomerName = x.CustomerNameSnapshot,
        SourceQuotationId = x.SourceQuotationId,
        SourceQuotationNumber = x.SourceQuotation?.QuotationNumber ?? string.Empty,
        SalesOpportunityId = x.SalesOpportunityId,
        SalesOpportunityCode = x.SalesOpportunity?.OpportunityCode,
        SalesOpportunityTitle = x.SalesOpportunity?.Title,
        Status = x.Status,
        Currency = x.Currency,
        EffectiveDate = x.EffectiveDate,
        StartDate = x.StartDate,
        EndDate = x.EndDate,
        GrandTotal = x.GrandTotal,
        UpdatedAt = x.UpdatedAt,
        ContactId = x.ContactId,
        ContactName = x.ContactNameSnapshot,
        ContactEmail = x.ContactEmailSnapshot,
        ContactPhone = x.ContactPhoneSnapshot,
        CustomerCodeSnapshot = x.CustomerCodeSnapshot,
        CustomerNameSnapshot = x.CustomerNameSnapshot,
        CustomerLegalNameSnapshot = x.CustomerLegalNameSnapshot,
        SignedDate = x.SignedDate,
        Subtotal = x.Subtotal,
        DiscountTotal = x.DiscountTotal,
        TaxTotal = x.TaxTotal,
        PaymentTerms = x.PaymentTerms,
        CommercialTerms = x.CommercialTerms,
        Notes = x.Notes,
        ActivatedAt = x.ActivatedAt,
        CompletedAt = x.CompletedAt,
        TerminatedAt = x.TerminatedAt,
        TerminationReason = x.TerminationReason,
        CreatedAt = x.CreatedAt,
        Lines = x.Lines.OrderBy(line => line.SortOrder).ThenBy(line => line.LineNumber).Select(line => new CompanyContractLineDto
        {
            Id = line.Id,
            SourceQuotationLineId = line.SourceQuotationLineId,
            LineNumber = line.LineNumber,
            CatalogItemId = line.CatalogItemId,
            ItemCode = line.ItemCodeSnapshot,
            ItemName = line.ItemNameSnapshot,
            Description = line.Description,
            Quantity = line.Quantity,
            Unit = line.Unit,
            UnitPrice = line.UnitPrice,
            DiscountType = line.DiscountType,
            DiscountValue = line.DiscountValue,
            DiscountAmount = line.DiscountAmount,
            TaxRate = line.TaxRate,
            TaxAmount = line.TaxAmount,
            LineSubtotal = line.LineSubtotal,
            LineTotal = line.LineTotal,
            SupportsLicense = line.SupportsLicenseSnapshot,
            SupportsSubscription = line.SupportsSubscriptionSnapshot,
        }).ToList(),
    };

    private static decimal Money(decimal value) => decimal.Round(value, 2, MidpointRounding.AwayFromZero);
    private static string? Normalize(string? value) => string.IsNullOrWhiteSpace(value) ? null : value.Trim();
    private static string? NormalizeLong(string? value, string errorCode)
    {
        var normalized = Normalize(value);
        if (normalized?.Length > 4000) throw new BusinessValidationException(errorCode, "Contract terms and notes must be at most 4,000 characters.");
        return normalized;
    }
}
