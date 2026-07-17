using Investa.Application.DTOs.Finance;
using Investa.Application.Interfaces;
using Investa.Domain.Entities;
using Investa.Domain.Entities.Enums;

namespace Investa.Application.Services.Finance;

public interface IFinanceMasterDataService
{
    Task<List<FinanceAccountDto>> GetAccountsAsync();
    Task<FinanceAccountDto> GetAccountAsync(int id);
    Task<FinanceAccountDto> SaveAccountAsync(int? id, CreateUpdateFinanceAccountDto dto, Guid userId);
    Task<List<SupplierDto>> GetSuppliersAsync();
    Task<SupplierDto> GetSupplierAsync(int id);
    Task<SupplierDto> SaveSupplierAsync(int? id, CreateUpdateSupplierDto dto, Guid userId);
    Task<List<IncomeCategoryDto>> GetIncomeCategoriesAsync();
    Task<IncomeCategoryDto> SaveIncomeCategoryAsync(int? id, CreateUpdateIncomeCategoryDto dto, Guid userId);
    Task<List<ExpenseCategoryDto>> GetExpenseCategoriesAsync();
    Task<ExpenseCategoryDto> SaveExpenseCategoryAsync(int? id, CreateUpdateExpenseCategoryDto dto, Guid userId);
}

public sealed class FinanceMasterDataService : IFinanceMasterDataService
{
    private const string SupplierCodeTemporaryPrefix = "SUP-TMP-";
    private const string IncomeCategoryCodeTemporaryPrefix = "INC-TMP-";
    private const string ExpenseCategoryCodeTemporaryPrefix = "EXP-TMP-";
    private readonly IUnitOfWork _uow;

    public FinanceMasterDataService(IUnitOfWork uow) => _uow = uow;

    public async Task<List<FinanceAccountDto>> GetAccountsAsync()
        => (await _uow.Repository<FinanceAccount>().GetAllAsync()).OrderBy(x => x.Code).Select(Map).ToList();

    public async Task<FinanceAccountDto> GetAccountAsync(int id)
        => Map(await _uow.Repository<FinanceAccount>().GetByIdAsync(id) ?? throw new KeyNotFoundException());

    public async Task<FinanceAccountDto> SaveAccountAsync(int? id, CreateUpdateFinanceAccountDto d, Guid u)
    {
        var r = _uow.Repository<FinanceAccount>();
        var e = id.HasValue ? await r.GetByIdAsync(id.Value) ?? throw new KeyNotFoundException() : new FinanceAccount { CreatedBy = u };
        e.Code = d.Code;
        e.Name = d.Name;
        e.Description = d.Description;
        e.AccountType = d.AccountType;
        e.Currency = d.Currency;
        e.BankAccountNumber = d.BankAccountNumber;
        e.BankName = d.BankName;
        e.OpeningDate = d.OpeningDate;
        e.IsActive = d.IsActive;
        e.UpdatedAt = DateTime.UtcNow;
        e.UpdatedBy = u;
        if (id.HasValue) await r.UpdateAsync(e); else await r.AddAsync(e);
        await _uow.SaveChangesAsync();
        return Map(e);
    }

    public async Task<List<SupplierDto>> GetSuppliersAsync()
        => (await _uow.Repository<Supplier>().GetAllAsync()).OrderBy(x => x.SupplierCode).Select(Map).ToList();

    public async Task<SupplierDto> GetSupplierAsync(int id)
        => Map(await _uow.Repository<Supplier>().GetByIdAsync(id) ?? throw new KeyNotFoundException());

