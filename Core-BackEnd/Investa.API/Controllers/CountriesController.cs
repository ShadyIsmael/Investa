using Investa.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Investa.API.Controllers;

[ApiController]
[Route("api/v1/countries")]
[AllowAnonymous]
public sealed class CountriesController(ICountryService countries) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] bool includeInactive = false, CancellationToken cancellationToken = default)
    {
        var items = await countries.GetAllAsync(isActive: includeInactive ? null : true, cancellationToken: cancellationToken);
        return Ok(new { success = true, data = items });
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id, CancellationToken cancellationToken)
    {
        var item = await countries.GetByIdAsync(id, cancellationToken);
        return item is null ? NotFound(new { success = false, code = "COUNTRY_NOT_FOUND", message = "Country was not found." }) : Ok(new { success = true, data = item });
    }
}
