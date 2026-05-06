using System.Threading.Tasks;
using Investa.Application.DTOs;
using Investa.Application.Interfaces;
using Investa.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Investa.Domain.Entities.Security;
using Microsoft.Extensions.Localization;
using Investa.API.Resources;

namespace Investa.API.Controllers.Admin
{
    [ApiController]
    [Route("api/v1/admin/dashboard")]
    [Authorize(Roles = "Admin")]
    public class DashboardController : ControllerBase
    {
        private readonly ICreditService _creditService;
        private readonly ApplicationDbContext _db;
        private readonly IStringLocalizer<SharedResource> _localizer;

        public DashboardController(ApplicationDbContext db, ICreditService creditService, IStringLocalizer<SharedResource> localizer)
        {
            _db = db;
            _creditService = creditService;
            _localizer = localizer;
        }

        // GET /api/v1/admin/dashboard/{userId}/timeseries
        [HttpGet("{userId:guid}/timeseries")]
        public async Task<IActionResult> Timeseries(Guid userId, [FromQuery] DateTime? from, [FromQuery] DateTime? to, [FromQuery] string metric = "balance", [FromQuery] string interval = "month")
        {
            var toDt = to ?? DateTime.UtcNow;
            var fromDt = from ?? toDt.AddYears(-1);

            metric = metric?.ToLower() ?? "balance";
            interval = interval?.ToLower() ?? "month";

            if (metric != "balance" && metric != "net" && metric != "count") return BadRequest(_localizer["InvalidMetric"].Value);
            if (interval != "month") return BadRequest(_localizer["OnlyMonthIntervalSupported"].Value);

            var series = await _creditService.GetClientCreditTimeseriesAsync(userId, fromDt, toDt, metric, interval);
            return Ok(series);
        }

        // GET /api/v1/admin/dashboard/org/timeseries
        // Returns monthly summed positive credits for all clients in the format { id: monthNumber, amount: sum, month: "March" }
        [HttpGet("org/timeseries")]
        public async Task<IActionResult> OrgTimeseries([FromQuery] DateTime? from, [FromQuery] DateTime? to)
        {
            var toDt = to ?? DateTime.UtcNow;
            var fromDt = from ?? toDt.AddYears(-1);

            var series = await _creditService.GetAllClientsCreditMonthlySumByNameAsync(fromDt, toDt);

            var chart = series.Select(s => new Investa.Application.DTOs.ChartPointDto
            {
                Name = s.Month,
                Value = s.Amount,
                Uv = s.Amount
            }).ToList();

            return Ok(chart);
        }

        // GET /api/v1/admin/dashboard/{userId}/credits
        // Returns full credit transaction history for a specific client (admin-only)
        [HttpGet("{userId:guid}/credits")]
        public async Task<IActionResult> GetClientCredits(Guid userId)
        {
            var list = await _creditService.GetClientTransactionsAsync(userId);
            return Ok(list);
        }

        // GET /api/v1/admin/dashboard/top-clients
        // Returns top 10 clients by score (admin only)
        [HttpGet("top-clients")]
        public async Task<IActionResult> GetTopClients([FromQuery] int take = 10)
        {
            if (take <= 0) take = 10;
            if (take > 100) take = 100;

            var query = _db.Clients.AsNoTracking()
                        .Include(c => c.User)
                        .Where(c => c.Score > 0 && c.User.UserType != Investa.Domain.Entities.Enums.UserType.OrgUser)
                        .OrderByDescending(c => c.Score)
                        .Take(take)
                        .Select(c => new Investa.Application.DTOs.TopClientDto
                        {
                            Name = (c.FirstName + " " + c.LastName).Trim(),
                            UserId = c.UserId,
                            Score = c.Score
                        });

            var list = await query.ToListAsync();
            return Ok(list);
        }

        // GET /api/v1/admin/dashboard/investments/stats/by-category
        // Returns total invested amount grouped by business category for all investments (admin only)
        [HttpGet("investments/stats/by-category")]
        public async Task<IActionResult> GetInvestmentsGroupedByCategory()
        {
            var query = _db.InvestmentParticipants
                .Join(_db.Investments,
                    ip => ip.InvestmentId,
                    inv => inv.Id,
                    (ip, inv) => new { ip.AmountInvested, inv.BusinessCategoryId })
                .GroupBy(x => x.BusinessCategoryId)
                .Select(g => new
                {
                    CategoryId = g.Key,
                    TotalAmount = g.Sum(x => x.AmountInvested)
                });

            var grouped = await query.AsNoTracking().ToListAsync();

            var categories = await _db.BusinessCategories.AsNoTracking().ToListAsync();

            var result = grouped.Select(g => new
            {
                id = $"INV-{(g.CategoryId.HasValue ? g.CategoryId.Value.ToString() : "0")}",
                total = g.TotalAmount,
                categoryName = g.CategoryId.HasValue ? (categories.FirstOrDefault(c => c.Id == g.CategoryId.Value)?.Value ?? "Uncategorized") : "Uncategorized",
                categoryNameAr = g.CategoryId.HasValue ? (categories.FirstOrDefault(c => c.Id == g.CategoryId.Value)?.ValueAr ?? (categories.FirstOrDefault(c => c.Id == g.CategoryId.Value)?.Value ?? "Uncategorized")) : "Uncategorized"
            }).ToList();

            return Ok(new { success = true, data = result });
        }
    }
}
