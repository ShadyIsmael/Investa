using Investa.Domain;
using Investa.Domain.Entities;
using Investa.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Investa.Domain.Entities.Enums;

namespace Investa.API.Controllers;

[ApiController]
[Route("api/credit-plans")]
[Route("credit-plans")]
public class CreditPlansController : ControllerBase
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<CreditPlansController> _logger;
    private readonly IWalletService _walletService;

    public CreditPlansController(IUnitOfWork unitOfWork, ILogger<CreditPlansController> logger, IWalletService walletService)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
        _walletService = walletService;
    }

    // ──────────────────────────────────────────────────────────────
    // Public – any authenticated user can fetch active plans
    // ──────────────────────────────────────────────────────────────

    /// <summary>Returns all active credit plans.</summary>
    [HttpGet]
    [Authorize]
    public async Task<IActionResult> GetActivePlans()
    {
        var now = DateTime.UtcNow;
        var plans = await _unitOfWork.Repository<CreditPlan>()
            .FindAsync(p => p.IsActive
                && (!p.ActiveFrom.HasValue || p.ActiveFrom <= now)
                && (!p.ActiveUntil.HasValue || p.ActiveUntil >= now));

        var result = plans
            .OrderBy(p => p.DisplayOrder).ThenBy(p => p.Price)
            .Select(ToPlanDto);

        return Ok(result);
    }

    // ──────────────────────────────────────────────────────────────
    // Admin – full CRUD (add policy if you have admin role/permission)
    // ──────────────────────────────────────────────────────────────

    /// <summary>Returns all plans (including inactive) for admin management.</summary>
    [HttpGet("admin")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetAllPlans()
    {
        var plans = await _unitOfWork.Repository<CreditPlan>()
            .GetAllAsync();

        var result = plans
            .OrderBy(p => p.DisplayOrder).ThenBy(p => p.Price)
            .Select(ToPlanDto);

        return Ok(result);
    }

    public class CreditPlanRequest
    {
        public string Name { get; set; } = string.Empty;
        public string Code { get; set; } = string.Empty;
        public string NameAr { get; set; } = string.Empty;
        public int Credits { get; set; }
        public int BonusCredits { get; set; }
        public decimal Price { get; set; }
        public string Currency { get; set; } = CurrencyMasterDefaults.DefaultCurrency;
        public DateTime? ActiveFrom { get; set; }
        public DateTime? ActiveUntil { get; set; }
        public int DisplayOrder { get; set; }
        public bool IsFeatured { get; set; }
        public string BillingPeriod { get; set; } = "monthly";
        public bool IsActive { get; set; } = true;
    }

    /// <summary>Create a new credit plan.</summary>
    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create([FromBody] CreditPlanRequest req)
    {
        var validation = ValidatePlan(req);
        if (validation is not null) return BadRequest(new { message = validation });
        if (await _unitOfWork.Repository<CreditPlan>().ExistsAsync(p => p.Code == req.Code.Trim()))
            return Conflict(new { message = "Credit package code already exists." });
        var plan = new CreditPlan
        {
            Name = req.Name.Trim(), Code = req.Code.Trim(), NameAr = req.NameAr.Trim(),
            Credits = req.Credits,
            BonusCredits = req.BonusCredits, Price = req.Price, Currency = req.Currency.Trim().ToUpperInvariant(),
            ActiveFrom = req.ActiveFrom, ActiveUntil = req.ActiveUntil,
            DisplayOrder = req.DisplayOrder, IsFeatured = req.IsFeatured,
            BillingPeriod = req.BillingPeriod,
            IsActive = req.IsActive,
        };

        await _unitOfWork.Repository<CreditPlan>().AddAsync(plan);
        await _unitOfWork.SaveChangesAsync();

        return Ok(ToPlanDto(plan));
    }

    /// <summary>Update an existing credit plan.</summary>
    [HttpPut("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(int id, [FromBody] CreditPlanRequest req)
    {
        var plan = await _unitOfWork.Repository<CreditPlan>().GetByIdAsync(id);
        if (plan is null) return NotFound();

        var validation = ValidatePlan(req);
        if (validation is not null) return BadRequest(new { message = validation });
        if (await _unitOfWork.Repository<CreditPlan>().ExistsAsync(p => p.Id != id && p.Code == req.Code.Trim()))
            return Conflict(new { message = "Credit package code already exists." });
        plan.Name = req.Name.Trim();
        plan.Code = req.Code.Trim();
        plan.NameAr = req.NameAr.Trim();
        plan.Credits = req.Credits;
        plan.BonusCredits = req.BonusCredits;
        plan.Price = req.Price;
        plan.Currency = req.Currency.Trim().ToUpperInvariant();
        plan.ActiveFrom = req.ActiveFrom;
        plan.ActiveUntil = req.ActiveUntil;
        plan.DisplayOrder = req.DisplayOrder;
        plan.IsFeatured = req.IsFeatured;
        plan.BillingPeriod = req.BillingPeriod;
        plan.IsActive = req.IsActive;
        plan.UpdatedAt = DateTime.UtcNow;

        await _unitOfWork.Repository<CreditPlan>().UpdateAsync(plan);
        await _unitOfWork.SaveChangesAsync();

        return Ok(ToPlanDto(plan));
    }

    /// <summary>Delete a credit plan.</summary>
    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var plan = await _unitOfWork.Repository<CreditPlan>().GetByIdAsync(id);
        if (plan is null) return NotFound();

        // Completed orders retain a FK and immutable snapshot. Deactivation is the
        // only safe removal operation for a package that may have purchase history.
        plan.IsActive = false;
        plan.UpdatedAt = DateTime.UtcNow;
        await _unitOfWork.Repository<CreditPlan>().UpdateAsync(plan);
        await _unitOfWork.SaveChangesAsync();

        return NoContent();
    }

    // ──────────────────────────────────────────────────────────────
    // Purchase – client buys a plan, credits added, record saved
    // ──────────────────────────────────────────────────────────────

    /// <summary>
    /// Purchase a credit plan. Adds plan credits to the platform CREDIT wallet
    /// and persists a CreditPlanPurchase record with a unique reference number.
    /// </summary>
    [HttpPost("{id:int}/orders")]
    [Authorize]
    public async Task<IActionResult> CreateOrder(int id)
    {
        // Resolve caller identity
        var userIdStr = User.FindFirst("sub")?.Value ?? User.FindFirst("id")?.Value
                        ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (!Guid.TryParse(userIdStr, out var userId))
            return Unauthorized(new { message = "Unable to identify caller." });

        // Load plan
        var plan = await _unitOfWork.Repository<CreditPlan>().GetByIdAsync(id);
        var now = DateTime.UtcNow;
        if (plan is null || !plan.IsActive || (plan.ActiveFrom.HasValue && plan.ActiveFrom > now)
            || (plan.ActiveUntil.HasValue && plan.ActiveUntil < now))
            return NotFound(new { message = "Credit plan not found or inactive." });

        // Load user
        var user = await _unitOfWork.Repository<AuthUser>().GetByIdAsync(userId);
        if (user is null)
            return NotFound(new { message = "User not found." });

        var reference = $"CR-{DateTime.UtcNow:yyyyMMddHHmmss}-{Guid.NewGuid():N}"[..49].ToUpperInvariant();

        // Create purchase record
        var purchase = new CreditPlanPurchase
        {
            UserId        = userId,
            PlanId        = plan.Id,
            PlanName      = plan.Name,
            PlanCode      = plan.Code,
            PlanNameAr    = plan.NameAr,
            Credits       = plan.Credits,
            BonusCredits  = plan.BonusCredits,
            PricePaid     = plan.Price,
            Currency      = plan.Currency,
            ReferenceNumber = reference,
            PaymentStatus = CreditPurchaseStatus.Pending,
            CreatedAt     = now,
            PurchasedAt   = now,
        };

        await _unitOfWork.Repository<CreditPlanPurchase>().AddAsync(purchase);

        await _unitOfWork.SaveChangesAsync();
        _logger.LogInformation("Credit purchase order {Reference} created for UserId={UserId}; awaiting verified payment", reference, userId);
        return StatusCode(StatusCodes.Status201Created, new
        {
            order = ToOrderDto(purchase),
            providerConfigured = false,
            redirectUrl = (string?)null,
            message = "Payment provider is not configured; no Credits have been added."
        });
    }

    [HttpPost("{id:int}/purchase")]
    [Authorize]
    public IActionResult LegacyPurchaseDisabled(int id) => StatusCode(StatusCodes.Status410Gone, new
    {
        message = "Direct purchase is disabled. Create a payment order; Credits are issued only after verified payment."
    });

    [HttpGet("orders")]
    [Authorize]
    public async Task<IActionResult> GetMyOrders()
    {
        if (!TryGetUserId(out var userId)) return Unauthorized();
        var rows = await _unitOfWork.Repository<CreditPlanPurchase>().FindAsync(p => p.UserId == userId);
        return Ok(rows.OrderByDescending(p => p.CreatedAt).Select(ToOrderDto));
    }

    [HttpGet("orders/{orderId:int}")]
    [Authorize]
    public async Task<IActionResult> GetMyOrder(int orderId)
    {
        if (!TryGetUserId(out var userId)) return Unauthorized();
        var order = (await _unitOfWork.Repository<CreditPlanPurchase>()
            .FindAsync(p => p.Id == orderId && p.UserId == userId)).SingleOrDefault();
        return order is null ? NotFound() : Ok(ToOrderDto(order));
    }

    [HttpGet("admin/orders")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetAllOrders()
    {
        var rows = await _unitOfWork.Repository<CreditPlanPurchase>().GetAllAsync();
        return Ok(rows.OrderByDescending(p => p.CreatedAt).Select(p => new { p.UserId, order = ToOrderDto(p) }));
    }

    // ──────────────────────────────────────────────────────────────
    // Admin stats – purchase counts per plan (for dashboard chart)
    // ──────────────────────────────────────────────────────────────

    /// <summary>Returns purchase counts grouped by plan name, ordered by count desc.</summary>
    [HttpGet("purchases/stats")]
    [Authorize(Roles = "Admin")]
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

    private bool TryGetUserId(out Guid userId)
    {
        var value = User.FindFirst("sub")?.Value ?? User.FindFirst("id")?.Value
            ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return Guid.TryParse(value, out userId);
    }

    private static string? ValidatePlan(CreditPlanRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.Code) || string.IsNullOrWhiteSpace(req.Name) || string.IsNullOrWhiteSpace(req.NameAr))
            return "Code and EN/AR names are required.";
        if (req.Credits <= 0 || req.BonusCredits < 0 || req.Price <= 0) return "Credits and price must be positive.";
        if (req.Currency.Trim().Length != 3) return "Currency must be an ISO 4217 three-letter code.";
        if (req.ActiveFrom.HasValue && req.ActiveUntil.HasValue && req.ActiveUntil <= req.ActiveFrom)
            return "ActiveUntil must be later than ActiveFrom.";
        return null;
    }

    private static object ToPlanDto(CreditPlan p) => new
    {
        p.Id, p.Code, p.Name, p.NameAr, p.Credits, p.BonusCredits, p.Price, p.Currency,
        p.ActiveFrom, p.ActiveUntil, p.DisplayOrder, p.IsFeatured, p.BillingPeriod,
        p.IsActive, p.CreatedAt, p.UpdatedAt
    };

    private static object ToOrderDto(CreditPlanPurchase p) => new
    {
        p.Id, p.ReferenceNumber, p.PlanId, p.PlanCode, p.PlanName, p.PlanNameAr,
        p.Credits, p.BonusCredits, p.PricePaid, p.Currency,
        paymentStatus = p.PaymentStatus.ToString(), p.PaymentProvider, p.ProviderReference,
        p.CreatedAt, p.UpdatedAt, p.PaidAt, p.WalletTransactionId
    };
}
