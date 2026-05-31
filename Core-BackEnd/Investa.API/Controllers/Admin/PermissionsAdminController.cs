using Investa.Application.DTOs;
using Investa.Application.Interfaces;
using Investa.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Investa.API.Controllers.Admin;

/// <summary>
/// Exposes all available permissions so the frontend can build permission-picker UIs.
/// </summary>
[ApiController]
[Route("api/v1/admin/permissions")]
[Route("api/admin/permissions")]
[Authorize(Policy = "RequirePermission:RBAC.View")]
public class PermissionsAdminController : ControllerBase
{
    private readonly IUnitOfWork _unitOfWork;

    public PermissionsAdminController(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    /// <summary>
    /// Returns all permission definitions in the system (id + key + name).
    /// Used by the admin UI to populate permission-picker checkboxes.
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        try
        {
            var perms = await _unitOfWork.Repository<Permission>().FindAsync(_ => true);

            var dtos = perms.Select(p => new PermissionDto
            {
                Id = p.Id,
                Key = p.Key,
                Name = p.Name,
                Description = p.Description,
                CreatedAt = p.CreatedAt
            });

            return Ok(dtos);
        }
        catch (Exception)
        {
            return StatusCode(500, "Error fetching permissions");
        }
    }
}
