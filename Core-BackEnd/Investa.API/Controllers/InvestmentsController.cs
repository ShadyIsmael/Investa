using AutoMapper;
using Investa.Application.DTOs;
using Investa.Application.Interfaces;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Investa.Domain.Entities.Security;
using Investa.Domain.Entities;
using Investa.Domain.Entities.Enums;
using Investa.API.Controllers.Dtos;
using Microsoft.Extensions.Localization;
using Investa.API.Resources;
using Microsoft.Extensions.Logging;

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
    private readonly ILogger<InvestmentsController> _logger;
    private readonly IFileStorage _fileStorage;

    public InvestmentsController(
        IInvestmentService service, 
        IMapper mapper, 
        IUnitOfWork unitOfWork, 
        IScoreService scoreService, 
        INotificationService notificationService, 
        IStringLocalizer<SharedResource> localizer,
        ILogger<InvestmentsController> logger,
        IFileStorage fileStorage)
    {
        _service = service;
        _mapper = mapper;
        _unitOfWork = unitOfWork;
        _scoreService = scoreService;
        _notificationService = notificationService;
        _localizer = localizer;
        _logger = logger;
        _fileStorage = fileStorage;
    }

    [HttpPost]
    [Authorize(Policy = "TrustLevel3")]
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

        // Populate BusinessCategory names (English + Arabic) for response when available
        try
        {
            if (outDto.BusinessCategoryId.HasValue)
            {
                var bc = await _unitOfWork.Repository<Investa.Domain.Entities.BusinessCategory>().GetByIdAsync(outDto.BusinessCategoryId.Value);
                if (bc != null)
                {
                    outDto.BusinessCategoryName = bc.Value;
                    outDto.BusinessCategoryNameAr = string.IsNullOrWhiteSpace(bc.ValueAr) ? bc.Value : bc.ValueAr;
                }
            }
        }
        catch
        {
            // ignore lookup failures for create response
        }

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
    [Authorize(Policy = "TrustLevel1")]
    public async Task<IActionResult> Get(int id)
    {
        var entity = await _service.GetByIdAsync(id);
        if (entity == null) return NotFound(new { success = false, message = _localizer["InvestmentNotFound"].Value });
        var outDto = _mapper.Map<InvestmentDto>(entity);

        // Populate favorite state — direct targeted query via unique index (no full scan)
        var currentUserId = GetCurrentUserId();
        if (currentUserId.HasValue)
        {
            outDto.Favorited = (await _unitOfWork.Repository<InvestmentFavorite>()
                .FindAsync(f => f.InvestorId == currentUserId.Value && f.InvestmentId == id)).Any();
        }

        // Enrich with founder display and credibility score
        await EnrichInvestmentDtoAsync(outDto);
        return Ok(new { success = true, data = outDto });
    }

    [HttpGet("GetByCategory")]
    [AllowAnonymous]
    public async Task<IActionResult> GetByCategory([FromQuery] int? categoryId)
    {
        try
        {
            var entities = await _service.GetByCategoryAsync(categoryId);
            var outDtos = _mapper.Map<IEnumerable<InvestmentDto>>(entities).ToList();

            HashSet<int> favoriteIds = new HashSet<int>();
            var currentUserId = GetCurrentUserId();
            if (currentUserId.HasValue)
            {
                favoriteIds = new HashSet<int>(await _service.GetFavoriteInvestmentIdsAsync(currentUserId.Value));
            }

            // Mark favorites and batch-enrich (single round-trip per data type)
            foreach (var dto in outDtos)
                dto.Favorited = favoriteIds.Contains(dto.Id);

            await EnrichInvestmentDtosAsync(outDtos);
            return Ok(new { success = true, data = outDtos });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in GetByCategory with categoryId: {CategoryId}", categoryId);
            return StatusCode(500, new { success = false, message = "An error occurred while fetching investments", error = ex.Message });
        }
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

        var favoriteIds = new HashSet<int>(await _service.GetFavoriteInvestmentIdsAsync(userId));
        foreach (var dto in outDtos)
            dto.Favorited = favoriteIds.Contains(dto.Id);

        await EnrichInvestmentDtosAsync(outDtos);
        return Ok(new { success = true, data = outDtos });
    }

    [HttpPost("{id:int}/favorite")]
    [Authorize(Policy = "TrustLevel2")]
    public async Task<IActionResult> SetFavorite(int id, [FromBody] SetFavoriteDto dto)
    {
        if (dto == null)
            return BadRequest(new { success = false, message = _localizer["InvalidPayload"].Value });

        var userId = GetCurrentUserId();
        if (!userId.HasValue)
            return Unauthorized(new { success = false, message = "Unable to identify user from token" });

        var investment = await _service.GetByIdAsync(id);
        if (investment == null)
            return NotFound(new { success = false, message = _localizer["InvestmentNotFound"].Value });

        var favorited = await _service.ToggleFavoriteAsync(userId.Value, id, dto.Favorited);
        return Ok(new { success = true, data = new { investmentId = id, favorited } });
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
            // Get optional mediaType parameter (default to Image)
            var mediaTypeStr = Request.Form["mediaType"].FirstOrDefault();
            var mediaType = MediaType.Image;
            if (int.TryParse(mediaTypeStr, out var mt))
            {
                mediaType = (MediaType)(mt == 0 ? 0 : mt == 2 ? 2 : 1); // Validate: 0=CoverImage, 1=Image, 2=Video
            }

            // Upload file to Investa.FileStore first to get valid URL
            var safeName = Path.GetFileName(file.FileName);
            var relPath = $"uploads/investments/{investmentId}/{Guid.NewGuid()}_{safeName}";

            string url;
            await using (var stream = file.OpenReadStream())
            {
                url = await _fileStorage.SaveFileAsync(relPath, stream, file.ContentType);
            }

            // Create DB record with valid URL
            var img = new InvestmentImage
            {
                InvestmentId = investmentId,
                MediaType = mediaType,
                Caption = Request.Form["caption"].FirstOrDefault(),
                FileName = file.FileName,
                UploadedBy = userId,
                SortOrder = (int?) (await _unitOfWork.Repository<InvestmentImage>().FindAsync(i => i.InvestmentId == investmentId)).Count() ?? 0,
                IsPrimary = false,
                CreatedAt = DateTime.UtcNow,
                Url = url
            };

            await _unitOfWork.Repository<InvestmentImage>().AddAsync(img);
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
    /// Upload a video for an investment (multipart form file). Only founder or OrgUser (admin) can upload.
    /// </summary>
    [HttpPost("{investmentId:int}/videos")]
    [Authorize]
    public async Task<IActionResult> UploadVideo(int investmentId)
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

        if (!Request.HasFormContentType || !Request.Form.Files.Any())
            return BadRequest(new { success = false, message = "No file uploaded" });

        var file = Request.Form.Files.First();
        if (file.Length == 0) return BadRequest(new { success = false, message = "Empty file" });

        try
        {
            var video = new InvestmentImage
            {
                InvestmentId = investmentId,
                MediaType = MediaType.Video,
                Caption = Request.Form["caption"].FirstOrDefault(),
                FileName = file.FileName,
                UploadedBy = userId,
                SortOrder = (int?) (await _unitOfWork.Repository<InvestmentImage>().FindAsync(i => i.InvestmentId == investmentId)).Count() ?? 0,
                IsPrimary = false,
                CreatedAt = DateTime.UtcNow
            };

            await _unitOfWork.Repository<InvestmentImage>().AddAsync(video);
            await _unitOfWork.SaveChangesAsync();

            // Upload file to Investa.FileStore (centralized storage)
            var safeName = Path.GetFileName(file.FileName);
            var relPath = $"uploads/investments/{investmentId}/videos/{video.Id}_{safeName}";

            await using (var stream = file.OpenReadStream())
            {
                var url = await _fileStorage.SaveFileAsync(relPath, stream, file.ContentType);
                video.Url = url;
            }

            await _unitOfWork.SaveChangesAsync();

            var dto = _mapper.Map<InvestmentImageDto>(video);
            return Ok(new { success = true, data = dto });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, message = "Failed to upload video", error = ex.Message });
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
            // Delete file from Investa.FileStore (centralized storage)
            var relPath = image.Url?.TrimStart('/') ?? string.Empty;
            await _fileStorage.DeleteFileAsync(relPath);
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

    /// <summary>
    /// Batch-enriches a list of DTOs with founder info, category names, and credibility scores.
    /// Reduces N+1 queries to 3 bulk DB loads + parallel score fetches.
    /// </summary>
    private async Task EnrichInvestmentDtosAsync(IList<InvestmentDto> dtos)
    {
        if (dtos == null || dtos.Count == 0) return;

        var founderIds = dtos.Select(d => d.FounderId).Distinct().ToList();
        var categoryIds = dtos
            .Where(d => d.BusinessCategoryId.HasValue)
            .Select(d => d.BusinessCategoryId!.Value)
            .Distinct()
            .ToList();

        // 1. Load Client records for every founder by id one at a time.
        // This avoids EF Core translating the `Contains` list into OPENJSON SQL,
        // which fails on older database compatibility settings.
        var clientsById = new Dictionary<Guid, Investa.Domain.Entities.Client>();
        foreach (var founderId in founderIds)
        {
            var client = await _unitOfWork.Repository<Investa.Domain.Entities.Client>()
                .GetSingleAsync(c => c.UserId == founderId);
            if (client != null)
                clientsById[founderId] = client;
        }

        // 2. Load AuthUsers only for founders missing a Client record.
        var missingFounderIds = founderIds.Where(id => !clientsById.ContainsKey(id)).ToList();
        var authUsersById = new Dictionary<Guid, Investa.Domain.Entities.AuthUser>();
        if (missingFounderIds.Count > 0)
        {
            foreach (var missingFounderId in missingFounderIds)
            {
                var user = await _unitOfWork.Repository<Investa.Domain.Entities.AuthUser>()
                    .GetSingleAsync(u => u.Id == missingFounderId, u => u.Profile);
                if (user != null)
                    authUsersById[missingFounderId] = user;
            }
        }

        // 3. Load business categories individually instead of using a list-based query.
        var categoriesById = new Dictionary<int, Investa.Domain.Entities.BusinessCategory>();
        foreach (var categoryId in categoryIds)
        {
            var bc = await _unitOfWork.Repository<Investa.Domain.Entities.BusinessCategory>().GetByIdAsync(categoryId);
            if (bc != null)
                categoriesById[categoryId] = bc;
        }

        // 4. Fetch credibility scores for all distinct founders sequentially.
        // Parallel execution would reuse the same DbContext and cause concurrency failures.
        var scoresById = new Dictionary<Guid, int>();
        foreach (var founderId in founderIds)
        {
            scoresById[founderId] = await _scoreService.GetCredibilityScoreAsync(founderId);
        }

        var currentUserId = GetCurrentUserId();

        foreach (var dto in dtos)
        {
            string? founderName = null;
            string? businessRole = null;

            if (clientsById.TryGetValue(dto.FounderId, out var client))
            {
                founderName = string.Join(' ', new[] { client.FirstName, client.LastName }
                    .Where(s => !string.IsNullOrWhiteSpace(s)));
                businessRole = client.BusinessRole;
            }
            else if (authUsersById.TryGetValue(dto.FounderId, out var user))
            {
                if (user.Profile != null)
                    founderName = string.Join(' ', new[] { user.Profile.FirstName, user.Profile.LastName }
                        .Where(s => !string.IsNullOrWhiteSpace(s)));
                if (string.IsNullOrWhiteSpace(founderName))
                    founderName = user.Name;
            }

            dto.BusinessRole = businessRole;
            if (!string.IsNullOrWhiteSpace(founderName) && !string.IsNullOrWhiteSpace(businessRole))
                dto.FounderDisplay = $"{founderName} - {businessRole}";
            else if (!string.IsNullOrWhiteSpace(founderName))
                dto.FounderDisplay = founderName;
            else if (!string.IsNullOrWhiteSpace(businessRole))
                dto.FounderDisplay = businessRole;
            else
                dto.FounderDisplay = "Unknown";

            if (dto.BusinessCategoryId.HasValue && categoriesById.TryGetValue(dto.BusinessCategoryId.Value, out var bc))
            {
                dto.BusinessCategoryName = bc.Value;
                dto.BusinessCategoryNameAr = string.IsNullOrWhiteSpace(bc.ValueAr) ? bc.Value : bc.ValueAr;
            }

            dto.CredibilityScore = scoresById.TryGetValue(dto.FounderId, out var score) ? score : 0;

            if (currentUserId.HasValue)
            {
                var participant = dto.Participants?.FirstOrDefault(p => p.InvestorId == currentUserId.Value);
                dto.InvestedAmount = participant?.AmountInvested ?? 0m;
            }
            else
            {
                dto.InvestedAmount = null;
            }
        }
    }

    private async Task EnrichInvestmentDtoAsync(InvestmentDto dto)
    {
        if (dto == null) return;

        string? founderName = null;
        string? businessRole = null;

        try
        {
            // Try to find Client record for this user
            var client = (await _unitOfWork.Repository<Investa.Domain.Entities.Client>()
                .FindAsync(c => c.UserId == dto.FounderId))
                .FirstOrDefault();

            if (client != null)
            {
                founderName = string.Join(' ', new[] { client.FirstName, client.LastName }.Where(s => !string.IsNullOrWhiteSpace(s)));
                businessRole = client.BusinessRole;
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Could not retrieve Client record for user {FounderId}", dto.FounderId);
        }

        // Fallback to UserProfile if no client data found
        if (string.IsNullOrWhiteSpace(founderName))
        {
            try
            {
                var user = await _unitOfWork.Repository<Investa.Domain.Entities.AuthUser>().GetByIdAsync(dto.FounderId);
                if (user?.Profile != null)
                {
                    founderName = string.Join(' ', new[] { user.Profile.FirstName, user.Profile.LastName }.Where(s => !string.IsNullOrWhiteSpace(s)));
                }
                if (string.IsNullOrWhiteSpace(founderName)) founderName = user?.Name;
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Could not retrieve User record for {FounderId}", dto.FounderId);
            }
        }

        dto.BusinessRole = businessRole;
        if (!string.IsNullOrWhiteSpace(founderName) && !string.IsNullOrWhiteSpace(businessRole))
            dto.FounderDisplay = $"{founderName} - {businessRole}";
        else if (!string.IsNullOrWhiteSpace(founderName))
            dto.FounderDisplay = founderName;
        else if (!string.IsNullOrWhiteSpace(businessRole))
            dto.FounderDisplay = businessRole;
        else
            dto.FounderDisplay = "Unknown"; // Default fallback

        // NOTE: Favorited is set by the caller — do NOT reset it here.

        // Populate credibility score (default 0)
        try
        {
            dto.CredibilityScore = await _scoreService.GetCredibilityScoreAsync(dto.FounderId);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Could not retrieve credibility score for {FounderId}", dto.FounderId);
            dto.CredibilityScore = 0;
        }

        // Populate BusinessCategory display names (English + Arabic) when available
        try
        {
            if (dto.BusinessCategoryId.HasValue)
            {
                var bc = await _unitOfWork.Repository<Investa.Domain.Entities.BusinessCategory>().GetByIdAsync(dto.BusinessCategoryId.Value);
                if (bc != null)
                {
                    dto.BusinessCategoryName = bc.Value;
                    dto.BusinessCategoryNameAr = string.IsNullOrWhiteSpace(bc.ValueAr) ? bc.Value : bc.ValueAr;
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Could not retrieve BusinessCategory for investment {InvestmentId}", dto.Id);
        }

        // Populate InvestedAmount for the requesting user if available
        try
        {
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
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Could not retrieve participant data for investment {InvestmentId}", dto.Id);
            dto.InvestedAmount = null;
        }
    }

    private Guid? GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst("sub")?.Value ?? User.FindFirst("id")?.Value;
        return Guid.TryParse(userIdClaim, out var parsed) ? parsed : (Guid?)null;
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
        // include both English and Arabic category columns so exports contain localized labels
        lines.Add("Id,Name,FounderId,FounderDisplay,BusinessRole,BusinessCategoryName,BusinessCategoryNameAr,TargetFund,CurrentFunding,InvestedAmount,InvestorCount,Status");
        foreach (var d in dtos)
        {
            var nameEsc = d.BusinessName?.Replace("\"", "\"\"") ?? string.Empty;
            var roleEsc = (d.BusinessRole ?? string.Empty).Replace("\"", "\"\"");
            var catNameEsc = (d.BusinessCategoryName ?? string.Empty).Replace("\"", "\"\"");
            var catNameArEsc = (d.BusinessCategoryNameAr ?? string.Empty).Replace("\"", "\"\"");
            lines.Add($"{d.Id},\"{nameEsc}\",{d.FounderId},\"{(d.FounderDisplay ?? string.Empty).Replace("\"", "\"\"")}\",\"{roleEsc}\",\"{catNameEsc}\",\"{catNameArEsc}\",{d.TargetFund},{d.CurrentFunding},{d.InvestedAmount},{d.InvestorCount},\"{d.Status}\"");
        }

        var csv = string.Join("\n", lines);
        var bytes = System.Text.Encoding.UTF8.GetBytes(csv);
        return File(bytes, "text/csv", $"investments_export_{DateTime.UtcNow:yyyyMMdd}.csv");
    }
}
