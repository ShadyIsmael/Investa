using System.Security.Claims;
using Investa.Application.Common;
using Investa.Application.DTOs;
using Investa.Application.Interfaces;
using Investa.Domain.Entities.Company;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Investa.API.Controllers.Admin;

[ApiController]
[Route("api/v1/admin/catalog/products")]
[Route("api/admin/catalog/products")]
[Authorize(Policy = "RequirePermission:Company.Products.View")]
public sealed class CompanyCatalogController(ICompanyCatalogService catalog) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> List([FromQuery] CompanyCatalogListQuery query, CancellationToken cancellationToken) =>
        Ok(new { success = true, data = await catalog.ListAsync(query, cancellationToken) });

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> Get(Guid id, CancellationToken cancellationToken)
    {
        var item = await catalog.GetAsync(id, cancellationToken);
        return item is null ? NotFound(new { success = false, code = "CATALOG_ITEM_NOT_FOUND", message = "Catalog item was not found." }) : Ok(new { success = true, data = item });
    }

    [HttpPost]
    [Authorize(Policy = "RequirePermission:Company.Products.Create")]
    public async Task<IActionResult> Create(CompanyCatalogItemUpsertRequest request, CancellationToken cancellationToken)
    {
        try
        {
            var item = await catalog.CreateAsync(request, cancellationToken, ActorId());
            return CreatedAtAction(nameof(Get), new { id = item.Id }, new { success = true, data = item });
        }
        catch (BusinessValidationException ex) { return Error(ex); }
    }

    [HttpPut("{id:guid}")]
    [Authorize(Policy = "RequirePermission:Company.Products.Edit")]
    public async Task<IActionResult> Update(Guid id, CompanyCatalogItemUpsertRequest request, CancellationToken cancellationToken)
    {
        try
        {
            var item = await catalog.UpdateAsync(id, request, cancellationToken, ActorId());
            return item is null ? NotFound(new { success = false, code = "CATALOG_ITEM_NOT_FOUND", message = "Catalog item was not found." }) : Ok(new { success = true, data = item });
        }
        catch (BusinessValidationException ex) { return Error(ex); }
    }

    [HttpPatch("{id:guid}/status")]
    [Authorize(Policy = "RequirePermission:Company.Products.Manage")]
    public async Task<IActionResult> SetStatus(Guid id, SetCompanyCatalogItemStatusRequest request, CancellationToken cancellationToken)
    {
        try
        {
            var item = await catalog.SetStatusAsync(id, request.Status, cancellationToken, ActorId());
            return item is null ? NotFound(new { success = false, code = "CATALOG_ITEM_NOT_FOUND", message = "Catalog item was not found." }) : Ok(new { success = true, data = item });
        }
        catch (BusinessValidationException ex) { return Error(ex); }
    }

    private Guid? ActorId()
    {
        var value = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("id") ?? User.FindFirstValue("sub");
        return Guid.TryParse(value, out var id) ? id : null;
    }

    private static IActionResult Error(BusinessValidationException ex) =>
        new ObjectResult(new { success = false, code = ex.Code, message = ex.Message }) { StatusCode = StatusCodes.Status400BadRequest };
}
