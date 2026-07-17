using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Investa.Application.DTOs.Finance;
using Investa.Application.Services.Finance;
using Investa.Domain.Entities.Security;
using Investa.API.Controllers;

namespace Investa.API.Controllers.Finance;

[ApiController]
[Route("api/v1/admin/company-finance/reconciliations")]
[Authorize]
[Produces("application/json")]
public class FinanceReconciliationsController : ControllerBase
{
    private readonly IFinanceReconciliationService _reconciliationService;
    private readonly ILogger<FinanceReconciliationsController> _logger;

    public FinanceReconciliationsController(
        IFinanceReconciliationService reconciliationService,
        ILogger<FinanceReconciliationsController> logger)
    {
        _reconciliationService = reconciliationService ?? throw new ArgumentNullException(nameof(reconciliationService));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    [HttpGet]
    [Authorize(Permissions = SystemPermissions.FinanceView)]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<PaginatedApiResponse<FinanceReconciliationListDto>>> GetList(
        [FromQuery] int? accountId,
        [FromQuery] DateTime? fromDate,
        [FromQuery] DateTime? toDate,
        [FromQuery] string? status,
        [FromQuery] string? search,
        [FromQuery] bool? onlyWithDifference,
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 20)
    {
        try
        {
            var (items, totalCount) = await _reconciliationService.GetListAsync(accountId, fromDate, toDate, status, pageNumber, pageSize, search, onlyWithDifference);
            var totalPages = (int)Math.Ceiling((double)totalCount / Math.Max(1, pageSize));
            return Ok(new PaginatedApiResponse<FinanceReconciliationListDto>
            {
                Success = true,
                Message = "Operation completed successfully",
                Data = items,
                PageNumber = pageNumber,
                PageSize = pageSize,
                TotalCount = totalCount,
                TotalPages = totalPages,
                HasNextPage = pageNumber < totalPages,
                HasPreviousPage = pageNumber > 1,
                Timestamp = DateTime.UtcNow
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving reconciliations");
            return StatusCode(500, new PaginatedApiResponse<FinanceReconciliationListDto>
            {
                Success = false,
                Message = "Internal server error",
                Data = Enumerable.Empty<FinanceReconciliationListDto>(),
                PageNumber = pageNumber,
                PageSize = pageSize,
                TotalCount = 0,
                TotalPages = 0,
                HasNextPage = false,
                HasPreviousPage = false,
                Timestamp = DateTime.UtcNow
            });
        }
    }

    [HttpGet("{id}")]
    [Authorize(Permissions = SystemPermissions.FinanceView)]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<FinanceReconciliationDto>> GetById(int id)
    {
        try
        {
            var result = await _reconciliationService.GetByIdAsync(id);
            return Ok(result);
        }
        catch (KeyNotFoundException)
        {
            return NotFound($"Reconciliation {id} not found");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving reconciliation {Id}", id);
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpPost]
    [Authorize(Permissions = SystemPermissions.FinanceCreate)]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<FinanceReconciliationDto>> Create(
        [FromBody] CreateFinanceReconciliationDto dto)
    {
        try
        {
            var userId = GetCurrentUserId();
            var result = await _reconciliationService.CreateAsync(dto, userId);
            return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating reconciliation");
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpPost("{id}/recalculate")]
    [Authorize(Permissions = SystemPermissions.FinanceCreate)]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<FinanceReconciliationDto>> Recalculate(int id)
    {
        try
        {
            var userId = GetCurrentUserId();
            var result = await _reconciliationService.RecalculateAsync(id, userId);
            return Ok(result);
        }
        catch (KeyNotFoundException)
        {
            return NotFound($"Reconciliation {id} not found");
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error recalculating reconciliation {Id}", id);
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpPut("{id}/statement-balance")]
    [Authorize(Permissions = SystemPermissions.FinanceCreate)]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<FinanceReconciliationDto>> UpdateStatementBalance(
        int id,
        [FromBody] UpdateStatementBalanceDto dto)
    {
        try
        {
            var userId = GetCurrentUserId();
            var result = await _reconciliationService.UpdateStatementBalanceAsync(id, dto.ActualStatementBalance, userId);
            return Ok(result);
        }
        catch (KeyNotFoundException)
        {
            return NotFound($"Reconciliation {id} not found");
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating statement balance for reconciliation {Id}", id);
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpPut("{id}/notes")]
    [Authorize(Permissions = SystemPermissions.FinanceCreate)]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<FinanceReconciliationDto>> UpdateNotes(
        int id,
        [FromBody] string? notes)
    {
        try
        {
            var userId = GetCurrentUserId();
            var result = await _reconciliationService.UpdateNotesAsync(id, notes, userId);
            return Ok(result);
        }
        catch (KeyNotFoundException)
        {
            return NotFound($"Reconciliation {id} not found");
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating notes for reconciliation {Id}", id);
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpPost("{id}/confirm")]
    [Authorize(Permissions = SystemPermissions.FinanceConfirm)]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<FinanceReconciliationDto>> Confirm(int id)
    {
        try
        {
            var userId = GetCurrentUserId();
            var result = await _reconciliationService.ConfirmAsync(id, userId);
            return Ok(result);
        }
        catch (KeyNotFoundException)
        {
            return NotFound($"Reconciliation {id} not found");
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error confirming reconciliation {Id}", id);
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpDelete("{id}")]
    [Authorize(Permissions = SystemPermissions.FinanceManage)]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(int id)
    {
        try
        {
            var userId = GetCurrentUserId();
            await _reconciliationService.DeleteAsync(id, userId);
            return NoContent();
        }
        catch (KeyNotFoundException)
        {
            return NotFound($"Reconciliation {id} not found");
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting reconciliation {Id}", id);
            return StatusCode(500, "Internal server error");
        }
    }

    private Guid GetCurrentUserId()
    {
        var userIdCandidates = new[]
        {
            User.FindFirst("id")?.Value,
            User.FindFirst("sub")?.Value,
            User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value,
            User.FindFirst("http://schemas.microsoft.com/identity/claims/objectidentifier")?.Value
        };

        foreach (var userId in userIdCandidates)
        {
            if (Guid.TryParse(userId, out var result))
                return result;
        }

        throw new UnauthorizedAccessException("Invalid user ID");
    }
}
