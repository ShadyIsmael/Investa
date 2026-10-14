using System.Text.Json;
using Investa.Application.Common;
using Investa.Application.DTOs;
using Investa.Application.Interfaces;
using Investa.Domain.Entities.Company;
using Investa.Domain.Entities.Security;
using Microsoft.EntityFrameworkCore;

namespace Investa.Application.Services;

public sealed class CompanyCustomerService(IUnitOfWork uow) : ICompanyCustomerService
{
    private static readonly string[] SortColumns = ["customercode", "name", "createdat", "updatedat", "status"];

    public async Task<CompanyCustomerPageDto> ListAsync(CompanyCustomerListQuery request, CancellationToken cancellationToken = default)
    {
        var page = Math.Max(1, request.Page);
        var pageSize = Math.Clamp(request.PageSize, 1, 100);
        var query = uow.Repository<CompanyCustomer>().Query();

        if (request.Type.HasValue) query = query.Where(x => x.Type == request.Type.Value);
        if (request.Status.HasValue) query = query.Where(x => x.Status == request.Status.Value);
        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var term = request.Search.Trim().ToLower();
            query = query.Where(x => x.CustomerCode.ToLower().Contains(term)
                || x.LegalName.ToLower().Contains(term)
                || x.DisplayName.ToLower().Contains(term)
                || (x.TaxId != null && x.TaxId.ToLower().Contains(term))
                || (x.PrimaryEmail != null && x.PrimaryEmail.ToLower().Contains(term))
                || (x.PrimaryPhone != null && x.PrimaryPhone.Contains(term))
                || x.Contacts.Any(contact => contact.IsActive && contact.Name.ToLower().Contains(term)));
        }

        var total = await query.CountAsync(cancellationToken);
        var descending = string.Equals(request.SortDirection, "desc", StringComparison.OrdinalIgnoreCase);
        var sortBy = (request.SortBy ?? "createdAt").Trim().ToLowerInvariant();
        query = sortBy switch
        {
            "customercode" => descending ? query.OrderByDescending(x => x.CustomerCode) : query.OrderBy(x => x.CustomerCode),
            "name" => descending ? query.OrderByDescending(x => x.DisplayName).ThenBy(x => x.Id) : query.OrderBy(x => x.DisplayName).ThenBy(x => x.Id),
            "updatedat" => descending ? query.OrderByDescending(x => x.UpdatedAt).ThenBy(x => x.Id) : query.OrderBy(x => x.UpdatedAt).ThenBy(x => x.Id),
            "status" => descending ? query.OrderByDescending(x => x.Status).ThenBy(x => x.DisplayName) : query.OrderBy(x => x.Status).ThenBy(x => x.DisplayName),
            _ => descending ? query.OrderByDescending(x => x.CreatedAt).ThenBy(x => x.Id) : query.OrderBy(x => x.CreatedAt).ThenBy(x => x.Id),
        };

        var items = await query.Skip((page - 1) * pageSize).Take(pageSize)
            .Select(x => new CompanyCustomerListItemDto
            {
                Id = x.Id,
                CustomerCode = x.CustomerCode,
                Type = x.Type,
                DisplayName = x.DisplayName,
                LegalName = x.LegalName,
                PrimaryContactName = x.Contacts.Where(contact => contact.IsActive && contact.IsPrimary).Select(contact => contact.Name).FirstOrDefault(),
                PrimaryEmail = x.PrimaryEmail,
                PrimaryPhone = x.PrimaryPhone,
                City = x.City,
                Country = x.Country,
                Status = x.Status,
                CreatedAt = x.CreatedAt,
                UpdatedAt = x.UpdatedAt,
            }).ToListAsync(cancellationToken);

