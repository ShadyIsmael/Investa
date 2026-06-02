using System.Threading.Tasks;
using Investa.Application.DTOs;
using Investa.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Investa.Domain.Entities.Security;
using Investa.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Investa.API.Controllers.Admin
{
    [ApiController]
    [Route("api/v1/admin/clients")]
    [Route("api/admin/clients")]
    [Authorize(Roles = "Admin")]
    public class ClientsAdminController : ControllerBase
    {
        private readonly IClientService _clientService;
        private readonly ApplicationDbContext _context;

        public ClientsAdminController(IClientService clientService, ApplicationDbContext context)
        {
            _clientService = clientService;
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] int page = 1, [FromQuery] int pageSize = 20, [FromQuery] string? search = null)
        {
            if (page <= 0) page = 1;
            if (pageSize <= 0 || pageSize > 200) pageSize = 20;

            var (total, items) = await _clientService.GetClientsForAdminAsync(page, pageSize, search);
            var userIds = items
                .Select(i => i.UserId)
                .Where(userId => userId != Guid.Empty)
                .Distinct()
                .Select(id => id.ToString())
                .ToList();

            var tokenCounts = userIds.Count == 0
                ? new Dictionary<string, int>()
                : _context.UserTokens
                    .Where(token => token.IsActive)
                    .AsEnumerable()
                    .Where(token => userIds.Contains(token.UserId))
                    .GroupBy(token => token.UserId)
                    .ToDictionary(group => group.Key, group => group.Count());

            var projected = items.Select(i => {
                var userIdString = i.UserId != Guid.Empty ? i.UserId.ToString() : string.Empty;
                return new {
                    Id = i.Id,
                    UserId = userIdString,
                    FullName = string.Join(" ", new[] { i.FirstName, i.LastName }.Where(s => !string.IsNullOrWhiteSpace(s))),
                    Score = i.Score,
                    Credit = i.Credit,
                    RegisteredDate = i.CreatedAt,
                    AccountStatus = i.StatusName ?? i.StatusNameEn ?? i.StatusNameAr,
                    HasActiveNotificationToken = !string.IsNullOrWhiteSpace(userIdString) && tokenCounts.ContainsKey(userIdString),
                    ActiveNotificationTokens = !string.IsNullOrWhiteSpace(userIdString) && tokenCounts.TryGetValue(userIdString, out var count) ? count : 0
                };
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
            var userIds = items
                .Select(i => i.UserId)
                .Where(userId => userId != Guid.Empty)
                .Distinct()
                .Select(id => id.ToString())
                .ToList();

            var tokenCounts = userIds.Count == 0
                ? new Dictionary<string, int>()
                : _context.UserTokens
                    .Where(token => token.IsActive)
                    .AsEnumerable()
                    .Where(token => userIds.Contains(token.UserId))
                    .GroupBy(token => token.UserId)
                    .ToDictionary(group => group.Key, group => group.Count());

            var projected = items.Select(i => {
                var userIdString = i.UserId != Guid.Empty ? i.UserId.ToString() : string.Empty;
                return new {
                    Id = i.Id,
                    UserId = userIdString,
                    FullName = string.Join(" ", new[] { i.FirstName, i.LastName }.Where(s => !string.IsNullOrWhiteSpace(s))),
                    Score = i.Score,
                    Credit = i.Credit,
                    RegisteredDate = i.CreatedAt,
                    AccountStatus = i.StatusName ?? i.StatusNameEn ?? i.StatusNameAr,
                    HasActiveNotificationToken = !string.IsNullOrWhiteSpace(userIdString) && tokenCounts.ContainsKey(userIdString),
                    ActiveNotificationTokens = !string.IsNullOrWhiteSpace(userIdString) && tokenCounts.TryGetValue(userIdString, out var count) ? count : 0
                };
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
