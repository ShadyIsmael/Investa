using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Investa.Application.DTOs.Finance;
using Investa.Application.Services.Finance;
using Investa.Domain.Entities.Security;

namespace Investa.API.Controllers.Finance;

/// <summary>
/// API endpoints for Finance Transaction management.
/// Company operating finance only - never investor/project/opportunity money.
/// </summary>
[ApiController]
[Route("api/v1/admin/company-finance/transactions")]
[Authorize]
[Produces("application/json")]
public class FinanceTransactionsController : ControllerBase
{
    private readonly IFinanceTransactionService _transactionService;
    private readonly ILogger<FinanceTransactionsController> _logger;

    public FinanceTransactionsController(
        IFinanceTransactionService transactionService,
        ILogger<FinanceTransactionsController> logger)
    {
        _transactionService = transactionService ?? throw new ArgumentNullException(nameof(transactionService));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    /// <summary>
    /// GET /api/financetransactions - List all finance transactions
    /// </summary>
    [HttpGet]
    [Authorize(Permissions = SystemPermissions.FinanceView)]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<PaginatedResult<FinanceTransactionListDto>>> GetTransactions(
        [FromQuery] bool assignedToMe = false,
        [FromQuery] bool createdByMe = false,
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 20)
    {
        try
        {
            var userId = GetCurrentUserId();
            List<FinanceTransactionListDto> transactions;

            if (assignedToMe)
            {
                // Transactions awaiting review (ReadyForReview, not created by current user)
                transactions = await _transactionService.GetTransactionsAssignedToMeAsync(userId, pageNumber, pageSize);
            }
            else if (createdByMe)
            {
                // Transactions created by current user
                transactions = await _transactionService.GetTransactionsCreatedByMeAsync(userId, pageNumber, pageSize);
            }
            else
            {
                // All transactions
                transactions = await _transactionService.GetTransactionsAsync(pageNumber, pageSize);
            }

            return Ok(new PaginatedResult<FinanceTransactionListDto>
            {
                Data = transactions,
                PageNumber = pageNumber,
                PageSize = pageSize,
                TotalCount = transactions.Count
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving finance transactions");
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// GET /api/financetransactions/filter - Filter finance transactions
    /// </summary>
    [HttpGet("filter")]
    [Authorize(Permissions = SystemPermissions.FinanceView)]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<ActionResult<List<FinanceTransactionListDto>>> FilterTransactions(
        [FromQuery] DateTime? fromDate,
        [FromQuery] DateTime? toDate,
        [FromQuery] string? status,
        [FromQuery] int? accountId,
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 20)
    {
        try
        {
            var transactions = await _transactionService.GetTransactionsByFilterAsync(
                fromDate, toDate, status, accountId, pageNumber, pageSize);
            return Ok(transactions);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error filtering finance transactions");
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// GET /api/financetransactions/{id} - Get a specific transaction
    /// </summary>
    [HttpGet("{id}")]
    [Authorize(Permissions = SystemPermissions.FinanceView)]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<FinanceTransactionDto>> GetTransaction(int id)
    {
        try
        {
            var transaction = await _transactionService.GetTransactionAsync(id);
            return Ok(transaction);
        }
        catch (KeyNotFoundException)
        {
            return NotFound($"Transaction {id} not found");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving transaction {Id}", id);
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// POST /api/financetransactions - Create a new finance transaction (draft)
    /// </summary>
    [HttpPost]
    [Authorize(Permissions = SystemPermissions.FinanceCreate)]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<FinanceTransactionDto>> CreateTransaction(
        [FromBody] CreateFinanceTransactionDto dto)
    {
        try
        {
            var userId = GetCurrentUserId();
            var ipAddress = GetClientIpAddress();
            var transaction = await _transactionService.CreateTransactionAsync(dto, userId, ipAddress);
            return CreatedAtAction(nameof(GetTransaction), new { id = transaction.Id }, transaction);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating finance transaction");
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// PUT /api/financetransactions/{id} - Update a draft transaction
    /// </summary>
    [HttpPut("{id}")]
    [Authorize(Permissions = SystemPermissions.FinanceEditDraft)]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<FinanceTransactionDto>> UpdateTransaction(
        int id,
        [FromBody] UpdateFinanceTransactionDto dto)
    {
        try
        {
            var userId = GetCurrentUserId();
            var ipAddress = GetClientIpAddress();
            var transaction = await _transactionService.UpdateTransactionAsync(id, dto, userId, ipAddress);
            return Ok(transaction);
        }
        catch (KeyNotFoundException)
        {
            return NotFound($"Transaction {id} not found");
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating transaction {Id}", id);
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// POST /api/financetransactions/{id}/confirm - Confirm a transaction (lock it)
    /// </summary>
    [HttpPost("{id}/confirm")]
    [Authorize(Permissions = SystemPermissions.FinanceConfirm)]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<FinanceTransactionDto>> ConfirmTransaction(
        int id,
        [FromBody] ConfirmFinanceTransactionDto dto)
    {
        try
        {
            var userId = GetCurrentUserId();
            var ipAddress = GetClientIpAddress();
            var transaction = await _transactionService.ConfirmTransactionAsync(id, dto, userId, ipAddress);
            return Ok(transaction);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error confirming transaction {Id}", id);
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// POST /api/financetransactions/{id}/reverse - Reverse a confirmed transaction
    /// </summary>
    [HttpPost("{id}/reverse")]
    [Authorize(Permissions = SystemPermissions.FinanceReverse)]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<FinanceTransactionDto>> ReverseTransaction(
        int id,
        [FromBody] ReverseFinanceTransactionDto dto)
    {
        try
        {
            var userId = GetCurrentUserId();
            var ipAddress = GetClientIpAddress();
            var transaction = await _transactionService.ReverseTransactionAsync(id, dto, userId, ipAddress);
            return Ok(transaction);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error reversing transaction {Id}", id);
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// POST /api/financetransactions/{id}/cancel - Cancel a draft/pending transaction
    /// </summary>
    [HttpPost("{id}/cancel")]
    [Authorize(Permissions = SystemPermissions.FinanceManage)]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<FinanceTransactionDto>> CancelTransaction(
        int id,
        [FromBody] CancelFinanceTransactionDto dto)
    {
        try
        {
            var userId = GetCurrentUserId();
            var ipAddress = GetClientIpAddress();
            var transaction = await _transactionService.CancelTransactionAsync(id, dto, userId, ipAddress);
            return Ok(transaction);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error cancelling transaction {Id}", id);
            return StatusCode(500, "Internal server error");
        }
    }

    // ────────────── Maker/Checker Workflow Endpoints ──────────────────────────────

    /// <summary>
    /// POST /api/financetransactions/{id}/submit - Submit transaction for review (Maker action)
    /// </summary>
    [HttpPost("{id}/submit")]
    [Authorize(Permissions = SystemPermissions.FinanceSubmit)]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<FinanceTransactionDto>> SubmitTransaction(
        int id,
        [FromBody] SubmitFinanceTransactionDto dto)
    {
        try
        {
            var userId = GetCurrentUserId();
            var ipAddress = GetClientIpAddress();
            var transaction = await _transactionService.SubmitTransactionAsync(id, dto, userId, ipAddress);
            return Ok(transaction);
        }
        catch (KeyNotFoundException)
        {
            return NotFound($"Transaction {id} not found");
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error submitting transaction {Id}", id);
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// POST /api/financetransactions/{id}/approve - Approve transaction (Checker action)
    /// Changes status from ReadyForReview to Confirmed.
    /// Creator cannot approve their own transaction.
    /// </summary>
    [HttpPost("{id}/approve")]
    [Authorize(Permissions = SystemPermissions.FinanceConfirm)]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<FinanceTransactionDto>> ApproveTransaction(
        int id,
        [FromBody] ApproveFinanceTransactionDto dto)
    {
        try
        {
            var userId = GetCurrentUserId();
            var ipAddress = GetClientIpAddress();
            var transaction = await _transactionService.ApproveTransactionAsync(id, dto, userId, ipAddress);
            return Ok(transaction);
        }
        catch (KeyNotFoundException)
        {
            return NotFound($"Transaction {id} not found");
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error approving transaction {Id}", id);
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// POST /api/financetransactions/{id}/reject - Reject transaction (Checker action)
    /// Returns transaction to Maker (changes status to Rejected).
    /// Creator cannot reject their own transaction.
    /// </summary>
    [HttpPost("{id}/reject")]
    [Authorize(Permissions = SystemPermissions.FinanceReview)]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<FinanceTransactionDto>> RejectTransaction(
        int id,
        [FromBody] RejectFinanceTransactionDto dto)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(dto.RejectionReason))
                return BadRequest(new { error = "Rejection reason is required" });

            var userId = GetCurrentUserId();
            var ipAddress = GetClientIpAddress();
            var transaction = await _transactionService.RejectTransactionAsync(id, dto, userId, ipAddress);
            return Ok(transaction);
        }
        catch (KeyNotFoundException)
        {
            return NotFound($"Transaction {id} not found");
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error rejecting transaction {Id}", id);
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// DELETE /api/financetransactions/{id} - Delete a draft transaction
    /// </summary>
    [HttpDelete("{id}")]
    [Authorize(Permissions = SystemPermissions.FinanceManage)]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> DeleteTransaction(int id)
    {
        try
        {
            var userId = GetCurrentUserId();
            await _transactionService.DeleteDraftTransactionAsync(id, userId);
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting transaction {Id}", id);
            return StatusCode(500, "Internal server error");
        }
    }

    /// <summary>
    /// GET /api/financetransactions/{id}/audit - Get audit history for a transaction
    /// </summary>
    [HttpGet("{id}/audit")]
    [Authorize(Permissions = SystemPermissions.AuditView)]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<ActionResult<TransactionAuditHistoryDto>> GetAuditHistory(int id)
    {
        try
        {
            var history = await _transactionService.GetAuditHistoryAsync(id);
            return Ok(history);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving audit history for transaction {Id}", id);
            return StatusCode(500, "Internal server error");
        }
    }

    // Helper methods
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

    private string? GetClientIpAddress()
    {
        if (HttpContext.Request.Headers.ContainsKey("X-Forwarded-For"))
            return HttpContext.Request.Headers["X-Forwarded-For"].ToString().Split(',')[0];
        return HttpContext.Connection.RemoteIpAddress?.ToString();
    }
}

/// <summary>Generic paginated result wrapper.</summary>
public class PaginatedResult<T>
{
    public List<T> Data { get; set; } = new();
    public int PageNumber { get; set; }
    public int PageSize { get; set; }
    public int TotalCount { get; set; }
}