        return new CompanyCustomerPageDto { Page = page, PageSize = pageSize, Total = total, Items = items };
    }

    public async Task<CompanyCustomerDetailDto?> GetAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var customer = await FindTrackedAsync(id, cancellationToken);
        return customer is null ? null : ToDetail(customer);
    }

    public async Task<CompanyCustomerDetailDto> CreateAsync(CompanyCustomerUpsertRequest request, CancellationToken cancellationToken = default, Guid? actorId = null)
    {
        ValidateProfile(request);
        var taxId = Normalize(request.TaxId);
        if (taxId is not null && await uow.Repository<CompanyCustomer>().Query().AnyAsync(x => x.TaxId == taxId, cancellationToken))
            throw new BusinessValidationException("CUSTOMER_TAX_ID_DUPLICATE", "The tax ID is already used by another customer.");

        var sequence = (await uow.Repository<CompanyCustomer>().Query().Select(x => (int?)x.CodeSequence).MaxAsync(cancellationToken) ?? 0) + 1;
        var now = DateTime.UtcNow;
        var customer = new CompanyCustomer
        {
            Id = Guid.NewGuid(),
            CodeSequence = sequence,
            CustomerCode = $"CUS-{sequence:000000}",
            Type = request.Type,
            LegalName = request.LegalName.Trim(),
            DisplayName = request.DisplayName.Trim(),
            TaxId = taxId,
            CommercialRegistrationNumber = Normalize(request.CommercialRegistrationNumber),
            PrimaryEmail = NormalizeEmail(request.PrimaryEmail),
            PrimaryPhone = Normalize(request.PrimaryPhone),
            Website = Normalize(request.Website),
            Address = Normalize(request.Address),
            Country = Normalize(request.Country),
            City = Normalize(request.City),
            Notes = Normalize(request.Notes),
            Status = CompanyCustomerStatus.Active,
            CreatedAt = now,
            UpdatedAt = now,
        };
        await uow.Repository<CompanyCustomer>().AddAsync(customer);
        await AddAuditAsync(actorId, nameof(CompanyCustomer), customer.Id, "Created", new { customer.CustomerCode, customer.Type, customer.DisplayName, customer.Status });
        await uow.SaveChangesAsync();
        return ToDetail(customer);
    }

    public async Task<CompanyCustomerDetailDto?> UpdateAsync(Guid id, CompanyCustomerUpsertRequest request, CancellationToken cancellationToken = default, Guid? actorId = null)
    {
        ValidateProfile(request);
        var customer = await FindTrackedAsync(id, cancellationToken);
        if (customer is null) return null;
        var taxId = Normalize(request.TaxId);
        if (taxId is not null && await uow.Repository<CompanyCustomer>().Query().AnyAsync(x => x.Id != id && x.TaxId == taxId, cancellationToken))
            throw new BusinessValidationException("CUSTOMER_TAX_ID_DUPLICATE", "The tax ID is already used by another customer.");

        customer.Type = request.Type;
        customer.LegalName = request.LegalName.Trim();
        customer.DisplayName = request.DisplayName.Trim();
        customer.TaxId = taxId;
        customer.CommercialRegistrationNumber = Normalize(request.CommercialRegistrationNumber);
        customer.PrimaryEmail = NormalizeEmail(request.PrimaryEmail);
        customer.PrimaryPhone = Normalize(request.PrimaryPhone);
        customer.Website = Normalize(request.Website);
        customer.Address = Normalize(request.Address);
        customer.Country = Normalize(request.Country);
        customer.City = Normalize(request.City);
        customer.Notes = Normalize(request.Notes);
        customer.UpdatedAt = DateTime.UtcNow;
        await AddAuditAsync(actorId, nameof(CompanyCustomer), customer.Id, "Updated", new { customer.CustomerCode, customer.Type, customer.DisplayName, customer.TaxId, customer.UpdatedAt });
        await uow.SaveChangesAsync();
        return ToDetail(customer);
    }

    public async Task<CompanyCustomerDetailDto?> SetStatusAsync(Guid id, CompanyCustomerStatus status, CancellationToken cancellationToken = default, Guid? actorId = null)
    {
        if (!Enum.IsDefined(status)) throw new BusinessValidationException("CUSTOMER_STATUS_INVALID", "The customer status is invalid.");
        var customer = await FindTrackedAsync(id, cancellationToken);
        if (customer is null) return null;
        customer.Status = status;
        customer.UpdatedAt = DateTime.UtcNow;
        await AddAuditAsync(actorId, nameof(CompanyCustomer), customer.Id, "StatusChanged", new { customer.CustomerCode, customer.Status, customer.UpdatedAt });
        await uow.SaveChangesAsync();
        return ToDetail(customer);
    }

    public async Task<CompanyCustomerContactDto?> AddContactAsync(Guid customerId, CompanyCustomerContactRequest request, CancellationToken cancellationToken = default, Guid? actorId = null)
    {
        ValidateContact(request);
        var customer = await FindTrackedAsync(customerId, cancellationToken);
        if (customer is null) return null;
        var contact = new CompanyCustomerContact
        {
            Id = Guid.NewGuid(), CustomerId = customerId, Name = request.Name.Trim(), JobTitle = Normalize(request.JobTitle),
            Email = NormalizeEmail(request.Email), Phone = Normalize(request.Phone), IsActive = request.IsActive,
            IsPrimary = request.IsActive && (request.IsPrimary || !customer.Contacts.Any(x => x.IsActive && x.IsPrimary)),
            CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow,
        };
        if (contact.IsPrimary) ClearPrimary(customer.Contacts);
        customer.Contacts.Add(contact);
        await uow.Repository<CompanyCustomerContact>().AddAsync(contact);
        customer.UpdatedAt = DateTime.UtcNow;
        await AddAuditAsync(actorId, nameof(CompanyCustomerContact), contact.Id, "ContactCreated", new { customerId, contact.Name, contact.Email, contact.IsPrimary, contact.IsActive });
        await uow.SaveChangesAsync();
        return ToContact(contact);
    }

    public async Task<CompanyCustomerContactDto?> UpdateContactAsync(Guid customerId, Guid contactId, CompanyCustomerContactRequest request, CancellationToken cancellationToken = default, Guid? actorId = null)
    {
        ValidateContact(request);
        var customer = await FindTrackedAsync(customerId, cancellationToken);
        var contact = customer?.Contacts.FirstOrDefault(x => x.Id == contactId);
        if (contact is null) return null;
        contact.Name = request.Name.Trim(); contact.JobTitle = Normalize(request.JobTitle); contact.Email = NormalizeEmail(request.Email); contact.Phone = Normalize(request.Phone);
        contact.IsActive = request.IsActive; contact.IsPrimary = request.IsActive && request.IsPrimary; contact.UpdatedAt = DateTime.UtcNow;
        if (contact.IsPrimary) ClearPrimary(customer!.Contacts, contact.Id);
        else EnsurePrimary(customer!.Contacts);
        customer.UpdatedAt = DateTime.UtcNow;
        await AddAuditAsync(actorId, nameof(CompanyCustomerContact), contact.Id, "ContactUpdated", new { customerId, contact.Name, contact.Email, contact.IsPrimary, contact.IsActive });
        await uow.SaveChangesAsync();
        return ToContact(contact);
    }

    public async Task<CompanyCustomerContactDto?> SetContactStatusAsync(Guid customerId, Guid contactId, bool isActive, CancellationToken cancellationToken = default, Guid? actorId = null)
    {
        var customer = await FindTrackedAsync(customerId, cancellationToken);
        var contact = customer?.Contacts.FirstOrDefault(x => x.Id == contactId);
        if (contact is null) return null;
        contact.IsActive = isActive; contact.IsPrimary = isActive && contact.IsPrimary; contact.UpdatedAt = DateTime.UtcNow;
        EnsurePrimary(customer!.Contacts);
        customer.UpdatedAt = DateTime.UtcNow;
        await AddAuditAsync(actorId, nameof(CompanyCustomerContact), contact.Id, "ContactStatusChanged", new { customerId, contact.Name, contact.IsPrimary, contact.IsActive });
        await uow.SaveChangesAsync();
        return ToContact(contact);
    }

    public async Task<CompanyCustomerContactDto?> SetPrimaryContactAsync(Guid customerId, Guid contactId, CancellationToken cancellationToken = default, Guid? actorId = null)
    {
        var customer = await FindTrackedAsync(customerId, cancellationToken);
        var contact = customer?.Contacts.FirstOrDefault(x => x.Id == contactId);
        if (contact is null) return null;
        if (!contact.IsActive) throw new BusinessValidationException("CUSTOMER_CONTACT_INACTIVE", "Only an active contact can be primary.");
        ClearPrimary(customer!.Contacts, contact.Id); contact.IsPrimary = true; contact.UpdatedAt = DateTime.UtcNow;
        customer.UpdatedAt = DateTime.UtcNow;
        await AddAuditAsync(actorId, nameof(CompanyCustomerContact), contact.Id, "PrimaryChanged", new { customerId, contact.Name, contact.IsPrimary });
        await uow.SaveChangesAsync();
        return ToContact(contact);
    }

    private async Task AddAuditAsync(Guid? actorId, string entityType, Guid entityId, string action, object changes)
    {
        await uow.Repository<AuditLog>().AddAsync(new AuditLog
        {
            UserId = actorId,
            EntityType = entityType,
            EntityId = entityId.ToString(),
            Action = action,
            Changes = JsonSerializer.Serialize(changes),
            Timestamp = DateTime.UtcNow,
        });
    }

    private async Task<CompanyCustomer?> FindTrackedAsync(Guid id, CancellationToken cancellationToken) =>
        await uow.Repository<CompanyCustomer>().GetSingleAsync(x => x.Id == id, x => x.Contacts);

    private static void ValidateProfile(CompanyCustomerUpsertRequest request)
    {
        if (!Enum.IsDefined(request.Type)) throw new BusinessValidationException("CUSTOMER_TYPE_INVALID", "The customer type is invalid.");
        if (string.IsNullOrWhiteSpace(request.LegalName) || string.IsNullOrWhiteSpace(request.DisplayName))
            throw new BusinessValidationException("CUSTOMER_NAME_REQUIRED", "Legal name and display name are required.");
        if (!string.IsNullOrWhiteSpace(request.Website) && !Uri.TryCreate(request.Website.Trim(), UriKind.Absolute, out _))
            throw new BusinessValidationException("CUSTOMER_WEBSITE_INVALID", "Website must be a valid absolute URL.");
    }

    private static void ValidateContact(CompanyCustomerContactRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Name)) throw new BusinessValidationException("CUSTOMER_CONTACT_NAME_REQUIRED", "Contact name is required.");
    }

    private static void ClearPrimary(IEnumerable<CompanyCustomerContact> contacts, Guid? keep = null)
    {
        foreach (var contact in contacts.Where(x => x.Id != keep)) contact.IsPrimary = false;
    }

    private static void EnsurePrimary(ICollection<CompanyCustomerContact> contacts)
    {
        var active = contacts.Where(x => x.IsActive).ToList();
        var primary = active.FirstOrDefault(x => x.IsPrimary);
        foreach (var contact in active.Where(x => x != primary)) contact.IsPrimary = false;
        if (primary is null && active.Count > 0) active[0].IsPrimary = true;
        foreach (var contact in contacts.Where(x => !x.IsActive)) contact.IsPrimary = false;
    }

    private static string? Normalize(string? value) => string.IsNullOrWhiteSpace(value) ? null : value.Trim();
    private static string? NormalizeEmail(string? value) => Normalize(value)?.ToLowerInvariant();

    private static CompanyCustomerDetailDto ToDetail(CompanyCustomer customer) => new()
    {
        Id = customer.Id, CustomerCode = customer.CustomerCode, Type = customer.Type, LegalName = customer.LegalName, DisplayName = customer.DisplayName,
        TaxId = customer.TaxId, CommercialRegistrationNumber = customer.CommercialRegistrationNumber, PrimaryEmail = customer.PrimaryEmail, PrimaryPhone = customer.PrimaryPhone,
        Website = customer.Website, Address = customer.Address, Country = customer.Country, City = customer.City, Status = customer.Status, Notes = customer.Notes,
        CreatedAt = customer.CreatedAt, UpdatedAt = customer.UpdatedAt, Contacts = customer.Contacts.OrderByDescending(x => x.IsPrimary).ThenBy(x => x.Name).Select(ToContact).ToList(),
    };

    private static CompanyCustomerContactDto ToContact(CompanyCustomerContact contact) => new()
    {
        Id = contact.Id, Name = contact.Name, JobTitle = contact.JobTitle, Email = contact.Email, Phone = contact.Phone,
        IsPrimary = contact.IsPrimary, IsActive = contact.IsActive, CreatedAt = contact.CreatedAt, UpdatedAt = contact.UpdatedAt,
    };
}
