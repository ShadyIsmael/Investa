using System;
using System.Linq;
using System.Threading.Tasks;
using Investa.Application.DTOs;
using Investa.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Investa.Domain.Entities.Security;

namespace Investa.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ClientsController : ControllerBase
    {
        private readonly ApplicationDbContext _db;

        public ClientsController(ApplicationDbContext db)
        {
            _db = db;
        }

        [HttpGet("{userId:guid}")]
        public async Task<IActionResult> GetByUserId(Guid userId)
        {
            var client = await _db.Clients.AsNoTracking().FirstOrDefaultAsync(c => c.UserId == userId);
            if (client == null)
                return NotFound(new { message = "Client not found" });

            var dto = MapToDto(client);
            return Ok(dto);
        }

        [HttpGet("by-phone/{phone}")]
        public async Task<IActionResult> GetByPhone(string phone)
        {
            if (string.IsNullOrWhiteSpace(phone))
                return BadRequest(new { message = "Phone is required" });

            var client = await _db.Clients.AsNoTracking()
                .FirstOrDefaultAsync(c => c.MobileNumber == phone || c.Phone == phone);

            if (client == null)
                return NotFound(new { message = "Client not found" });

            var dto = MapToDto(client);
            return Ok(dto);
        }

        [HttpPost("by-phone/{phone}")]
        public async Task<IActionResult> CreateByPhone(string phone, [FromBody] ClientProfileDto model)
        {
            if (string.IsNullOrWhiteSpace(phone))
                return BadRequest(new { message = "Phone is required" });

            // find identity user by phone (UserName or PhoneNumber)
            var identityUser = await _db.Users.FirstOrDefaultAsync(u => u.UserName == phone || u.PhoneNumber == phone);
            if (identityUser == null)
                return NotFound(new { message = "Identity user not found for provided phone" });

            if (!Guid.TryParse(identityUser.Id, out var userGuid))
                return BadRequest(new { message = "Identity user id is not a valid GUID" });

            var existing = await _db.Clients.FirstOrDefaultAsync(c => c.UserId == userGuid);
            if (existing != null)
                return Conflict(new { message = "Client profile already exists for this user" });

            var entity = MapFromDto(model);
            entity.UserId = userGuid;
            entity.MobileNumber = entity.MobileNumber ?? phone;

            _db.Clients.Add(entity);
            await _db.SaveChangesAsync();

            var dto = MapToDto(entity);
            return CreatedAtAction(nameof(GetByUserId), new { userId = entity.UserId }, dto);
        }

        [HttpPut("{userId:guid}")]
        public async Task<IActionResult> UpdateByUserId(Guid userId, [FromBody] ClientProfileDto model)
        {
            var client = await _db.Clients.FirstOrDefaultAsync(c => c.UserId == userId);
            if (client == null)
                return NotFound(new { message = "Client not found" });

            // map updatable fields
            client.FirstName = model.FirstName;
            client.LastName = model.LastName;
            client.Gender = model.Gender;
            client.PersonalImageUrl = model.PersonalImageUrl;
            client.MobileNumber = model.MobileNumber ?? client.MobileNumber;
            client.Phone = model.Phone ?? client.Phone;
            client.Email = model.Email ?? client.Email;
            client.Country = model.Country;
            client.City = model.City;
            client.District = model.District;
            client.Address1 = model.Address1;
            client.Address2 = model.Address2;
            client.NationalId = model.NationalId;
            client.NationalIdImageUrl = model.NationalIdImageUrl;
            client.BirthDate = model.BirthDate;
            client.Age = model.Age;
            client.WebsiteUrl = model.WebsiteUrl;
            client.LinkedInUrl = model.LinkedInUrl;
            client.FacebookUrl = model.FacebookUrl;
            client.BusinessRole = model.BusinessTitle ?? client.BusinessRole;
            client.Score = model.Score;
            client.Credit = model.Credit;
            client.UpdatedAt = DateTime.UtcNow;

            await _db.SaveChangesAsync();

            return Ok(MapToDto(client));
        }

        /// <summary>
        /// Disable client account (Admin only)
        /// </summary>
        [HttpPost("{userId:guid}/disable")]
        [Authorize(Roles = nameof(UserRoles.OrgUser))]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> DisableUser(Guid userId)
        {
            var authUser = await _db.AuthUsers.FirstOrDefaultAsync(a => a.Id == userId);
            if (authUser == null)
                return NotFound(new { message = "User not found" });

            authUser.Status = false;
            await _db.SaveChangesAsync();
            return Ok(new { success = true });
        }

        /// <summary>
        /// Suspend client account until a specified date (Admin only)
        /// </summary>
        public class SuspendRequestDto { public DateTime? Until { get; set; } }

        [HttpPost("{userId:guid}/suspend")]
        [Authorize(Roles = nameof(UserRoles.OrgUser))]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> SuspendUser(Guid userId, [FromBody] SuspendRequestDto request)
        {
            var authUser = await _db.AuthUsers.FirstOrDefaultAsync(a => a.Id == userId);
            if (authUser == null)
                return NotFound(new { message = "User not found" });

            authUser.SuspendedUntil = request.Until ?? DateTime.UtcNow.AddDays(1);
            await _db.SaveChangesAsync();

            return Ok(new { success = true, suspendedUntil = authUser.SuspendedUntil });
        }

        private static ClientProfileDto MapToDto(Investa.Domain.Entities.Client c)
        {
            return new ClientProfileDto
            {
                Id = c.Id,
                UserId = c.UserId,
                FirstName = c.FirstName,
                LastName = c.LastName,
                Gender = c.Gender,
                PersonalImageUrl = c.PersonalImageUrl,
                MobileNumber = c.MobileNumber,
                FirebaseUid = c.FirebaseUid,
                Phone = c.Phone,
                Email = c.Email,
                Country = c.Country,
                City = c.City,
                District = c.District,
                Address1 = c.Address1,
                Address2 = c.Address2,
                NationalId = c.NationalId,
                NationalIdImageUrl = c.NationalIdImageUrl,
                BirthDate = c.BirthDate,
                Age = c.Age,
                WebsiteUrl = c.WebsiteUrl,
                LinkedInUrl = c.LinkedInUrl,
                FacebookUrl = c.FacebookUrl,
                BusinessTitle = c.BusinessRole,
                CategoryIds = c.ClientBusinessCategories.Select(x => x.BusinessCategoryId).ToArray(),
                Score = c.Score,
                Credit = c.Credit,
                CreatedAt = c.CreatedAt,
                UpdatedAt = c.UpdatedAt,
                StatusId = c.StatusId,
                StatusName = c.Status != null ? c.Status.NameEn : null,
                PenaltyDurationDays = c.PenaltyDurationDays
            };
        }

        private static Investa.Domain.Entities.Client MapFromDto(ClientProfileDto c)
        {
            return new Investa.Domain.Entities.Client
            {
                FirstName = c.FirstName,
                LastName = c.LastName,
                Gender = c.Gender,
                PersonalImageUrl = c.PersonalImageUrl,
                MobileNumber = c.MobileNumber,
                FirebaseUid = c.FirebaseUid,
                Phone = c.Phone,
                Email = c.Email,
                Country = c.Country,
                City = c.City,
                District = c.District,
                Address1 = c.Address1,
                Address2 = c.Address2,
                NationalId = c.NationalId,
                NationalIdImageUrl = c.NationalIdImageUrl,
                BirthDate = c.BirthDate,
                Age = c.Age,
                WebsiteUrl = c.WebsiteUrl,
                LinkedInUrl = c.LinkedInUrl,
                FacebookUrl = c.FacebookUrl,
                BusinessRole = c.BusinessTitle,
                Score = c.Score,
                Credit = c.Credit,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                StatusId = c.StatusId,
                PenaltyDurationDays = c.PenaltyDurationDays,
                ClientBusinessCategories = c.CategoryIds != null ? new System.Collections.Generic.List<Investa.Domain.Entities.ClientBusinessCategory>(c.CategoryIds.Select(id => new Investa.Domain.Entities.ClientBusinessCategory { BusinessCategoryId = id })) : new System.Collections.Generic.List<Investa.Domain.Entities.ClientBusinessCategory>()
            };
        }
    }
}
