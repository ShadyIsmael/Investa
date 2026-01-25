using Investa.Application.DTOs;
using Investa.Application.Interfaces;
using Investa.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using System;
using System.Linq;

namespace Investa.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DashboardController : ControllerBase
{
    private readonly ApplicationDbContext _db;
    private readonly IScoreService _scoreService;
    private readonly ICreditService _creditService;
    private readonly ILogger<DashboardController> _logger;

    public DashboardController(ApplicationDbContext db, IScoreService scoreService, ICreditService creditService, ILogger<DashboardController> logger)
    {
        _db = db;
        _scoreService = scoreService;
        _creditService = creditService;
        _logger = logger;
    }

    // GET /api/dashboard/summary
    // Returns a basic dashboard summary for the authenticated user (uses token)
    [HttpGet("summary")]
    [ProducesResponseType(typeof(DashboardSummaryDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetSummary()
    {
        var userIdClaim = User.FindFirst("sub")?.Value ?? User.FindFirst("id")?.Value;
        if (!Guid.TryParse(userIdClaim, out var userId))
            return Unauthorized(new { message = "Unable to identify user from token" });

        var client = await _db.Clients.AsNoTracking().FirstOrDefaultAsync(c => c.UserId == userId);
        if (client == null)
            return NotFound(new { message = "Client profile not found" });

        var credibility = await _scoreService.GetCredibilityScoreAsync(userId);

        // Fetch transactions and limit to the last 5 years
        var creditTxs = (await _creditService.GetClientTransactionsAsync(userId))?.ToList() ?? new List<CreditTransactionDto>();
        var scoreTxs = (await _scoreService.GetClientScoreTransactionsAsync(userId))?.ToList() ?? new List<ScoreTransactionDto>();

        var cutoff = DateTime.UtcNow.AddYears(-5);

        creditTxs = creditTxs.Where(t => t.CreatedAt >= cutoff).OrderByDescending(t => t.CreatedAt).ToList();
        scoreTxs = scoreTxs.Where(t => t.CreatedAt >= cutoff).OrderByDescending(t => t.CreatedAt).ToList();

        var dto = new DashboardSummaryDto
        {
            CredibilityScore = credibility,
            WalletBalance = client.Credit,
            ClientScore = client.Score,
            Credit = client.Credit,
            CreditTransactions = creditTxs,
            ScoreTransactions = scoreTxs
        };

        return Ok(dto);
    }

    // GET /api/dashboard/my/metrics
    // Returns minimal metrics (client score & credit) for authenticated user
    [HttpGet("my/metrics")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetMyMetrics()
    {
        var userIdClaim = User.FindFirst("sub")?.Value ?? User.FindFirst("id")?.Value;
        if (!Guid.TryParse(userIdClaim, out var userId))
            return Unauthorized(new { message = "Unable to identify user from token" });

        var client = await _db.Clients.AsNoTracking().FirstOrDefaultAsync(c => c.UserId == userId);
        if (client == null)
            return NotFound(new { message = "Client profile not found" });

        return Ok(new { clientScore = client.Score, credit = client.Credit });
    }

    // GET /api/dashboard/my/credits
    // Returns credit transactions for the authenticated client
    [HttpGet("my/credits")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetMyCredits()
    {
        var userIdClaim = User.FindFirst("sub")?.Value ?? User.FindFirst("id")?.Value;
        if (!Guid.TryParse(userIdClaim, out var userId))
            return Unauthorized(new { message = "Unable to identify user from token" });

        var list = await _creditService.GetClientTransactionsAsync(userId);
        return Ok(list);
    }

    // GET /api/dashboard/my/score-transactions
    // Returns score transactions for the authenticated client
    [HttpGet("my/score-transactions")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetMyScoreTransactions()
    {
        var userIdClaim = User.FindFirst("sub")?.Value ?? User.FindFirst("id")?.Value;
        if (!Guid.TryParse(userIdClaim, out var userId))
            return Unauthorized(new { message = "Unable to identify user from token" });

        var txs = await _scoreService.GetClientScoreTransactionsAsync(userId);
        return Ok(txs);
    }

    // GET /api/dashboard/my/top-engagements
    // Returns top N business categories (grouped by category id) by total invested amount for the authenticated user (default N=5)
    [HttpGet("my/top-engagements")]
    [ProducesResponseType(typeof(IEnumerable<InvestmentCategoryCountDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetMyTopEngagements([FromQuery] int take = 5)
    {
        var userIdClaim = User.FindFirst("sub")?.Value ?? User.FindFirst("id")?.Value;
        if (!Guid.TryParse(userIdClaim, out var userId))
            return Unauthorized(new { message = "Unable to identify user from token" });

        var client = await _db.Clients.AsNoTracking().FirstOrDefaultAsync(c => c.UserId == userId);
        if (client == null)
            return NotFound(new { message = "Client profile not found" });

        // Query InvestmentParticipants and join with Investments to group by category
        var query = _db.InvestmentParticipants
            .Where(ip => ip.InvestorId == userId)
            .Join(_db.Investments,
                ip => ip.InvestmentId,
                inv => inv.Id,
                (ip, inv) => new { ip.AmountInvested, inv.BusinessCategoryId })
            .Where(x => x.BusinessCategoryId != null)
            .GroupBy(x => x.BusinessCategoryId)
            .Select(g => new
            {
                BusinessCategoryId = g.Key!.Value,
                TotalAmount = g.Sum(x => x.AmountInvested),
                InvestmentCount = g.Count()
            })
            .OrderByDescending(x => x.TotalAmount)
            .Take(take)
            .Join(_db.BusinessCategories,
                  g => g.BusinessCategoryId,
                  bc => bc.Id,
                  (g, bc) => new InvestmentCategoryCountDto
                  {
                      BusinessCategoryId = bc.Id,
                      BusinessCategoryName = bc.Value,
                      BusinessCategoryNameEn = bc.Value,
                      BusinessCategoryNameAr = bc.ValueAr,
                      InvestmentCount = g.InvestmentCount,
                      TotalShareAmount = g.TotalAmount
                  });

        var list = await query.AsNoTracking().ToListAsync();
        return Ok(list);
    }

    // GET /api/dashboard/my/top-categories
    // Returns top N business categories by total invested amount for the authenticated user (default N=5)
    [HttpGet("my/top-categories")]
    [ProducesResponseType(typeof(IEnumerable<InvestmentCategoryCountDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetMyTopCategories([FromQuery] int take = 5)
    {
        var userIdClaim = User.FindFirst("sub")?.Value ?? User.FindFirst("id")?.Value;
        if (!Guid.TryParse(userIdClaim, out var userId))
            return Unauthorized(new { message = "Unable to identify user from token" });

        var client = await _db.Clients.AsNoTracking().FirstOrDefaultAsync(c => c.UserId == userId);
        if (client == null)
            return NotFound(new { message = "Client profile not found" });

        var query = _db.InvestmentParticipants
            .Where(ip => ip.InvestorId == userId)
            .Join(_db.Investments,
                  ip => ip.InvestmentId,
                  inv => inv.Id,
                  (ip, inv) => new { ip.Id, inv.BusinessCategoryId })
            .Where(x => x.BusinessCategoryId != null)
            .GroupBy(x => x.BusinessCategoryId)
            .Select(g => new
            {
                CategoryId = g.Key!.Value,
                InvestmentCount = g.Select(x => x.Id).Distinct().Count()
            })
            .OrderByDescending(x => x.InvestmentCount)
            .Take(take)
            .Join(_db.BusinessCategories,
                  g => g.CategoryId,
                  bc => bc.Id,
                  (g, bc) => new InvestmentCategoryCountDto
                  {
                      BusinessCategoryId = bc.Id,
                      BusinessCategoryName = bc.Value,
                      InvestmentCount = g.InvestmentCount
                  });

        var list = await query.AsNoTracking().ToListAsync();
        return Ok(list);
    }

    // (moved) investments/stats/by-category relocated to admin dashboard controller
} 