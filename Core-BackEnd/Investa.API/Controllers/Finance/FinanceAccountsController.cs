using System.Security.Claims;
using Investa.Application.DTOs.Finance;
using Investa.Application.Services.Finance;
using Investa.Domain.Entities.Security;
using Microsoft.AspNetCore.Mvc;

namespace Investa.API.Controllers.Finance;

[ApiController]
[Route("api/v1/admin/company-finance/accounts")]
public class FinanceAccountsController : FinanceMasterDataControllerBase
{
    public FinanceAccountsController(IFinanceMasterDataService service) : base(service) { }

    [HttpGet, Authorize(Permissions = SystemPermissions.FinanceView)]
    public Task<List<FinanceAccountDto>> GetAccounts() => Service.GetAccountsAsync();

    [HttpGet("{id}"), Authorize(Permissions = SystemPermissions.FinanceView)]
    public Task<FinanceAccountDto> GetAccount(int id) => Service.GetAccountAsync(id);

    [HttpPost, Authorize(Permissions = SystemPermissions.FinanceManageMasterData)]
    public async Task<ActionResult<FinanceAccountDto>> CreateAccount(CreateUpdateFinanceAccountDto dto)
    {
        var account = await Service.SaveAccountAsync(null, dto, UserId);
        return CreatedAtAction(nameof(GetAccount), new { id = account.Id }, account);
    }

    [HttpPut("{id}"), Authorize(Permissions = SystemPermissions.FinanceManageMasterData)]
    public Task<FinanceAccountDto> UpdateAccount(int id, CreateUpdateFinanceAccountDto dto) => Service.SaveAccountAsync(id, dto, UserId);
}

[ApiController]
[Route("api/v1/admin/company-finance/suppliers")]
public class SuppliersController : FinanceMasterDataControllerBase
{
    public SuppliersController(IFinanceMasterDataService service) : base(service) { }
    [HttpGet, Authorize(Permissions = SystemPermissions.FinanceView)] public Task<List<SupplierDto>> GetSuppliers() => Service.GetSuppliersAsync();
    [HttpGet("{id}"), Authorize(Permissions = SystemPermissions.FinanceView)] public Task<SupplierDto> GetSupplier(int id) => Service.GetSupplierAsync(id);
    [HttpPost, Authorize(Permissions = SystemPermissions.FinanceManageMasterData)] public async Task<ActionResult<SupplierDto>> CreateSupplier(CreateUpdateSupplierDto dto) { var supplier = await Service.SaveSupplierAsync(null, dto, UserId); return CreatedAtAction(nameof(GetSupplier), new { id = supplier.Id }, supplier); }
    [HttpPut("{id}"), Authorize(Permissions = SystemPermissions.FinanceManageMasterData)] public Task<SupplierDto> UpdateSupplier(int id, CreateUpdateSupplierDto dto) => Service.SaveSupplierAsync(id, dto, UserId);
}

[ApiController]
[Route("api/v1/admin/company-finance/income-categories")]
public class IncomeCategoriesController : FinanceMasterDataControllerBase
{
    public IncomeCategoriesController(IFinanceMasterDataService service) : base(service) { }
    [HttpGet, Authorize(Permissions = SystemPermissions.FinanceView)] public Task<List<IncomeCategoryDto>> GetCategories() => Service.GetIncomeCategoriesAsync();
    [HttpPost, Authorize(Permissions = SystemPermissions.FinanceManageMasterData)] public Task<IncomeCategoryDto> CreateCategory(CreateUpdateIncomeCategoryDto dto) => Service.SaveIncomeCategoryAsync(null, dto, UserId);
    [HttpPut("{id}"), Authorize(Permissions = SystemPermissions.FinanceManageMasterData)] public Task<IncomeCategoryDto> UpdateCategory(int id, CreateUpdateIncomeCategoryDto dto) => Service.SaveIncomeCategoryAsync(id, dto, UserId);
}

[ApiController]
[Route("api/v1/admin/company-finance/expense-categories")]
public class ExpenseCategoriesController : FinanceMasterDataControllerBase
{
    public ExpenseCategoriesController(IFinanceMasterDataService service) : base(service) { }
    [HttpGet, Authorize(Permissions = SystemPermissions.FinanceView)] public Task<List<ExpenseCategoryDto>> GetCategories() => Service.GetExpenseCategoriesAsync();
    [HttpPost, Authorize(Permissions = SystemPermissions.FinanceManageMasterData)] public Task<ExpenseCategoryDto> CreateCategory(CreateUpdateExpenseCategoryDto dto) => Service.SaveExpenseCategoryAsync(null, dto, UserId);
    [HttpPut("{id}"), Authorize(Permissions = SystemPermissions.FinanceManageMasterData)] public Task<ExpenseCategoryDto> UpdateCategory(int id, CreateUpdateExpenseCategoryDto dto) => Service.SaveExpenseCategoryAsync(id, dto, UserId);
}

public abstract class FinanceMasterDataControllerBase : ControllerBase
{
    protected IFinanceMasterDataService Service { get; }
    protected FinanceMasterDataControllerBase(IFinanceMasterDataService service) => Service = service;
    protected Guid UserId => Guid.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("id") ?? User.FindFirstValue("sub"), out var id) ? id : throw new UnauthorizedAccessException("Invalid user ID");
}
