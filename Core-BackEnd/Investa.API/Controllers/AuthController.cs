using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;
using Microsoft.AspNetCore.Authorization;
using Investa.Application.Interfaces;
using Investa.Domain.Entities;
using Investa.Application.DTOs.Auth;
using Investa.Application.Services;

namespace Investa.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly UserManager<IdentityUser> _userManager;
    private readonly IJwtTokenService _jwtTokenService;
    private readonly ILogger<AuthController> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IConfiguration _configuration;
    private readonly Investa.Application.Interfaces.ISmsSender _smsSender;

    public AuthController(
        UserManager<IdentityUser> userManager,
        IJwtTokenService jwtTokenService,
        ILogger<AuthController> logger,
        IUnitOfWork unitOfWork,
        IConfiguration configuration,
        Investa.Application.Interfaces.ISmsSender smsSender)
    {
        _userManager = userManager;
        _jwtTokenService = jwtTokenService;
        _logger = logger;
        _unitOfWork = unitOfWork;
        _configuration = configuration;
        _smsSender = smsSender;
    }

    public class CreateAdminDto
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
    }

    public class LoginEmailDto
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }

    [HttpPost("create-admin")]
    [AllowAnonymous]
    public async Task<IActionResult> CreateAdmin([FromBody] CreateAdminDto request)
    {
        if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
            return BadRequest(new { success = false, message = "Email and password are required." });

        var normalizedEmail = request.Email?.Trim().ToLowerInvariant() ?? string.Empty;
        var existingByEmail = await _userManager.FindByEmailAsync(normalizedEmail);
        if (existingByEmail != null)
            return Conflict(new { success = false, message = "A user with this email already exists." });

        // Generate GUID id so it matches domain AuthUser/User ids used elsewhere
        var guid = Guid.NewGuid();
        
        // Use email username without special chars for ASP.NET Identity validation
        var username = normalizedEmail.Replace("@", "_").Replace(".", "_");
        
        var user = new IdentityUser
        {
            Id = guid.ToString(),
            UserName = username,
            Email = normalizedEmail,
            EmailConfirmed = true
        };

        var result = await _userManager.CreateAsync(user, request.Password);
        if (!result.Succeeded)
        {
            return BadRequest(new { success = false, message = "User creation failed.", errors = result.Errors.Select(e => e.Description).ToList() });
        }

        // Add name claims if provided
        if (!string.IsNullOrWhiteSpace(request.FirstName))
            await _userManager.AddClaimAsync(user, new Claim(ClaimTypes.GivenName, request.FirstName));
        if (!string.IsNullOrWhiteSpace(request.LastName))
            await _userManager.AddClaimAsync(user, new Claim(ClaimTypes.Surname, request.LastName));

        try
        {
            var passwordHasher = new Microsoft.AspNetCore.Identity.PasswordHasher<IdentityUser>();
            var authUser = new AuthUser
            {
                Id = guid,
                Email = normalizedEmail,
                PasswordHash = passwordHasher.HashPassword(user, request.Password),
                UserType = Investa.Domain.Entities.Enums.UserType.OrgUser,
                Status = true
            };

            await _unitOfWork.Repository<AuthUser>().AddAsync(authUser);

            var domainUser = new User
            {
                Id = guid,
                Name = string.IsNullOrWhiteSpace(request.FirstName) && string.IsNullOrWhiteSpace(request.LastName)
                    ? normalizedEmail
                    : ($"{request.FirstName} {request.LastName}").Trim(),
                Email = normalizedEmail,
                Role = "OrgUser"
            };

            await _unitOfWork.Repository<User>().AddAsync(domainUser);
            await _unitOfWork.SaveChangesAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to create AuthUser/domain user for admin {Email}", request.Email);
            return StatusCode(StatusCodes.Status500InternalServerError, new { success = false, message = "Failed to create admin user." });
        }

        return Ok(new { success = true, message = "Admin user created." });
    }

    /// <summary>
    /// Login using email and password (for admin users)
    /// </summary>
    [HttpPost("login-email")]
    [AllowAnonymous]
    public async Task<IActionResult> LoginByEmail([FromBody] LoginEmailDto request)
    {
        if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
            return BadRequest(new { success = false, message = "Email and password are required." });

        var normalizedEmail = request.Email?.Trim().ToLowerInvariant() ?? string.Empty;
        var identityUser = await _userManager.FindByEmailAsync(normalizedEmail);
        if (identityUser == null)
            return Unauthorized(new { success = false, message = "Invalid credentials." });

        var passwordValid = await _userManager.CheckPasswordAsync(identityUser, request.Password);
        if (!passwordValid)
            return Unauthorized(new { success = false, message = "Invalid credentials." });

        // Optional: check AuthUser status if present
        if (Guid.TryParse(identityUser.Id, out var authGuid))
        {
            var authUser = (await _unitOfWork.Repository<Investa.Domain.Entities.AuthUser>().FindAsync(a => a.Id == authGuid)).FirstOrDefault();
            if (authUser != null)
            {
                if (!authUser.Status)
                    return Unauthorized(new { success = false, message = "Account is disabled." });

                if (authUser.SuspendedUntil.HasValue && authUser.SuspendedUntil.Value > DateTime.UtcNow)
                    return Unauthorized(new { success = false, message = "Account suspended." });
            }
        }

        var authResponse = await _jwtTokenService.GenerateTokenAsync(identityUser);
        return Ok(new { success = true, data = authResponse });
    }

    /// <summary>
    /// Registers a new user with phone number and password.
    /// Phone number is used as the unique username identifier.
    /// Validates phone number format (Egyptian phone numbers) and password strength.
    /// Returns JWT token on successful registration.
    /// </summary>
    /// <param name="request">RegisterDto containing first name, last name, phone number and password</param>
    /// <returns>AuthResponseDto with JWT token and expiration date</returns>
    /// <response code="200">User registered successfully with JWT token</response>
    /// <response code="400">Invalid phone number format or password requirements not met</response>
    /// <response code="409">Phone number already registered</response>
    /// <response code="500">Server error during registration</response>
    [HttpPost("sign-up")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(AuthResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> SignUp([FromBody] RegisterDto request)
    {
        try
        {
            // Check if phone number is already registered
            var existingUser = await _userManager.FindByNameAsync(request.PhoneNumber);
            if (existingUser != null)
            {
                _logger.LogWarning($"Sign-up attempt with existing phone number: {request.PhoneNumber}");
                return Conflict(new
                {
                    success = false,
                    message = "This phone number is already registered.",
                    code = "PHONE_EXISTS"
                });
            }

            // Normalize phone (basic): trim spaces
            var normalizedPhone = request.PhoneNumber?.Trim().Replace(" ", "") ?? string.Empty;
            // Create new IdentityUser with phone number as username
            var user = new IdentityUser
            {
                UserName = normalizedPhone,
                PhoneNumber = normalizedPhone,
                // If Firebase UID is provided it means OTP verification was done on client
                // and we can mark the phone as confirmed.
                PhoneNumberConfirmed = !string.IsNullOrWhiteSpace(request.FirebaseUid),
                Email = null, // Email not required
                EmailConfirmed = false
            };

            // Create user with password hashing
            var result = await _userManager.CreateAsync(user, request.Password);

            if (!result.Succeeded)
            {
                _logger.LogWarning($"User creation failed for phone: {normalizedPhone}. Errors: {string.Join(", ", result.Errors.Select(e => e.Description))}");
                return BadRequest(new
                {
                    success = false,
                    message = "Registration failed.",
                    errors = result.Errors.Select(e => e.Description).ToList()
                });
            }

            // Store first and last name as claims on the Identity user
            if (!string.IsNullOrWhiteSpace(request.FirstName))
            {
                await _userManager.AddClaimAsync(user, new Claim(ClaimTypes.GivenName, request.FirstName));
            }

            if (!string.IsNullOrWhiteSpace(request.LastName))
            {
                await _userManager.AddClaimAsync(user, new Claim(ClaimTypes.Surname, request.LastName));
            }

            // If the client sent a Firebase UID after OTP verification, store it as a claim
            // so we can later correlate the Identity user with the Firebase user.
            if (!string.IsNullOrWhiteSpace(request.FirebaseUid))
            {
                try
                {
                    await _userManager.AddClaimAsync(user, new Claim("firebase_uid", request.FirebaseUid));
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Failed to add firebase_uid claim for user {Phone}", request.PhoneNumber);
                }
            }

            // Also create an AuthUser entry to keep the legacy/auth table in sync
            Guid authGuid = Guid.Empty;
            try
            {
                if (Guid.TryParse(user.Id, out authGuid))
                {
                    var passwordHasher = new Microsoft.AspNetCore.Identity.PasswordHasher<IdentityUser>();
                    var authUser = new AuthUser
                    {
                        Id = authGuid,
                        Email = normalizedPhone + "@phone.investa.local",
                        PasswordHash = passwordHasher.HashPassword(user, request.Password),
                        UserType = Investa.Domain.Entities.Enums.UserType.Client,
                        Status = true
                    };

                    await _unitOfWork.Repository<AuthUser>().AddAsync(authUser);
                    await _unitOfWork.SaveChangesAsync();
                }
                else
                {
                    _logger.LogWarning($"Unable to parse Identity user id to GUID: {user.Id}");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError($"Failed to create AuthUser record: {ex.Message}", ex);
            }

            // Create domain User record so application services (profiles, investments, etc.) have a user entry
            // Set Id to match AuthUser.Id for consistency
            var domainUser = new User
            {
                Id = authGuid != Guid.Empty ? authGuid : Guid.NewGuid(),
                Name = string.IsNullOrWhiteSpace(request.FirstName) && string.IsNullOrWhiteSpace(request.LastName)
                    ? normalizedPhone
                    : ($"{request.FirstName} {request.LastName}").Trim(),
                // Domain.Email is required; use phone-based placeholder to satisfy requirement if email not provided
                Email = normalizedPhone + "@phone.investa.local",
                Role = "Client"
            };

            await _unitOfWork.Repository<User>().AddAsync(domainUser);
            await _unitOfWork.SaveChangesAsync();

            // Create initial UserProfile linked to the domain user
            var profile = new UserProfile
            {
                UserId = domainUser.Id,
                FirstName = request.FirstName,
                LastName = request.LastName,
                FullName = domainUser.Name,
                Phone1 = normalizedPhone,
                Email = null,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            await _unitOfWork.Repository<UserProfile>().AddAsync(profile);
            await _unitOfWork.SaveChangesAsync();

            // Create Client profile linked to the domain user
            var client = new Client
            {
                UserId = domainUser.Id,
                FirstName = request.FirstName,
                LastName = request.LastName,
                MobileNumber = normalizedPhone,
                FirebaseUid = request.FirebaseUid,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                StatusId = 1 // default to Active status (seeded by migrations)
            };

            await _unitOfWork.Repository<Client>().AddAsync(client);
            await _unitOfWork.SaveChangesAsync();

            // Generate JWT token for the newly created user (after AuthUser exists)
            var authResponse = await _jwtTokenService.GenerateTokenAsync(user);

            _logger.LogInformation($"User registered successfully: {request.PhoneNumber} (ID: {user.Id})");

            return Ok(new
            {
                success = true,
                data = authResponse
            });
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error during sign-up: {ex.Message}", ex);
            return StatusCode(StatusCodes.Status500InternalServerError, new
            {
                success = false,
                message = "An error occurred during registration. Please try again.",
                error = ex.Message
            });
        }
    }

    // Demo login: issues JWT for an existing user by email
    [HttpPost("token")]
    [AllowAnonymous]
    public async Task<ActionResult<string>> IssueToken([FromBody] LoginRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Email))
            return BadRequest("Email is required.");

        var user = (await _unitOfWork.Repository<Investa.Domain.Entities.User>().FindAsync(u => u.Email == request.Email)).FirstOrDefault();
        if (user == null)
            return Unauthorized("Invalid credentials.");

        var jwtKey = _configuration["Jwt:Key"] ?? string.Empty;
        var jwtIssuer = _configuration["Jwt:Issuer"] ?? string.Empty;
        var jwtAudience = _configuration["Jwt:Audience"] ?? string.Empty;

        var claims = new List<Claim>
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, user.Email),
            new Claim(ClaimTypes.Name, user.Name),
            new Claim(ClaimTypes.Role, user.Role)
        };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var token = new JwtSecurityToken(
            issuer: jwtIssuer,
            audience: jwtAudience,
            claims: claims,
            expires: DateTime.UtcNow.AddHours(2),
            signingCredentials: creds);

        var tokenString = new JwtSecurityTokenHandler().WriteToken(token);
        return Ok(tokenString);
    }

    public class LoginRequest
    {
        public string Email { get; set; } = string.Empty;
    }

    /// <summary>
    /// Login by phone and password
    /// </summary>
    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<IActionResult> Login([FromBody] Investa.Application.DTOs.Auth.LoginDto request)
    {
        if (string.IsNullOrWhiteSpace(request.PhoneNumber) || string.IsNullOrWhiteSpace(request.Password))
            return BadRequest(new { success = false, message = "Phone number and password are required." });

        var identityUser = await _userManager.FindByNameAsync(request.PhoneNumber);
        if (identityUser == null)
            return Unauthorized(new { success = false, message = "Invalid credentials." });

        var passwordValid = await _userManager.CheckPasswordAsync(identityUser, request.Password);
        if (!passwordValid)
            return Unauthorized(new { success = false, message = "Invalid credentials." });

            // Check if AuthUser exists and whether it's disabled or suspended
            if (Guid.TryParse(identityUser.Id, out var authGuid))
            {
                var authUser = (await _unitOfWork.Repository<Investa.Domain.Entities.AuthUser>().FindAsync(a => a.Id == authGuid)).FirstOrDefault();
                if (authUser != null)
                {
                    if (!authUser.Status)
                        return Unauthorized(new { success = false, message = "Account is disabled." });

                    if (authUser.SuspendedUntil.HasValue && authUser.SuspendedUntil.Value > DateTime.UtcNow)
                        return Unauthorized(new { success = false, message = "Invalid credentials." });
                }
            }

            var authResponse = await _jwtTokenService.GenerateTokenAsync(identityUser);
            return Ok(new { success = true, data = authResponse });
        }

        [HttpPost("request-password-reset")]
        [AllowAnonymous]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> RequestPasswordReset([FromBody] PasswordResetRequestDto request)
        {
            if (string.IsNullOrWhiteSpace(request.PhoneNumber))
                return BadRequest(new { success = false, message = "Phone number is required" });

            var identityUser = await _userManager.FindByNameAsync(request.PhoneNumber);
            if (identityUser == null)
                return NotFound(new { success = false, message = "User not found for this phone number" });

            var token = await _userManager.GeneratePasswordResetTokenAsync(identityUser);

            // Send token by SMS using SMS provider
            var smsMessage = $"Your Investa password reset token is: {token}";
            try
            {
                await _smsSender.SendSmsAsync(request.PhoneNumber, smsMessage);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send password reset SMS to {Phone}", request.PhoneNumber);
                return StatusCode(StatusCodes.Status500InternalServerError, new { success = false, message = "Failed to send password reset SMS" });
            }

            // Do NOT return token in response when SMS is used
            return Ok(new { success = true, message = "Password reset token sent via SMS" });
        }

    [HttpPost("reset-password")]
    [AllowAnonymous]
    public async Task<IActionResult> ResetPassword([FromBody] PasswordResetConfirmDto request)
    {
        if (string.IsNullOrWhiteSpace(request.PhoneNumber) || string.IsNullOrWhiteSpace(request.Token) || string.IsNullOrWhiteSpace(request.NewPassword))
            return BadRequest(new { success = false, message = "Phone, token and new password are required" });

        var identityUser = await _userManager.FindByNameAsync(request.PhoneNumber);
        if (identityUser == null)
            return NotFound(new { success = false, message = "User not found for this phone number" });

        var result = await _userManager.ResetPasswordAsync(identityUser, request.Token, request.NewPassword);
        if (!result.Succeeded)
        {
            return BadRequest(new { success = false, errors = result.Errors.Select(e => e.Description).ToList() });
        }

        return Ok(new { success = true, message = "Password reset successfully" });
    }

    [HttpPost("refresh")]
    [AllowAnonymous]
    public async Task<IActionResult> Refresh([FromBody] RefreshRequestDto request)
    {
        if (string.IsNullOrWhiteSpace(request.RefreshToken))
            return BadRequest(new { success = false, message = "Refresh token is required" });

        var tokenEntity = (await _unitOfWork.Repository<RefreshToken>().FindAsync(rt => rt.Token == request.RefreshToken)).FirstOrDefault();
        if (tokenEntity == null || tokenEntity.Revoked || tokenEntity.ExpiresAt <= DateTime.UtcNow)
            return Unauthorized(new { success = false, message = "Invalid or expired refresh token" });

        var authUser = (await _unitOfWork.Repository<AuthUser>().FindAsync(a => a.Id == tokenEntity.AuthUserId)).FirstOrDefault();
        if (authUser == null)
            return Unauthorized(new { success = false, message = "Invalid token owner" });

        var identityUser = await _userManager.FindByIdAsync(authUser.Id.ToString());
        if (identityUser == null)
            return Unauthorized(new { success = false, message = "Identity user not found" });

        // Revoke old refresh token
        tokenEntity.Revoked = true;
        await _unitOfWork.SaveChangesAsync();

        var newAuth = await _jwtTokenService.GenerateTokenAsync(identityUser);
        return Ok(new { success = true, data = newAuth });
    }
}
