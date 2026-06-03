using System.ComponentModel.DataAnnotations;
using System.Linq;
using Investa.Application.DTOs.Profile;
using Investa.Application.Interfaces;
using Investa.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Localization;
using Investa.API.Resources;
using Investa.API.Utilities;

namespace Investa.API.Controllers;

/// <summary>
/// API controller for user profile operations.
/// Handles profile retrieval, updates, and IP tracking for user sessions.
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ProfileController : ControllerBase
{
    private readonly IProfileService _profileService;
    private readonly ILogger<ProfileController> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IStringLocalizer<SharedResource> _localizer;

    public ProfileController(IProfileService profileService, IUnitOfWork unitOfWork, ILogger<ProfileController> logger, IStringLocalizer<SharedResource> localizer)
    {
        _profileService = profileService;
        _unitOfWork = unitOfWork;
        _logger = logger;
        _localizer = localizer;
    }

    /// <summary>
    /// Request DTO for updating the small set of editable profile fields.
    /// </summary>
    public class EditProfileRequest
    {
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? Mobile { get; set; }
        /// <summary>
        /// Avatar image URL or base64 data (service may accept URL).
        /// </summary>
        public string? Image { get; set; }
    }

    /// <summary>
    /// Saves basic profile fields (first name, last name, mobile, image) for the current user.
    /// </summary>
    [HttpPost("me/basic")]
    [ProducesResponseType(typeof(UserProfileDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> UpdateBasicProfile([FromBody] EditProfileRequest req)
    {
        try
        {
            if (req == null)
                    return BadRequest(_localizer["RequestBodyRequired"].Value);
            // Extract user ID from claims
            var userIdClaim = User.FindFirst("sub")?.Value ?? User.FindFirst("id")?.Value;
            if (!Guid.TryParse(userIdClaim, out var userId))
                return Unauthorized(_localizer["UnableToIdentifyUserFromToken"].Value);

            // Load or create profile
            var profile = await _profileService.GetOrCreateUserProfileAsync(userId);

            // Ensure nested sections exist
            profile.BasicInfo ??= new Investa.Application.DTOs.Profile.BasicInfoDto();
            profile.ContactInfo ??= new Investa.Application.DTOs.Profile.ContactInfoDto();

            var changed = false;
            if (!string.IsNullOrWhiteSpace(req.FirstName) && req.FirstName != profile.BasicInfo.FirstName)
            {
                profile.BasicInfo.FirstName = req.FirstName.Trim();
                changed = true;
            }
            if (!string.IsNullOrWhiteSpace(req.LastName) && req.LastName != profile.BasicInfo.LastName)
            {
                profile.BasicInfo.LastName = req.LastName.Trim();
                changed = true;
            }
            if (!string.IsNullOrWhiteSpace(req.FirstName) || !string.IsNullOrWhiteSpace(req.LastName))
            {
                profile.BasicInfo.FullName = string.Join(' ', new[] { profile.BasicInfo.FirstName, profile.BasicInfo.LastName }
                    .Where(x => !string.IsNullOrWhiteSpace(x))).Trim();
            }
            if (!string.IsNullOrWhiteSpace(req.Mobile) && req.Mobile != profile.ContactInfo.Phone1)
            {
                profile.ContactInfo.Phone1 = req.Mobile.Trim();
                changed = true;
            }
            if (!string.IsNullOrWhiteSpace(req.Image) && req.Image != profile.BasicInfo.AvatarUrl)
            {
                profile.BasicInfo.AvatarUrl = req.Image.Trim();
                changed = true;
            }

            if (!changed)
            {
                return BadRequest(_localizer["NoChangesDetected"].Value);
            }

                await _profileService.UpdateUserProfileAsync(userId, profile);

                return Ok(new { message = _localizer["ProfileUpdated"].Value });
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning($"Profile basic update failed: {ex.Message}");
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error updating basic profile: {ex.Message}");
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = _localizer["ErrorUpdatingBasicProfile"].Value });
        }
    }

    /// <summary>
    /// Gets the complete profile of the currently authenticated user.
    /// Returns all 4 sections: Basic Info, Contact Info, Identity & Compliance, and Audit & Usage.
    /// Also updates the last login timestamp and IP address.
    /// </summary>
    /// <returns>
    /// 200 OK: Complete UserProfileDto with all sections
    /// 401 Unauthorized: User not authenticated
    /// 404 Not Found: User profile not found (first-time users get empty sections)
    /// 500 Internal Server Error: Server error occurred
    /// </returns>
    [HttpGet("me")]
    [ProducesResponseType(typeof(UserProfileDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> GetMyProfile()
    {
        try
        {
            // Log Authorization header and claims for debugging
            try
            {
                var authHeader = Request.Headers["Authorization"].ToString();
                _logger.LogInformation("Authorization header: {AuthHeader}", string.IsNullOrEmpty(authHeader) ? "<missing>" : authHeader);
                _logger.LogInformation("Claims present: {Claims}", string.Join(", ", User.Claims.Select(c => $"{c.Type}={c.Value}")));
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to read Authorization header or claims");
            }

            // Extract user ID claim value
            var userIdClaim = User.FindFirst("sub")?.Value ?? User.FindFirst("id")?.Value;
            Guid userId;

            if (!Guid.TryParse(userIdClaim, out userId))
            {
                // Fallback heuristics: try firebase uid, username, or domain users to resolve a GUID
                var firebaseUid = User.FindFirst("firebase_uid")?.Value;
                var userName = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;

                Investa.Domain.Entities.AuthUser? authUser = null;

                if (!string.IsNullOrEmpty(firebaseUid))
                {
                    authUser = (await _unitOfWork.Repository<Investa.Domain.Entities.AuthUser>()
                        .FindAsync(a => a.FirebaseUid == firebaseUid)).FirstOrDefault();
                }

                if (authUser == null && !string.IsNullOrEmpty(userName))
                {
                    // Try phone-based placeholder email produced during sign-up
                    var possibleEmail = userName + "@phone.investa.local";
                    authUser = (await _unitOfWork.Repository<Investa.Domain.Entities.AuthUser>()
                        .FindAsync(a => a.Email == possibleEmail)).FirstOrDefault();
                }

                if (authUser == null && !string.IsNullOrEmpty(userName))
                {
                    // Try direct AuthUser lookup by email placeholder
                    authUser = (await _unitOfWork.Repository<Investa.Domain.Entities.AuthUser>()
                        .FindAsync(a => a.Email == (userName + "@phone.investa.local") || a.Name == userName)).FirstOrDefault();
                }

                if (authUser == null)
                {
                    _logger.LogWarning("Unable to resolve AuthUser from token claims (sub/id not a GUID). sub: {Sub}, name: {Name}, firebase_uid: {Firebase}", userIdClaim, userName, firebaseUid);
                    return Unauthorized(_localizer["UnableToIdentifyUserFromToken"].Value);
                }

                _logger.LogInformation("Resolved AuthUser {AuthUserId} for request using fallback claims (sub not a GUID)", authUser.Id);
                userId = authUser.Id;
            }

            // Get client IP and device info
            var clientIp = IpAddressUtility.GetClientIpAddress(HttpContext);
            var deviceInfo = IpAddressUtility.GetDeviceInfo(HttpContext);

            // Update last login info (IP and device)
            var profileDto = await _profileService.UpdateLastLoginAsync(userId, clientIp, deviceInfo);

            _logger.LogInformation($"User {userId} retrieved profile from IP: {clientIp}");

            return Ok(profileDto);
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning($"User profile operation failed: {ex.Message}");
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error retrieving user profile: {ex.Message}");
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = _localizer["ErrorRetrievingProfile"].Value });
        }
    }

    /// <summary>
    /// Retrieves the current user's credibility score transaction history.
    /// </summary>
    [HttpGet("me/credits")]
    [ProducesResponseType(typeof(List<CreditTransactionDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> GetCreditHistory()
    {
        try
        {
            var userIdClaim = User.FindFirst("sub")?.Value ?? User.FindFirst("id")?.Value;
            if (!Guid.TryParse(userIdClaim, out var userId))
            {
                _logger.LogWarning("Unable to identify user from token claims");
                return Unauthorized(_localizer["UnableToIdentifyUserFromToken"].Value);
            }

            var history = await _profileService.GetCreditHistoryAsync(userId);
            return Ok(history);
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error retrieving credit history: {ex.Message}");
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = _localizer["ErrorRetrievingCreditHistory"].Value });
        }
    }

    /// <summary>
    /// Updates the user's profile information.
    /// Allows updating Basic Info, Contact Info, and Identity & Compliance sections.
    /// </summary>
    /// <param name="profileDto">The profile data to update</param>
    /// <returns>
    /// 200 OK: Updated UserProfileDto
    /// 401 Unauthorized: User not authenticated
    /// 400 Bad Request: Invalid profile data
    /// 404 Not Found: User not found
    /// 500 Internal Server Error: Server error occurred
    /// </returns>
    [HttpPut("me")]
    [ProducesResponseType(typeof(UserProfileDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> UpdateMyProfile([FromBody] UpdateProfileRequestDto updateReq)
    {
        try
        {
            if (updateReq == null)
                return BadRequest(_localizer["ProfileDataRequired"].Value);

            // Server-side validation (lengths, URL formats)
            var errors = new List<string>();

            if (updateReq.BasicInfo != null)
            {
                if (!string.IsNullOrEmpty(updateReq.BasicInfo.FullName) && updateReq.BasicInfo.FullName.Length > 200)
                    errors.Add(_localizer["FullNameMaxLength"].Value);

                if (!string.IsNullOrEmpty(updateReq.BasicInfo.FirstName) && updateReq.BasicInfo.FirstName.Length > 100)
                    errors.Add(_localizer["FirstNameMaxLength"].Value);

                if (!string.IsNullOrEmpty(updateReq.BasicInfo.LastName) && updateReq.BasicInfo.LastName.Length > 100)
                    errors.Add(_localizer["LastNameMaxLength"].Value);

                if (!string.IsNullOrEmpty(updateReq.BasicInfo.CompanyName) && updateReq.BasicInfo.CompanyName.Length > 200)
                    errors.Add(_localizer["CompanyNameMaxLength"].Value);

                if (!string.IsNullOrEmpty(updateReq.BasicInfo.Bio) && updateReq.BasicInfo.Bio.Length > 1000)
                    errors.Add(_localizer["BioMaxLength"].Value);

                // Date of birth: enforce minimum age 18 on the API layer as well
                if (updateReq.BasicInfo.DateOfBirth.HasValue)
                {
                    var dob = updateReq.BasicInfo.DateOfBirth.Value.Date;
                    var now = DateTime.UtcNow.Date;
                    var age = now.Year - dob.Year - ((now.Month < dob.Month || (now.Month == dob.Month && now.Day < dob.Day)) ? 1 : 0);
                    if (age < 18)
                        errors.Add(_localizer["UserMustBeAtLeast18"].Value);
                }

                // URL validation for Avatar if provided
                bool IsValidUrl(string? u) => string.IsNullOrEmpty(u) || Uri.IsWellFormedUriString(u, UriKind.Absolute);

                if (!IsValidUrl(updateReq.BasicInfo.AvatarUrl))
                    errors.Add(_localizer["AvatarUrlInvalid"].Value);
            }

            if (updateReq.ContactInfo != null)
            {
                if (!string.IsNullOrEmpty(updateReq.ContactInfo.Email) && updateReq.ContactInfo.Email.Length > 150)
                    errors.Add("Email must be at most 150 characters.");

                if (!string.IsNullOrEmpty(updateReq.ContactInfo.CompanyEmail))
                {
                    if (updateReq.ContactInfo.CompanyEmail.Length > 150)
                        errors.Add(_localizer["CompanyEmailMaxLength"].Value);
                    if (!new EmailAddressAttribute().IsValid(updateReq.ContactInfo.CompanyEmail))
                        errors.Add(_localizer["CompanyEmailInvalid"].Value);
                }

                if (!string.IsNullOrEmpty(updateReq.ContactInfo.CompanyAddress) && updateReq.ContactInfo.CompanyAddress.Length > 500)
                    errors.Add(_localizer["CompanyAddressMaxLength"].Value);

                if (!string.IsNullOrEmpty(updateReq.ContactInfo.Phone1) && updateReq.ContactInfo.Phone1.Length > 20)
                    errors.Add(_localizer["Phone1MaxLength"].Value);

                if (!string.IsNullOrEmpty(updateReq.ContactInfo.LinkedInUrl) && !Uri.IsWellFormedUriString(updateReq.ContactInfo.LinkedInUrl, UriKind.Absolute))
                    errors.Add(_localizer["LinkedInUrlInvalid"].Value);

                if (!string.IsNullOrEmpty(updateReq.ContactInfo.FacebookUrl) && !Uri.IsWellFormedUriString(updateReq.ContactInfo.FacebookUrl, UriKind.Absolute))
                    errors.Add(_localizer["FacebookUrlInvalid"].Value);
            }

            if (errors.Count > 0)
                return BadRequest(new { errors });

            // Extract user ID from claims
            var userIdClaim = User.FindFirst("sub")?.Value ?? User.FindFirst("id")?.Value;
            if (!Guid.TryParse(userIdClaim, out var userId))
                return Unauthorized(_localizer["UnableToIdentifyUserFromToken"].Value);

            // Build a server-side DTO to reuse existing service method
            var profileDto = new UserProfileDto
            {
                UserId = Guid.Empty, // service ignores this and uses userId from claims
                BasicInfo = updateReq.BasicInfo,
                ContactInfo = updateReq.ContactInfo,

            };


            var updatedProfile = await _profileService.UpdateUserProfileAsync(userId, profileDto);

            _logger.LogInformation($"User {userId} updated their profile");

            return Ok(updatedProfile);
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning($"Profile update failed: {ex.Message}");
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error updating user profile: {ex.Message}");
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = _localizer["ErrorUpdatingProfile"].Value });
        }
    }

    /// <summary>
    /// Gets or creates a user profile if it doesn't exist.
    /// Useful for first-time login or profile initialization.
    /// </summary>
    /// <returns>
    /// 200 OK: UserProfileDto (newly created or existing)
    /// 401 Unauthorized: User not authenticated
    /// 404 Not Found: User not found
    /// 500 Internal Server Error: Server error occurred
    /// </returns>
    [HttpPost("me/initialize")]
    [ProducesResponseType(typeof(UserProfileDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> InitializeProfile()
    {
        try
        {
            // Extract user ID from claims
            var userIdClaim = User.FindFirst("sub")?.Value ?? User.FindFirst("id")?.Value;
            if (!Guid.TryParse(userIdClaim, out var userId))
                return Unauthorized(_localizer["UnableToIdentifyUserFromToken"].Value);

            // Get client IP for registration tracking
            var clientIp = IpAddressUtility.GetClientIpAddress(HttpContext);

            // Get or create profile
            var profileDto = await _profileService.GetOrCreateUserProfileAsync(userId);

            // Set registration IP if this is the first time
            if (string.IsNullOrWhiteSpace(profileDto.AuditUsage?.RegistrationIP))
            {
                profileDto = await _profileService.SetRegistrationIpAsync(userId, clientIp);
            }

            _logger.LogInformation($"User {userId} profile initialized with registration IP: {clientIp}");

            return Ok(profileDto);
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning($"Profile initialization failed: {ex.Message}");
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error initializing user profile: {ex.Message}");
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = _localizer["ErrorInitializingProfile"].Value });
        }
    }

    /// <summary>
    /// Gets the profile of the currently authenticated user.
    /// </summary>
    /// <returns>
    /// 200 OK: UserProfileDto (existing profile)
    /// 401 Unauthorized: User not authenticated
    /// 404 Not Found: User not found
    /// 500 Internal Server Error: Server error occurred
    /// </returns>
    [HttpGet("me/myprofile")]
    [ProducesResponseType(typeof(UserProfileDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> GetAuthenticatedUserProfile()
    {
        try
        {
            // Extract user ID from claims
            var userIdClaim = User.FindFirst("sub")?.Value ?? User.FindFirst("id")?.Value;
            if (!Guid.TryParse(userIdClaim, out var userId))
                return Unauthorized(_localizer["UnableToIdentifyUserFromToken"].Value);

            // Get existing profile
            var profileDto = await _profileService.GetUserProfileAsync(userId);
            if (profileDto == null)
                return NotFound(_localizer["UserProfileNotFound"].Value);

            _logger.LogInformation($"User {userId} profile retrieved successfully.");

            return Ok(profileDto);
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning($"Profile retrieval failed: {ex.Message}");
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error retrieving user profile: {ex.Message}");
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = _localizer["ErrorRetrievingProfile"].Value });
        }
    }

    /// <summary>
    /// Returns a public-safe subset of another user's profile (name, avatar, bio, company, score).
    /// Sensitive fields (contact info, KYC documents, financial data) are intentionally omitted.
    /// </summary>
    [HttpGet("{id}/public")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> GetPublicProfile(string id)
    {
        if (!Guid.TryParse(id, out var userId))
            return BadRequest(new { message = "Invalid user ID format." });

        try
        {
            var profile = await _profileService.GetUserProfileAsync(userId);
            if (profile == null)
                return NotFound(new { message = "Profile not found." });

            // Return only public-safe fields — no contact info, KYC docs, or financial data
            var publicProfile = new
            {
                userId = profile.UserId,
                fullName = profile.BasicInfo?.FullName,
                firstName = profile.BasicInfo?.FirstName,
                lastName = profile.BasicInfo?.LastName,
                bio = profile.BasicInfo?.Bio,
                avatarUrl = profile.BasicInfo?.AvatarUrl,
                companyName = profile.BasicInfo?.CompanyName,
                country = profile.BasicInfo?.Country,
                nationality = profile.BasicInfo?.Nationality,

                linkedInUrl = profile.ContactInfo?.LinkedInUrl,
                facebookUrl = profile.ContactInfo?.FacebookUrl,
            };

            _logger.LogInformation("Public profile requested for user {UserId}", userId);
            return Ok(publicProfile);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving public profile for user {UserId}", userId);
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = "Error retrieving profile." });
        }
    }

    /// <summary>
    /// Debug endpoint to echo back Authorization header and any claims (development only)
    /// </summary>
    [HttpGet("debug")]
    [AllowAnonymous]
    public IActionResult Debug()
    {
        var auth = Request.Headers["Authorization"].ToString();
        var claims = User?.Claims?.Select(c => new { c.Type, c.Value }).Select(x => (object)x).ToList() ?? new List<object>();
        return Ok(new { authHeader = string.IsNullOrEmpty(auth) ? null : auth, claims });
    }
}
