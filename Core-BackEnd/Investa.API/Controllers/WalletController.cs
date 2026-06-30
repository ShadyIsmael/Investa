using System.Security.Claims;
using Investa.Application.Common;
using Investa.Application.DTOs;
using Investa.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Investa.API.Controllers;

[Route("api/v1/wallet")]
public class WalletController : BaseApiController
{
    private readonly IWalletService _walletService;

    public WalletController(IWalletService walletService)
    {
        _walletService = walletService;
    }

    [HttpGet("me")]
    [Authorize]
    [ProducesResponseType(typeof(ApiResponse<WalletDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetMyWallet(CancellationToken cancellationToken)
    {
        var userId = ResolveUserIdFromClaims();
        if (userId == null || userId == Guid.Empty)
            return ErrorResponse("Unable to resolve authenticated user", 401);

        var wallet = await _walletService.CreateWalletAsync(userId.Value, cancellationToken);
        return SuccessResponse(wallet);
    }

    [HttpGet("me/balance")]
    [Authorize]
    [ProducesResponseType(typeof(ApiResponse<decimal>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetMyBalance(CancellationToken cancellationToken)
    {
        var userId = ResolveUserIdFromClaims();
        if (userId == null || userId == Guid.Empty)
            return ErrorResponse("Unable to resolve authenticated user", 401);

        await _walletService.CreateWalletAsync(userId.Value, cancellationToken);
        var balance = await _walletService.GetBalanceAsync(userId.Value, cancellationToken);
        return SuccessResponse(balance);
    }

    [HttpGet("me/transactions")]
    [Authorize]
    [ProducesResponseType(typeof(ApiResponse<IReadOnlyList<WalletTransactionDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetMyTransactions(
        [FromQuery] int skip = 0,
        [FromQuery] int take = 100,
        CancellationToken cancellationToken = default)
    {
        var userId = ResolveUserIdFromClaims();
        if (userId == null || userId == Guid.Empty)
            return ErrorResponse("Unable to resolve authenticated user", 401);

        if (skip < 0)
            return ErrorResponse("Skip must be zero or greater", 400);

        if (take <= 0 || take > 500)
            return ErrorResponse("Take must be between 1 and 500", 400);

        await _walletService.CreateWalletAsync(userId.Value, cancellationToken);
        var transactions = await _walletService.GetTransactionsAsync(userId.Value, skip, take, cancellationToken);
        return SuccessResponse(transactions);
    }

    [HttpGet("{userId:guid}")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(ApiResponse<WalletDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetWallet(Guid userId, CancellationToken cancellationToken)
    {
        if (userId == Guid.Empty)
            return ErrorResponse("UserId is required", 400);

        var wallet = await _walletService.GetWalletAsync(userId, cancellationToken);
        return SuccessResponse(wallet);
    }

    [HttpGet("{userId:guid}/balance")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(ApiResponse<decimal>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetBalance(Guid userId, CancellationToken cancellationToken)
    {
        if (userId == Guid.Empty)
            return ErrorResponse("UserId is required", 400);

        var balance = await _walletService.GetBalanceAsync(userId, cancellationToken);
        return SuccessResponse(balance);
    }

    [HttpGet("{userId:guid}/transactions")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(ApiResponse<IReadOnlyList<WalletTransactionDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetTransactions(
        Guid userId,
        [FromQuery] int skip = 0,
        [FromQuery] int take = 100,
        CancellationToken cancellationToken = default)
    {
        if (userId == Guid.Empty)
            return ErrorResponse("UserId is required", 400);

        if (skip < 0)
            return ErrorResponse("Skip must be zero or greater", 400);

        if (take <= 0 || take > 500)
            return ErrorResponse("Take must be between 1 and 500", 400);

        var transactions = await _walletService.GetTransactionsAsync(userId, skip, take, cancellationToken);
        return SuccessResponse(transactions);
    }

    [HttpPost("{userId:guid}")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(ApiResponse<WalletDto>), StatusCodes.Status201Created)]
    public async Task<IActionResult> CreateWallet(Guid userId, CancellationToken cancellationToken)
    {
        if (userId == Guid.Empty)
            return ErrorResponse("UserId is required", 400);

        var wallet = await _walletService.CreateWalletAsync(userId, cancellationToken);
        return SuccessResponse(wallet, "Wallet created successfully", 201);
    }

    [HttpPost("credit")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(ApiResponse<WalletTransactionDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> Credit([FromBody] CreditWalletRequest request, CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid)
            return ErrorResponse("Invalid request", 400, ModelState);

        if (request.UserId == Guid.Empty)
            return ErrorResponse("UserId is required", 400);

        try
        {
            var transaction = await _walletService.CreditAsync(
                request.UserId,
                request.Amount,
                request.Reason,
                request.ReferenceType,
                request.ReferenceId,
                request.Description,
                request.CreatedByUserId ?? ResolveUserIdFromClaims(),
                cancellationToken);

            return SuccessResponse(transaction, "Wallet credited successfully");
        }
        catch (BusinessValidationException ex)
        {
            return ErrorResponse(ex.Message, 400);
        }
    }

    [HttpPost("debit")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(ApiResponse<WalletTransactionDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> Debit([FromBody] DebitWalletRequest request, CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid)
            return ErrorResponse("Invalid request", 400, ModelState);

        if (request.UserId == Guid.Empty)
            return ErrorResponse("UserId is required", 400);

        try
        {
            var transaction = await _walletService.DebitAsync(
                request.UserId,
                request.Amount,
                request.Reason,
                request.ReferenceType,
                request.ReferenceId,
                request.Description,
                request.CreatedByUserId ?? ResolveUserIdFromClaims(),
                cancellationToken);

            return SuccessResponse(transaction, "Wallet debited successfully");
        }
        catch (BusinessValidationException ex)
        {
            return ErrorResponse(ex.Message, 400);
        }
    }

    private Guid? ResolveUserIdFromClaims()
    {
        var claimValue = User.FindFirst("sub")?.Value
                         ?? User.FindFirst("id")?.Value
                         ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        return Guid.TryParse(claimValue, out var userId) ? userId : null;
    }
}
