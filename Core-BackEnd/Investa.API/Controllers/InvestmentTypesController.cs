using Investa.Application.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Investa.API.Controllers;

/// <summary>
/// Controller for investment type metadata and lookup operations.
/// Provides available investment types for frontend dropdowns and documentation.
/// </summary>
[ApiController]
[Route("api/v1/investment-types")]
public class InvestmentTypesController : ControllerBase
{
    /// <summary>
    /// Gets all available investment types with their metadata.
    /// Public endpoint - no authentication required.
    /// </summary>
    /// <returns>List of investment types with display names and descriptions</returns>
    [HttpGet]
    [AllowAnonymous]
    public IActionResult GetAll()
    {
        var types = InvestmentTypeDto.GetAll();
        return Ok(new { success = true, data = types });
    }

    /// <summary>
    /// Gets a specific investment type by its ID.
    /// Public endpoint - no authentication required.
    /// </summary>
    /// <param name="id">Investment type ID (1=Founding, 2=Equity)</param>
    /// <returns>Investment type metadata</returns>
    [HttpGet("{id:int}")]
    [AllowAnonymous]
    public IActionResult GetById(int id)
    {
        if (!Enum.IsDefined(typeof(Investa.Domain.Entities.Enums.InvestmentType), id))
        {
            return NotFound(new { success = false, message = "Investment type not found" });
        }

        var type = (Investa.Domain.Entities.Enums.InvestmentType)id;
        var dto = InvestmentTypeDto.FromEnum(type);
        return Ok(new { success = true, data = dto });
    }
}
