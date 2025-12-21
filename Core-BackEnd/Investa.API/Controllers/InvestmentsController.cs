using AutoMapper;
using Investa.Application.DTOs;
using Investa.Application.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

namespace Investa.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class InvestmentsController : ControllerBase
{
    private readonly IInvestmentService _investmentService;
    private readonly IMapper _mapper;

    public InvestmentsController(IInvestmentService investmentService, IMapper mapper)
    {
        _investmentService = investmentService;
        _mapper = mapper;
    }

    [HttpPost]
    public async Task<IActionResult> CreateInvestment([FromBody] CreateInvestmentDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var success = await _investmentService.InvestInProjectAsync(dto.InvestorId, dto.ProjectId, dto.Amount);
        if (success)
            return Ok("Investment successful.");
        else
            return BadRequest("Investment failed.");
    }
}