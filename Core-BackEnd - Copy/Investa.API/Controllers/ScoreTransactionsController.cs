using Microsoft.AspNetCore.Mvc;
using Investa.Application.Interfaces;
using Investa.Application.DTOs;

namespace Investa.API.Controllers;

[ApiController]
[Route("api/v1/score-transactions")]
public class ScoreTransactionsController : ControllerBase
{
    private readonly IScoreService _scoreService;

    public ScoreTransactionsController(IScoreService scoreService)
    {
        _scoreService = scoreService;
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateScoreTransactionDto dto)
    {
        if (dto == null) return BadRequest();
        var tx = await _scoreService.CreateScoreTransactionAsync(dto.UserId, dto.Score, dto.TransactionTypeId, dto.ReviewerId);
        return CreatedAtAction(nameof(GetClientTransactions), new { userId = dto.UserId }, tx);
    }

    [HttpGet("/api/v1/clients/{userId:guid}/score-transactions")]
    public async Task<IActionResult> GetClientTransactions(Guid userId)
    {
        var txs = await _scoreService.GetClientScoreTransactionsAsync(userId);
        return Ok(txs);
    }
}