    public async Task<SupplierDto> SaveSupplierAsync(int? id, CreateUpdateSupplierDto dto, Guid userId)
    {
        ValidateSupplier(dto);

        if (id.HasValue)
        {
            var supplier = await _uow.Repository<Supplier>().GetByIdAsync(id.Value) ?? throw new KeyNotFoundException();
            ApplySupplierUpdate(supplier, dto, userId);
            await _uow.Repository<Supplier>().UpdateAsync(supplier);
            await _uow.SaveChangesAsync();
            return Map(supplier);
        }

        SupplierDto? created = null;
        await _uow.ExecuteWithStrategyAsync(async () =>
        {
            await _uow.BeginTransactionAsync();
            try
            {
                var supplier = new Supplier
                {
                    SupplierCode = SupplierCodeTemporaryPrefix + Guid.NewGuid().ToString("N"),
                    CreatedBy = userId
                };

                ApplySupplierUpdate(supplier, dto, userId);
                await _uow.Repository<Supplier>().AddAsync(supplier);
                await _uow.SaveChangesAsync();

                supplier.SupplierCode = FormatSupplierCode(supplier.Id);
                await _uow.Repository<Supplier>().UpdateAsync(supplier);
                await _uow.SaveChangesAsync();

                await _uow.CommitTransactionAsync();
                created = Map(supplier);
            }
            catch
            {
                await _uow.RollbackTransactionAsync();
                throw;
            }
        });

        return created ?? throw new InvalidOperationException("Supplier was not created.");
    }

    public async Task<List<IncomeCategoryDto>> GetIncomeCategoriesAsync()
        => (await _uow.Repository<IncomeCategory>().GetAllAsync()).OrderBy(x => x.SortOrder).Select(Map).ToList();

    public async Task<IncomeCategoryDto> SaveIncomeCategoryAsync(int? id, CreateUpdateIncomeCategoryDto d, Guid u)
    {
        if (string.IsNullOrWhiteSpace(d.Name) && string.IsNullOrWhiteSpace(d.NameEn) && string.IsNullOrWhiteSpace(d.NameAr))
            throw new ArgumentException("Category name is required.");

        var r = _uow.Repository<IncomeCategory>();
        var e = id.HasValue
            ? await r.GetByIdAsync(id.Value) ?? throw new KeyNotFoundException()
            : new IncomeCategory { CreatedBy = u, Code = IncomeCategoryCodeTemporaryPrefix + Guid.NewGuid().ToString("N") };
        e.NameEn = Normalize(d.NameEn) ?? Normalize(d.Name);
        e.NameAr = Normalize(d.NameAr);
        e.Name = Normalize(d.Name) ?? e.NameEn ?? e.NameAr ?? string.Empty;
        e.Description = d.Description;
        e.GLAccountCode = d.GLAccountCode;
        e.SortOrder = d.SortOrder;
        e.IsActive = d.IsActive;
        e.UpdatedAt = DateTime.UtcNow;
        e.UpdatedBy = u;
        if (id.HasValue) await r.UpdateAsync(e); else await r.AddAsync(e);
        await _uow.SaveChangesAsync();
        if (!id.HasValue)
        {
            e.Code = $"INC-{e.Id:D6}";
            await r.UpdateAsync(e);
            await _uow.SaveChangesAsync();
        }
        return Map(e);
    }

    public async Task<List<ExpenseCategoryDto>> GetExpenseCategoriesAsync()
        => (await _uow.Repository<ExpenseCategory>().GetAllAsync()).OrderBy(x => x.SortOrder).Select(Map).ToList();

    public async Task<ExpenseCategoryDto> SaveExpenseCategoryAsync(int? id, CreateUpdateExpenseCategoryDto d, Guid u)
    {
        var r = _uow.Repository<ExpenseCategory>();
        var e = id.HasValue ? await r.GetByIdAsync(id.Value) ?? throw new KeyNotFoundException() : new ExpenseCategory { CreatedBy = u, Code = ExpenseCategoryCodeTemporaryPrefix + Guid.NewGuid().ToString("N") };
        e.Code = d.Code;
        e.Name = d.Name;
        e.Description = d.Description;
        e.GLAccountCode = d.GLAccountCode;
        e.SortOrder = d.SortOrder;
        e.IsActive = d.IsActive;
        e.UpdatedAt = DateTime.UtcNow;
        e.UpdatedBy = u;
        if (id.HasValue) await r.UpdateAsync(e); else await r.AddAsync(e);
        await _uow.SaveChangesAsync();
        if (!id.HasValue && e.Code.StartsWith(ExpenseCategoryCodeTemporaryPrefix, StringComparison.Ordinal))
        {
            e.Code = $"EXP-{e.Id:D6}";
            await r.UpdateAsync(e);
            await _uow.SaveChangesAsync();
        }
        return Map(e);
    }

