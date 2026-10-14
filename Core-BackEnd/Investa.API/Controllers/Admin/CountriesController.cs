using System.Security.Claims;
using Investa.Application.Common;
using Investa.Application.DTOs;
using Investa.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Investa.API.Controllers.Admin;

[ApiController]
[Route("api/v1/admin/countries")]
[Route("api/admin/countries")]
[Authorize(Roles = "Admin")]
public sealed class CountriesController(ICountryService countries) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] string? search, [FromQuery] bool? isActive, CancellationToken cancellationToken) =>
        Ok(new { success = true, data = await countries.GetAllAsync(search, isActive, cancellationToken) });

    [HttpGet("{id:int}")]
    public async Task<IActionResult> Get(int id, CancellationToken cancellationToken)
    {
        var item = await countries.GetByIdAsync(id, cancellationToken);
        return item is null ? NotFound(new { success = false, code = "COUNTRY_NOT_FOUND", message = "Country was not found." }) : Ok(new { success = true, data = item });
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateCountryRequest request, CancellationToken cancellationToken)
    {
        try
        {
            var item = await countries.CreateAsync(request, ActorId(), cancellationToken);
            return CreatedAtAction(nameof(Get), new { id = item.Id }, new { success = true, data = item });
        }
        catch (BusinessValidationException ex) { return Error(ex); }
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, UpdateCountryRequest request, CancellationToken cancellationToken)
    {
        try
        {
            var item = await countries.UpdateAsync(id, request, ActorId(), cancellationToken);
            return item is null ? NotFound(new { success = false, code = "COUNTRY_NOT_FOUND", message = "Country was not found." }) : Ok(new { success = true, data = item });
        }
        catch (BusinessValidationException ex) { return Error(ex); }
    }

    [HttpPatch("{id:int}/status")]
    public async Task<IActionResult> SetStatus(int id, SetCountryStatusRequest request, CancellationToken cancellationToken)
    {
        var item = await countries.SetStatusAsync(id, request.IsActive, ActorId(), cancellationToken);
        return item is null ? NotFound(new { success = false, code = "COUNTRY_NOT_FOUND", message = "Country was not found." }) : Ok(new { success = true, data = item });
    }

    private Guid ActorId()
    {
        var value = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("id") ?? User.FindFirstValue("sub");
        return Guid.TryParse(value, out var id) ? id : throw new BusinessValidationException("ADMIN_ID_REQUIRED", "Authenticated admin identity is required.");
    }

    private IActionResult Error(BusinessValidationException ex) =>
        ex.Code == "COUNTRY_NOT_FOUND" ? NotFound(new { success = false, code = ex.Code, message = ex.Message }) : BadRequest(new { success = false, code = ex.Code, message = ex.Message });
}
