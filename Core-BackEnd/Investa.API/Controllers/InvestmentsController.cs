using AutoMapper;
using Investa.Application.DTOs;
using Investa.Application.Services;
using Investa.Application.Interfaces;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

namespace Investa.API.Controllers;

[ApiController]
[Route("api/v1/investments")]
[Authorize(Roles = "Client")]
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
    [Authorize(Roles = "Client")]
    public async Task<IActionResult> Create([FromBody] CreateInvestmentDto dto)
    {
        if (dto == null) return BadRequest(new { success = false, message = "Invalid payload" });

        // Extract user id from token and set as InvestorId
        var userIdClaim = User.FindFirst("sub")?.Value ?? User.FindFirst("id")?.Value;
        if (!Guid.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized(new { success = false, message = "Unable to identify user from token" });
        }
        dto.InvestorId = userId;
        var created = await _service.CreateAsync(dto);
        var outDto = _mapper.Map<InvestmentDto>(created);
        return CreatedAtAction(nameof(Get), new { id = outDto.Id }, new { success = true, data = outDto });
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = "Client")]
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
        var client = (await _unitOfWork.Repository<Investa.Domain.Entities.Client>().FindAsync(c => c.UserId == dto.InvestorId)).FirstOrDefault();

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
            var user = await _unitOfWork.Repository<Investa.Domain.Entities.User>().GetByIdAsync(dto.InvestorId);
            if (user?.Profile != null)
            {
                founderName = string.Join(' ', new[] { user.Profile.FirstName, user.Profile.LastName }.Where(s => !string.IsNullOrWhiteSpace(s)));
            }
            if (string.IsNullOrWhiteSpace(founderName)) founderName = user?.Name;
        }

        if (!string.IsNullOrWhiteSpace(founderName) && !string.IsNullOrWhiteSpace(businessRole))
            dto.FounderDisplay = $"{founderName} - {businessRole}";
        else if (!string.IsNullOrWhiteSpace(founderName))
            dto.FounderDisplay = founderName;
        else if (!string.IsNullOrWhiteSpace(businessRole))
            dto.FounderDisplay = businessRole;

        // Populate credibility score (default 0)
        try
        {
            dto.CredibilityScore = await _scoreService.GetCredibilityScoreAsync(dto.InvestorId);
        }
        catch
        {
            dto.CredibilityScore = 0;
        }
    }

    // Debug endpoint: returns authenticated user's claims
    [HttpGet("me")]
    public IActionResult Me()
    {
        var claims = User.Claims.Select(c => new { type = c.Type, value = c.Value });
        return Ok(new { success = true, claims });
    }

    // (moved) stats endpoint relocated to DashboardController for org users
}