    private static void ApplySupplierUpdate(Supplier supplier, CreateUpdateSupplierDto dto, Guid userId)
    {
        supplier.Name = dto.Name.Trim();
        supplier.SupplierType = dto.SupplierType;
        supplier.ServiceCategory = dto.ServiceCategory.Trim();
        supplier.LegalName = Normalize(dto.LegalName);
        supplier.Country = Normalize(dto.Country);
        supplier.ContactPerson = Normalize(dto.ContactPerson);
        supplier.Email = Normalize(dto.Email);
        supplier.PhoneNumber = Normalize(dto.PhoneNumber) ?? Normalize(dto.Phone);
        supplier.Address = Normalize(dto.Address);
        supplier.TaxId = Normalize(dto.TaxId) ?? Normalize(dto.TaxNumber);
        supplier.Category = Normalize(dto.Category) ?? Normalize(dto.ServiceCategory);
        supplier.PaymentTerms = Normalize(dto.PaymentTerms);
        supplier.PaymentDetails = Normalize(dto.PaymentDetails);
        supplier.Notes = Normalize(dto.Notes);
        supplier.Currency = string.IsNullOrWhiteSpace(dto.Currency) ? "EGP" : dto.Currency.Trim().ToUpperInvariant();
        supplier.IsActive = dto.IsActive;
        supplier.UpdatedAt = DateTime.UtcNow;
        supplier.UpdatedBy = userId;
    }

    private static void ValidateSupplier(CreateUpdateSupplierDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Name))
            throw new ArgumentException("Name is required.");

        if (!Enum.IsDefined(typeof(SupplierType), dto.SupplierType))
            throw new ArgumentException("SupplierType is required.");

        if (string.IsNullOrWhiteSpace(dto.ServiceCategory))
            throw new ArgumentException("ServiceCategory is required.");
    }

    private static string FormatSupplierCode(int id) => $"SUP-{id:D6}";

    private static string? Normalize(string? value) => string.IsNullOrWhiteSpace(value) ? null : value.Trim();

    private static FinanceAccountDto Map(FinanceAccount x) => new()
    {
        Id = x.Id,
        Code = x.Code,
        Name = x.Name,
        Description = x.Description,
        AccountType = x.AccountType,
        Currency = x.Currency,
        CurrentBalance = x.CurrentBalance,
        BankAccountNumber = x.BankAccountNumber,
        BankName = x.BankName,
        OpeningDate = x.OpeningDate,
        IsActive = x.IsActive,
        CreatedAt = x.CreatedAt,
        UpdatedAt = x.UpdatedAt
    };

    private static SupplierDto Map(Supplier x) => new()
    {
        Id = x.Id,
        SupplierCode = x.SupplierCode,
        Name = x.Name,
        SupplierType = x.SupplierType,
        ServiceCategory = x.ServiceCategory,
        LegalName = x.LegalName,
        Country = x.Country,
        ContactPerson = x.ContactPerson,
        Email = x.Email,
        PhoneNumber = x.PhoneNumber,
        Address = x.Address,
        TaxId = x.TaxId,
        Category = x.Category,
        PaymentTerms = x.PaymentTerms,
        PaymentDetails = x.PaymentDetails,
        Notes = x.Notes,
        Currency = x.Currency,
        IsActive = x.IsActive,
        CreatedAt = x.CreatedAt,
        UpdatedAt = x.UpdatedAt
    };

    private static IncomeCategoryDto Map(IncomeCategory x) => new()
    {
        Id = x.Id,
        Code = x.Code,
        Name = x.Name,
        NameEn = x.NameEn,
        NameAr = x.NameAr,
        Description = x.Description,
        GLAccountCode = x.GLAccountCode,
        SortOrder = x.SortOrder,
        IsActive = x.IsActive,
        CreatedAt = x.CreatedAt
    };

    private static ExpenseCategoryDto Map(ExpenseCategory x) => new()
    {
        Id = x.Id,
        Code = x.Code,
        Name = x.Name,
        Description = x.Description,
        GLAccountCode = x.GLAccountCode,
        SortOrder = x.SortOrder,
        IsActive = x.IsActive,
        CreatedAt = x.CreatedAt
    };
}
