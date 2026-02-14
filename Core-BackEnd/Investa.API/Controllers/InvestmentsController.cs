using AutoMapper;
using Investa.Application.DTOs;
using Investa.Application.Interfaces;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Investa.Domain.Entities.Security;
using Investa.Domain.Entities;
using Investa.API.Controllers.Dtos;
using Microsoft.Extensions.Localization;
using Investa.API.Resources;

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
    private readonly INotificationService _notificationService;
    private readonly IStringLocalizer<SharedResource> _localizer;

    public InvestmentsController(IInvestmentService service, IMapper mapper, IUnitOfWork unitOfWork, IScoreService scoreService, INotificationService notificationService, IStringLocalizer<SharedResource> localizer)
    {
        _service = service;
        _mapper = mapper;
        _unitOfWork = unitOfWork;
        _scoreService = scoreService;
        _notificationService = notificationService;
        _localizer = localizer;
    }

    [HttpPost]
    [Authorize(Roles = nameof(UserRoles.Client))]
    public async Task<IActionResult> Create([FromBody] CreateInvestmentDto dto)
    {
        if (dto == null) return BadRequest(new { success = false, message = _localizer["InvalidPayload"].Value });

        // Extract user id from token and set as FounderId
        var userIdClaim = User.FindFirst("sub")?.Value ?? User.FindFirst("id")?.Value;
        if (!Guid.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized(new { success = false, message = _localizer["UnableToIdentifyUserFromToken"].Value });
        }
        dto.FounderId = userId;
        var created = await _service.CreateAsync(dto);
        var outDto = _mapper.Map<InvestmentDto>(created);

        // Notify the founder's devices about the newly created investment so mobile apps can mirror it
        try
        {
            var data = new Dictionary<string, string>
            {
                { "investmentId", outDto.Id.ToString() },
                { "founderId", outDto.FounderId.ToString() },
                { "businessName", outDto.BusinessName ?? string.Empty },
                { "targetFund", outDto.TargetFund?.ToString() ?? string.Empty },
                { "type", "investment_created" },
                { "action", "created" }
            };

            // Fire-and-forget; we don't want notification failures to block the API response
            _ = _notificationService.SendNotificationAsync(outDto.FounderId.ToString(), "New Investment Published", $"{outDto.BusinessName} is now live", data);
        }
        catch
        {
            // Swallow any notification errors - logging handled inside NotificationService
        }

        return CreatedAtAction(nameof(Get), new { id = outDto.Id }, new { success = true, data = outDto });
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = nameof(UserRoles.Client))]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateInvestmentDto dto)
    {
        if (dto == null) return BadRequest(new { success = false, message = _localizer["InvalidPayload"].Value });
        var ok = await _service.UpdateAsync(id, dto);
        if (!ok) return NotFound(new { success = false, message = "Not found" });
        return NoContent();
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> Get(int id)
    {
        var entity = await _service.GetByIdAsync(id);
        if (entity == null) return NotFound(new { success = false, message = _localizer["InvestmentNotFound"].Value });
        var outDto = _mapper.Map<InvestmentDto>(entity);

        // Enrich with founder display and credibility score
        await EnrichInvestmentDtoAsync(outDto);
        return Ok(new { success = true, data = outDto });
    }

    [HttpGet("GetByCategory")]
    [AllowAnonymous]
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

    /// <summary>
    /// Gets all investments created by the authenticated founder.
    /// User ID is extracted from the JWT token.
    /// </summary>
    [HttpGet("GetMyInvestments")]
    [Authorize(Roles = nameof(UserRoles.Client))]
    public async Task<IActionResult> GetMyInvestments()
    {
        // Extract user id from token
        var userIdClaim = User.FindFirst("sub")?.Value ?? User.FindFirst("id")?.Value;
        if (!Guid.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized(new { success = false, message = "Unable to identify user from token" });
        }

        var entities = await _service.GetMyInvestmentsAsync(userId);
        var outDtos = _mapper.Map<IEnumerable<InvestmentDto>>(entities).ToList();

        // Enrich each DTO
        foreach (var dto in outDtos)
        {
            await EnrichInvestmentDtoAsync(dto);
        }
        return Ok(new { success = true, data = outDtos });
    }

    /// <summary>
    /// Upload an image for an investment (multipart form file). Only founder or OrgUser (admin) can upload.
    /// </summary>
    [HttpPost("{investmentId:int}/images")]
    [Authorize]
    public async Task<IActionResult> UploadImage(int investmentId)
    {
        var userIdClaim = User.FindFirst("sub")?.Value ?? User.FindFirst("id")?.Value;
        if (!Guid.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized(new { success = false, message = "Unable to identify user from token" });
        }

        var investment = await _service.GetByIdAsync(investmentId);
        if (investment == null) return NotFound(new { success = false, message = "Investment not found" });

        // Allow if founder or OrgUser role
        if (investment.FounderId != userId && !User.IsInRole(nameof(UserRoles.OrgUser)))
        {
            return Forbid();
        }

        if (!Request.HasFormContentType || !Request.Form.Files.Any())
            return BadRequest(new { success = false, message = _localizer["NoFileUploaded"].Value });

        var file = Request.Form.Files.First();
        if (file.Length == 0) return BadRequest(new { success = false, message = _localizer["EmptyFile"].Value });

        try
        {
            // Create DB record first with temp url; then save file and update url
            var img = new InvestmentImage
            {
                InvestmentId = investmentId,
                Caption = Request.Form["caption"].FirstOrDefault(),
                SortOrder = (int?) (await _unitOfWork.Repository<InvestmentImage>().FindAsync(i => i.InvestmentId == investmentId)).Count() ?? 0,
                IsPrimary = false,
                CreatedAt = DateTime.UtcNow
            };

            await _unitOfWork.Repository<InvestmentImage>().AddAsync(img);
            await _unitOfWork.SaveChangesAsync(); // get Id

            // Save file to wwwroot/uploads/investments/{investmentId}/{img.Id}_{filename}
            var safeName = Path.GetFileName(file.FileName);
            var relDir = $"uploads/investments/{investmentId}";
            await ((IFileStorage)HttpContext.RequestServices.GetService(typeof(IFileStorage))).EnsureDirectoryAsync(relDir);
            var relPath = $"{relDir}/{img.Id}_{safeName}";

            await using (var stream = file.OpenReadStream())
            {
                var url = await ((IFileStorage)HttpContext.RequestServices.GetService(typeof(IFileStorage))).SaveFileAsync(relPath, stream, file.ContentType);
                img.Url = url;
            }

            await _unitOfWork.SaveChangesAsync();

            var dto = _mapper.Map<InvestmentImageDto>(img);
            return Ok(new { success = true, data = dto });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, message = _localizer["FailedToUploadImage"].Value, error = ex.Message });
        }
    }

    /// <summary>
    /// Delete an investment image (file + DB). Founder or OrgUser only.
    /// </summary>
    [HttpDelete("{investmentId:int}/images/{imageId:int}")]
    [Authorize]
    public async Task<IActionResult> DeleteImage(int investmentId, int imageId)
    {
        var userIdClaim = User.FindFirst("sub")?.Value ?? User.FindFirst("id")?.Value;
        if (!Guid.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized(new { success = false, message = "Unable to identify user from token" });
        }

        var image = (await _unitOfWork.Repository<InvestmentImage>().FindAsync(i => i.Id == imageId && i.InvestmentId == investmentId)).FirstOrDefault();
        if (image == null) return NotFound(new { success = false, message = "Image not found" });

        var investment = await _service.GetByIdAsync(investmentId);
        if (investment == null) return NotFound(new { success = false, message = "Investment not found" });

        if (investment.FounderId != userId && !User.IsInRole(nameof(UserRoles.OrgUser)))
        {
            return Forbid();
        }

        try
        {
            // Delete file
            var relPath = image.Url?.TrimStart('/') ?? string.Empty;
            await ((IFileStorage)HttpContext.RequestServices.GetService(typeof(IFileStorage))).DeleteFileAsync(relPath);
            // Delete DB record
            await _unitOfWork.Repository<InvestmentImage>().DeleteAsync(image);
            await _unitOfWork.SaveChangesAsync();
            return Ok(new { success = true });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, message = _localizer["FailedToDeleteImage"].Value, error = ex.Message });
        }
    }

    /// <summary>
    /// Set the specified image as primary for the investment. Only founder or OrgUser.
    /// </summary>
    [HttpPut("{investmentId:int}/images/{imageId:int}/set-primary")]
    [Authorize]
    public async Task<IActionResult> SetPrimaryImage(int investmentId, int imageId)
    {
        var userIdClaim = User.FindFirst("sub")?.Value ?? User.FindFirst("id")?.Value;
        if (!Guid.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized(new { success = false, message = "Unable to identify user from token" });
        }

        var image = (await _unitOfWork.Repository<InvestmentImage>().FindAsync(i => i.Id == imageId && i.InvestmentId == investmentId)).FirstOrDefault();
        if (image == null) return NotFound(new { success = false, message = "Image not found" });

        var investment = await _service.GetByIdAsync(investmentId);
        if (investment == null) return NotFound(new { success = false, message = "Investment not found" });

        if (investment.FounderId != userId && !User.IsInRole(nameof(UserRoles.OrgUser)))
        {
            return Forbid();
        }

        try
        {
            // Unset others
            var images = await _unitOfWork.Repository<InvestmentImage>().FindAsync(i => i.InvestmentId == investmentId);
            foreach (var im in images)
            {
                im.IsPrimary = im.Id == imageId;
                await _unitOfWork.Repository<InvestmentImage>().UpdateAsync(im);
            }
            await _unitOfWork.SaveChangesAsync();
            return Ok(new { success = true });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, message = _localizer["FailedToSetPrimaryImage"].Value, error = ex.Message });
        }
    }

    /// <summary>
    /// Reorder images for an investment. Accepts [{ id: 1, sortOrder: 0 }, ...]
    /// </summary>
    [HttpPut("{investmentId:int}/images/reorder")]
    [Authorize]
    public async Task<IActionResult> ReorderImages(int investmentId, [FromBody] List<ReorderImageDto> payload)
    {
        var userIdClaim = User.FindFirst("sub")?.Value ?? User.FindFirst("id")?.Value;
        if (!Guid.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized(new { success = false, message = "Unable to identify user from token" });
        }

        var investment = await _service.GetByIdAsync(investmentId);
        if (investment == null) return NotFound(new { success = false, message = "Investment not found" });

        if (investment.FounderId != userId && !User.IsInRole(nameof(UserRoles.OrgUser)))
        {
            return Forbid();
        }

        try
        {
            var images = await _unitOfWork.Repository<InvestmentImage>().FindAsync(i => i.InvestmentId == investmentId);
            var imagesById = images.ToDictionary(i => i.Id);
            foreach (var p in payload)
            {
                if (imagesById.TryGetValue(p.Id, out var im))
                {
                    im.SortOrder = p.SortOrder;
                    await _unitOfWork.Repository<InvestmentImage>().UpdateAsync(im);
                }
            }
            await _unitOfWork.SaveChangesAsync();
            return Ok(new { success = true });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, message = _localizer["FailedToReorderImages"].Value, error = ex.Message });
        }
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
            return BadRequest(new { success = false, message = _localizer["InvalidSharesAmount"].Value });

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
                return Ok(new { success = true, message = _localizer["SharesPurchasedSuccessfully"].Value });
            }
            return BadRequest(new { success = false, message = _localizer["PurchaseFailed"].Value });
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
    [Authorize(Roles = "Admin")]
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