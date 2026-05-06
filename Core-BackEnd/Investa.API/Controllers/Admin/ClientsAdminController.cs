using System.Threading.Tasks;
using Investa.Application.DTOs;
using Investa.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Investa.Domain.Entities.Security;

namespace Investa.API.Controllers.Admin
{
    [ApiController]
    [Route("api/v1/admin/clients")]
    [Authorize(Roles = "Admin")]
    public class ClientsAdminController : ControllerBase
    {
        private readonly IClientService _clientService;

        public ClientsAdminController(IClientService clientService)
        {
            _clientService = clientService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] int page = 1, [FromQuery] int pageSize = 20, [FromQuery] string? search = null)
        {
            if (page <= 0) page = 1;
            if (pageSize <= 0 || pageSize > 200) pageSize = 20;

            var (total, items) = await _clientService.GetClientsForAdminAsync(page, pageSize, search);

            var projected = items.Select(i => new {
                Id = i.Id,
                UserId = i.UserId,
                FullName = string.Join(" ", new[] { i.FirstName, i.LastName }.Where(s => !string.IsNullOrWhiteSpace(s))),
                Score = i.Score,
                Credit = i.Credit,
                RegisteredDate = i.CreatedAt,
                AccountStatus = i.StatusName ?? i.StatusNameEn ?? i.StatusNameAr
            }).ToList();

            return Ok(new { total, page, pageSize, items = projected });
        }

        /// <summary>
        /// Returns the top clients ordered by score (descending). Admin-only.
        /// </summary>
        [HttpGet("top")]
        public async Task<IActionResult> GetTop([FromQuery] int limit = 100)
        {
            if (limit <= 0 || limit > 1000) limit = 100; // protect against excessive values

            var items = await _clientService.GetTopClientsByScoreAsync(limit);

            var projected = items.Select(i => new {
                Id = i.Id,
                UserId = i.UserId,
                FullName = string.Join(" ", new[] { i.FirstName, i.LastName }.Where(s => !string.IsNullOrWhiteSpace(s))),
                Score = i.Score,
                Credit = i.Credit,
                RegisteredDate = i.CreatedAt,
                AccountStatus = i.StatusName ?? i.StatusNameEn ?? i.StatusNameAr
            }).ToList();

            return Ok(projected);
        }

        /// <summary>
        /// Change client status (admin only). Records historical entry with a reason.
        /// </summary>
        [HttpPost("{id:int}/status")]
        public async Task<IActionResult> ChangeStatus([FromRoute] int id, [FromBody] Investa.Application.DTOs.ChangeClientStatusRequest request)
        {
            if (request == null) return BadRequest();

            // get admin id from token
            var adminIdStr = User.FindFirst("id")?.Value ?? User.FindFirst("sub")?.Value;
            if (string.IsNullOrWhiteSpace(adminIdStr) || !System.Guid.TryParse(adminIdStr, out var adminGuid))
            {
                return Forbid();
            }

            var result = await _clientService.ChangeClientStatusAsync(id, request.NewStatusId, request.Reason ?? string.Empty, adminGuid);
            if (result == null) return NotFound(new { message = "Client or status not found" });

            var projected = new {
                Id = result.Id,
                UserId = result.UserId,
                FullName = string.Join(" ", new[] { result.FirstName, result.LastName }.Where(s => !string.IsNullOrWhiteSpace(s))),
                Score = result.Score,
                Credit = result.Credit,
                RegisteredDate = result.CreatedAt,
                AccountStatus = result.StatusName ?? result.StatusNameEn ?? result.StatusNameAr
            };

            return Ok(projected);
        }
    }
}
