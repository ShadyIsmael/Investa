using AutoMapper;
using Investa.Application.DTOs;
using Investa.Application.Interfaces;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Investa.Domain.Entities.Security;

namespace Investa.API.Controllers;

[ApiController]
[Route("api/v1/investments")]
[Authorize(Roles = nameof(UserRoles.Client))]
public class InvestmentsController : ControllerBase
{
    private readonly IInvestmentService _service;
    private readonly IMapper _mapper;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IScoreService _scoreService;

    public InvestmentsController(IInvestmentService service, IMapper mapper, IUnitOfWork unitOfWork, IScoreService scoreService)
    {
        _service = service;
        _mapper = mapper;
        _unitOfWork = unitOfWork;
        _scoreService = scoreService;
    }

    [HttpPost]
    [Authorize(Roles = nameof(UserRoles.Client))]
    public async Task<IActionResult> Create([FromBody] CreateInvestmentDto dto)
    {
        if (dto == null) return BadRequest(new { success = false, message = "Invalid payload" });

        // Extract user id from token and set as FounderId
        var userIdClaim = User.FindFirst("sub")?.Value ?? User.FindFirst("id")?.Value;
        if (!Guid.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized(new { success = false, message = "Unable to identify user from token" });
        }
        dto.FounderId = userId;
        var created = await _service.CreateAsync(dto);
        var outDto = _mapper.Map<InvestmentDto>(created);
        return CreatedAtAction(nameof(Get), new { id = outDto.Id }, new { success = true, data = outDto });
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = nameof(UserRoles.Client))]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateInvestmentDto dto)
    {
        if (dto == null) return BadRequest(new { success = false, message = "Invalid payload" });
        var ok = await _service.UpdateAsync(id, dto);
        if (!ok) return NotFound(new { success = false, message = "Not found" });
        return NoContent();
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> Get(int id)
    {
        var entity = await _service.GetByIdAsync(id);
        if (entity == null) return NotFound(new { success = false, message = "Not found" });
        var outDto = _mapper.Map<InvestmentDto>(entity);

        // Enrich with founder display and credibility score
        await EnrichInvestmentDtoAsync(outDto);
        return Ok(new { success = true, data = outDto });
    }

    [HttpGet("GetByCategory")]
    public async Task<IActionResult> GetByCategory([FromQuery] int? categoryId)
    {
        var entities = await _service.GetByCategoryAsync(categoryId);
        var outDtos = _mapper.Map<IEnumerable<InvestmentDto>>(entities).ToList();

        // Enrich each DTO
        foreach (var dto in outDtos)
        {
            await EnrichInvestmentDtoAsync(dto);
        }
        return Ok(new { success = true, data = outDtos });
    }

    private async Task EnrichInvestmentDtoAsync(InvestmentDto dto)
    {
        if (dto == null) return;

        // Try to find Client record for this user
        var client = (await _unitOfWork.Repository<Investa.Domain.Entities.Client>().FindAsync(c => c.UserId == dto.FounderId)).FirstOrDefault();

        string? founderName = null;
        string? businessRole = null;

        if (client != null)
        {
            founderName = string.Join(' ', new[] { client.FirstName, client.LastName }.Where(s => !string.IsNullOrWhiteSpace(s)));
            businessRole = client.BusinessRole;
        }
        else
        {
            // Fallback to UserProfile
            var user = await _unitOfWork.Repository<Investa.Domain.Entities.User>().GetByIdAsync(dto.FounderId);
            if (user?.Profile != null)
            {
                founderName = string.Join(' ', new[] { user.Profile.FirstName, user.Profile.LastName }.Where(s => !string.IsNullOrWhiteSpace(s)));
            }
            if (string.IsNullOrWhiteSpace(founderName)) founderName = user?.Name;
        }

        dto.BusinessRole = businessRole;
        if (!string.IsNullOrWhiteSpace(founderName) && !string.IsNullOrWhiteSpace(businessRole))
            dto.FounderDisplay = $"{founderName} - {businessRole}";
        else if (!string.IsNullOrWhiteSpace(founderName))
            dto.FounderDisplay = founderName;
        else if (!string.IsNullOrWhiteSpace(businessRole))
            dto.FounderDisplay = businessRole;

        // Populate credibility score (default 0)
        try
        {
            dto.CredibilityScore = await _scoreService.GetCredibilityScoreAsync(dto.FounderId);
        }
        catch
        {
            dto.CredibilityScore = 0;
        }

        // Populate InvestedAmount for the requesting user if available
        var userIdClaim = User.FindFirst("sub")?.Value ?? User.FindFirst("id")?.Value;
        if (Guid.TryParse(userIdClaim, out var userIdGuid))
        {
            var participant = dto.Participants?.FirstOrDefault(p => p.InvestorId == userIdGuid);
            dto.InvestedAmount = participant?.AmountInvested ?? 0m;
        }
        else
        {
            dto.InvestedAmount = null; // No authenticated user context
        }
    }

    // POST /api/v1/investments/{id}/purchase
    // Purchase shares in an investment opportunity
    [HttpPost("{id:int}/purchase")]
    [Authorize(Roles = nameof(UserRoles.Client))]
    public async Task<IActionResult> PurchaseShares(int id, [FromBody] PurchaseSharesDto dto)
    {
        if (dto == null || dto.SharesPurchased <= 0)
            return BadRequest(new { success = false, message = "Invalid shares amount" });

        // Extract user id from token
        var userIdClaim = User.FindFirst("sub")?.Value ?? User.FindFirst("id")?.Value;
        if (!Guid.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized(new { success = false, message = "Unable to identify user from token" });
        }

        try
        {
            var success = await _service.PurchaseSharesAsync(userId, id, dto.SharesPurchased);
            if (success)
            {
                return Ok(new { success = true, message = "Shares purchased successfully" });
            }
            return BadRequest(new { success = false, message = "Purchase failed" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { success = false, message = ex.Message });
        }
    }

    // GET /api/v1/investments/{id}/participants
    // Get all participants/investors for an investment opportunity
    [HttpGet("{id:int}/participants")]
    public async Task<IActionResult> GetParticipants(int id)
    {
        var participants = await _service.GetParticipantsAsync(id);
        var dtos = _mapper.Map<IEnumerable<InvestorParticipationDto>>(participants);
        return Ok(new { success = true, data = dtos });
    }

    // Debug endpoint: returns authenticated user's claims
    [HttpGet("me")]
    public IActionResult Me()
    {
        var claims = User.Claims.Select(c => new { type = c.Type, value = c.Value });
        return Ok(new { success = true, claims });
    }

    // (moved) stats endpoint relocated to DashboardController for org users

    // GET /api/v1/investments/export?userId={userId}
    // Admin-only CSV export of investments. If userId is provided, the CSV will include
    // the specific user's invested amount in the InvestedAmount column.
    [HttpGet("export")]
    [Authorize(Roles = nameof(UserRoles.Admin))]
    public async Task<IActionResult> Export([FromQuery] Guid? userId)
    {
        var entities = await _service.GetByCategoryAsync(null);
        var dtos = _mapper.Map<IEnumerable<InvestmentDto>>(entities).ToList();

        // Enrich each DTO; for export we compute InvestedAmount based on provided userId (if any)
        foreach (var dto in dtos)
        {
            await EnrichInvestmentDtoAsync(dto); // fills founder info and credibility

            if (userId.HasValue)
            {
                var participant = dto.Participants?.FirstOrDefault(p => p.InvestorId == userId.Value);
                dto.InvestedAmount = participant?.AmountInvested ?? 0m;
            }
            else
            {
                // default to total funding
                dto.InvestedAmount = dto.CurrentFunding;
            }
        }

        // Build CSV
        var lines = new List<string>();
        lines.Add("Id,Name,FounderId,FounderDisplay,BusinessRole,TargetFund,CurrentFunding,InvestedAmount,InvestorCount,Status");
        foreach (var d in dtos)
        {
            var nameEsc = d.BusinessName?.Replace("\"", "\"\"") ?? string.Empty;
            var roleEsc = (d.BusinessRole ?? string.Empty).Replace("\"", "\"\"");
            lines.Add($"{d.Id},\"{nameEsc}\",{d.FounderId},\"{(d.FounderDisplay ?? string.Empty).Replace("\"", "\"\"")}\",\"{roleEsc}\",{d.TargetFund},{d.CurrentFunding},{d.InvestedAmount},{d.InvestorCount},\"{d.Status}\"");
        }

        var csv = string.Join("\n", lines);
        var bytes = System.Text.Encoding.UTF8.GetBytes(csv);
        return File(bytes, "text/csv", $"investments_export_{DateTime.UtcNow:yyyyMMdd}.csv");
    }
}