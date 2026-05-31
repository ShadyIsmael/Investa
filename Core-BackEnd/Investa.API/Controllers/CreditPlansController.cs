using Investa.Domain.Entities;
using Investa.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Investa.API.Controllers;

[ApiController]
[Route("api/credit-plans")]
[Route("credit-plans")]
public class CreditPlansController : ControllerBase
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<CreditPlansController> _logger;

    public CreditPlansController(IUnitOfWork unitOfWork, ILogger<CreditPlansController> logger)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    // ──────────────────────────────────────────────────────────────
    // Public – any authenticated user can fetch active plans
    // ──────────────────────────────────────────────────────────────

    /// <summary>Returns all active credit plans.</summary>
    [HttpGet]
    [Authorize]
    public async Task<IActionResult> GetActivePlans()
    {
        var plans = await _unitOfWork.Repository<CreditPlan>()
            .FindAsync(p => p.IsActive);

        var result = plans
            .OrderBy(p => p.Price)
            .Select(p => new
            {
                p.Id,
                p.Name,
                p.Credits,
                p.Price,
                p.BillingPeriod,
                p.IsActive,
                p.CreatedAt,
                p.UpdatedAt,
            });

        return Ok(result);
    }

    // ──────────────────────────────────────────────────────────────
    // Admin – full CRUD (add policy if you have admin role/permission)
    // ──────────────────────────────────────────────────────────────

    /// <summary>Returns all plans (including inactive) for admin management.</summary>
    [HttpGet("admin")]
    [Authorize]
    public async Task<IActionResult> GetAllPlans()
    {
        var plans = await _unitOfWork.Repository<CreditPlan>()
            .GetAllAsync();

        var result = plans
            .OrderBy(p => p.Price)
            .Select(p => new
            {
                p.Id,
                p.Name,
                p.Credits,
                p.Price,
                p.BillingPeriod,
                p.IsActive,
                p.CreatedAt,
                p.UpdatedAt,
            });

        return Ok(result);
    }

    public class CreditPlanRequest
    {
        public string Name { get; set; } = string.Empty;
        public int Credits { get; set; }
        public decimal Price { get; set; }
        public string BillingPeriod { get; set; } = "monthly";
        public bool IsActive { get; set; } = true;
    }

    /// <summary>Create a new credit plan.</summary>
    [HttpPost]
    [Authorize]
    public async Task<IActionResult> Create([FromBody] CreditPlanRequest req)
    {
        var plan = new CreditPlan
        {
            Name = req.Name,
            Credits = req.Credits,
            Price = req.Price,
            BillingPeriod = req.BillingPeriod,
            IsActive = req.IsActive,
        };

        await _unitOfWork.Repository<CreditPlan>().AddAsync(plan);
        await _unitOfWork.SaveChangesAsync();

        return Ok(new { plan.Id, plan.Name, plan.Credits, plan.Price, plan.BillingPeriod, plan.IsActive });
    }

    /// <summary>Update an existing credit plan.</summary>
    [HttpPut("{id:int}")]
    [Authorize]
    public async Task<IActionResult> Update(int id, [FromBody] CreditPlanRequest req)
    {
        var plan = await _unitOfWork.Repository<CreditPlan>().GetByIdAsync(id);
        if (plan is null) return NotFound();

        plan.Name = req.Name;
        plan.Credits = req.Credits;
        plan.Price = req.Price;
        plan.BillingPeriod = req.BillingPeriod;
        plan.IsActive = req.IsActive;
        plan.UpdatedAt = DateTime.UtcNow;

        await _unitOfWork.Repository<CreditPlan>().UpdateAsync(plan);
        await _unitOfWork.SaveChangesAsync();

        return Ok(new { plan.Id, plan.Name, plan.Credits, plan.Price, plan.BillingPeriod, plan.IsActive });
    }

    /// <summary>Delete a credit plan.</summary>
    [HttpDelete("{id:int}")]
    [Authorize]
    public async Task<IActionResult> Delete(int id)
    {
        var plan = await _unitOfWork.Repository<CreditPlan>().GetByIdAsync(id);
        if (plan is null) return NotFound();

        await _unitOfWork.Repository<CreditPlan>().DeleteAsync(plan);
        await _unitOfWork.SaveChangesAsync();

        return NoContent();
    }

    // ──────────────────────────────────────────────────────────────
    // Purchase – client buys a plan, credits added, record saved
    // ──────────────────────────────────────────────────────────────

    /// <summary>
    /// Purchase a credit plan. Adds plan credits to the buyer's WalletBalance
    /// and persists a CreditPlanPurchase record with a unique reference number.
    /// </summary>
    [HttpPost("{id:int}/purchase")]
    [Authorize]
    public async Task<IActionResult> Purchase(int id)
    {
        // Resolve caller identity
        var userIdStr = User.FindFirst("sub")?.Value ?? User.FindFirst("id")?.Value
                        ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (!Guid.TryParse(userIdStr, out var userId))
            return Unauthorized(new { message = "Unable to identify caller." });

        // Load plan
        var plan = await _unitOfWork.Repository<CreditPlan>().GetByIdAsync(id);
        if (plan is null || !plan.IsActive)
            return NotFound(new { message = "Credit plan not found or inactive." });

        // Load user
        var user = await _unitOfWork.Repository<AuthUser>().GetByIdAsync(userId);
        if (user is null)
            return NotFound(new { message = "User not found." });

        // Build reference: yyyyMMdd-{first 8 chars of userId}
        var reference = $"{DateTime.UtcNow:yyyyMMdd}-{userId.ToString("N")[..8].ToUpper()}";

        // Create purchase record
        var purchase = new CreditPlanPurchase
        {
            UserId        = userId,
            PlanId        = plan.Id,
            PlanName      = plan.Name,
            Credits       = plan.Credits,
            PricePaid     = plan.Price,
            ReferenceNumber = reference,
            PurchasedAt   = DateTime.UtcNow,
        };

        await _unitOfWork.Repository<CreditPlanPurchase>().AddAsync(purchase);

        // Increase wallet balance
        user.WalletBalance += plan.Credits;
        await _unitOfWork.Repository<AuthUser>().UpdateAsync(user);

        await _unitOfWork.SaveChangesAsync();

        _logger.LogInformation("User {UserId} purchased plan '{PlanName}' (ref {Ref})", userId, plan.Name, reference);

        return Ok(new
        {
            referenceNumber = reference,
            planName        = plan.Name,
            creditsAdded    = plan.Credits,
            newBalance      = user.WalletBalance,
        });
    }

    // ──────────────────────────────────────────────────────────────
    // Admin stats – purchase counts per plan (for dashboard chart)
    // ──────────────────────────────────────────────────────────────

    /// <summary>Returns purchase counts grouped by plan name, ordered by count desc.</summary>
    [HttpGet("purchases/stats")]
    [Authorize]
    public async Task<IActionResult> GetPurchaseStats()
    {
        var purchases = await _unitOfWork.Repository<CreditPlanPurchase>().GetAllAsync();

        var stats = purchases
            .GroupBy(p => p.PlanName)
            .Select(g => new
            {
                name   = g.Key,
                value  = g.Count(),
                credits = g.First().Credits,
            })
            .OrderByDescending(x => x.value)
            .ToList();

        return Ok(stats);
    }
}
