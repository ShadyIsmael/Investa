using System.Security.Claims;
using Investa.Application.Common;
using Investa.Application.DTOs;
using Investa.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Investa.API.Controllers.Admin;

[ApiController]
[Route("api/v1/admin/currencies")]
[Route("api/admin/currencies")]
[Authorize(Roles = "Admin")]
public sealed class CurrenciesController(ICurrencyAdminService currencies) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] string? search, [FromQuery] bool? isActive, CancellationToken cancellationToken) =>
        Ok(new { success = true, data = await currencies.GetAllAsync(search, isActive, cancellationToken) });

    [HttpGet("{isoCode}")]
    public async Task<IActionResult> Get(string isoCode, CancellationToken cancellationToken)
    {
        var item = await currencies.GetAsync(isoCode, cancellationToken);
        return item is null ? NotFound(new { success = false, code = "CURRENCY_NOT_FOUND", message = "Currency was not found." }) : Ok(new { success = true, data = item });
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateCurrencyRequest request, CancellationToken cancellationToken)
    {
        try
        {
            var item = await currencies.CreateAsync(request, ActorId(), cancellationToken);
            return CreatedAtAction(nameof(Get), new { isoCode = item.ISOCode }, new { success = true, data = item });
        }
        catch (BusinessValidationException ex) { return Error(ex); }
    }

    [HttpPut("{isoCode}")]
    public async Task<IActionResult> Update(string isoCode, UpdateCurrencyRequest request, CancellationToken cancellationToken)
    {
        try { return Ok(new { success = true, data = await currencies.UpdateAsync(isoCode, request, ActorId(), cancellationToken) }); }
        catch (BusinessValidationException ex) { return Error(ex); }
    }

    [HttpPatch("{isoCode}/status")]
    public async Task<IActionResult> SetStatus(string isoCode, SetCurrencyStatusRequest request, CancellationToken cancellationToken)
    {
        try { return Ok(new { success = true, data = await currencies.SetActiveAsync(isoCode, request.IsActive, ActorId(), cancellationToken) }); }
        catch (BusinessValidationException ex) { return Error(ex); }
    }

    private Guid ActorId()
    {
        var value = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("id") ?? User.FindFirstValue("sub");
        return Guid.TryParse(value, out var id) ? id : throw new BusinessValidationException("ADMIN_ID_REQUIRED", "Authenticated admin identity is required.");
    }

    private IActionResult Error(BusinessValidationException ex) =>
        ex.Code == "CURRENCY_NOT_FOUND"
            ? NotFound(new { success = false, code = ex.Code, message = ex.Message })
            : BadRequest(new { success = false, code = ex.Code, message = ex.Message });
}
