using Investa.Application.DTOs;
using Investa.Application.Interfaces;
using Investa.Application.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

namespace Investa.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DashboardController : ControllerBase
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IScoreService _scoreService;

    public DashboardController(IUnitOfWork unitOfWork, IScoreService scoreService)
    {
        _unitOfWork = unitOfWork;
        _scoreService = scoreService;
    }

    [HttpGet("summary")]
    public async Task<ActionResult<DashboardSummaryDto>> GetSummary(int userId)
    {
        var user = await _unitOfWork.Repository<Domain.Entities.User>().GetByIdAsync(userId);
        if (user == null)
            return NotFound("User not found.");

        var score = await _scoreService.GetCredibilityScoreAsync(userId);

        // Get top 5 investment categories
        var investments = await _unitOfWork.Repository<Domain.Entities.Investment>().FindAsync(i => i.InvestorId == userId);
        var categories = investments
            .GroupBy(i => i.Project.Category)
            .OrderByDescending(g => g.Sum(i => i.Amount))
            .Take(5)
            .Select(g => g.Key)
            .ToList();

        var summary = new DashboardSummaryDto
        {
            CredibilityScore = score,
            WalletBalance = user.WalletBalance,
            TopInvestmentCategories = categories
        };

        return Ok(summary);
    }
}