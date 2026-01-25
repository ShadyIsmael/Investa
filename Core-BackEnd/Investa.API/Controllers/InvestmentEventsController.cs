using Microsoft.AspNetCore.Mvc;
using Investa.Application.Interfaces;
using Investa.Application.DTOs.Investments;
using System.Threading.Tasks;

namespace Investa.API.Controllers;

[ApiController]
[Route("api/investments/{investmentId:int}/events")]
public class InvestmentEventsController : ControllerBase
{
    private readonly IInvestmentEventService _service;

    public InvestmentEventsController(IInvestmentEventService service)
    {
        _service = service;
    }

    [HttpPost]
    public async Task<IActionResult> AppendEvent(int investmentId, [FromBody] CreateInvestmentEventDto dto)
    {
        var created = await _service.AppendEventAsync(investmentId, dto);
        return CreatedAtAction(nameof(GetByInvestment), new { investmentId }, created);
    }

    [HttpGet]
    public async Task<IActionResult> GetByInvestment(int investmentId)
    {
        var list = await _service.GetByInvestmentAsync(investmentId);
        return Ok(list);
    }
}