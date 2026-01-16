using Investa.Application.DTOs.Auth;
using Investa.Domain.Entities;
using Investa.Domain.Entities.Enums;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Investa.Application.Interfaces;
using Investa.Infrastructure.Repositories;using Investa.Domain.Entities.Security;using Microsoft.IdentityModel.Tokens;
using System.Text;

namespace Investa.API.Controllers;

/// <summary>
/// Authentication controller handling user registration, login, and token management
/// </summary>
[Authorize(AuthenticationSchemes = "Bearer")]
public class AuthController : BaseApiController
{
    private readonly UserManager<IdentityUser> _userManager;
    private readonly IJwtTokenService _jwtTokenService;
    private readonly ILogger<AuthController> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IConfiguration _configuration;
    private readonly ISmsSender _smsSender;

    public AuthController(
        UserManager<IdentityUser> userManager,
        IJwtTokenService jwtTokenService,
        ILogger<AuthController> logger,
        IUnitOfWork unitOfWork,
        IConfiguration configuration,
        ISmsSender smsSender)
    {
        _userManager = userManager;
        _jwtTokenService = jwtTokenService;
        _logger = logger;
        _unitOfWork = unitOfWork;
        _configuration = configuration;
        _smsSender = smsSender;
    }    

    /// <summary>
    /// Register a new user with phone number and password
    /// </summary>
    [HttpPost("register")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(ApiResponse<AuthResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> RegisterAsync([FromBody] RegisterDto request)
    {
        if (string.IsNullOrWhiteSpace(request.PhoneNumber) || string.IsNullOrWhiteSpace(request.Password))
            return ErrorResponse("Phone number and password are required", 400);

        var normalizedPhone = request.PhoneNumber?.Trim().Replace(" ", "") ?? string.Empty;
        var existingUser = await _userManager.FindByNameAsync(normalizedPhone);
        if (existingUser != null)
            return ErrorResponse("This phone number is already registered", 409);

        try
        {
            var user = new IdentityUser
            {
                UserName = normalizedPhone,
                PhoneNumber = normalizedPhone,
                PhoneNumberConfirmed = !string.IsNullOrWhiteSpace(request.FirebaseUid)
            };

            var result = await _userManager.CreateAsync(user, request.Password);
            if (!result.Succeeded)
            {
                var errors = result.Errors.Select(e => e.Description).ToList();
                return ErrorResponse("Registration failed", 400, errors);
            }

            // Add claims
            if (!string.IsNullOrWhiteSpace(request.FirstName))
                await _userManager.AddClaimAsync(user, new Claim(ClaimTypes.GivenName, request.FirstName));

            if (!string.IsNullOrWhiteSpace(request.LastName))
                await _userManager.AddClaimAsync(user, new Claim(ClaimTypes.Surname, request.LastName));

            if (!string.IsNullOrWhiteSpace(request.FirebaseUid))
                await _userManager.AddClaimAsync(user, new Claim("firebase_uid", request.FirebaseUid));

            // Create domain entities
            if (Guid.TryParse(user.Id, out var authGuid))
            {
                var passwordHasher = new PasswordHasher<IdentityUser>();
                var authUser = new AuthUser
                {
                    Id = authGuid,
                    Email = $"{normalizedPhone}@phone.investa.local",
                    PasswordHash = passwordHasher.HashPassword(user, request.Password),
                    UserType = UserType.Client,
                    Status = true
                };
                await _unitOfWork.Repository<AuthUser>().AddAsync(authUser);

                var domainUser = new User
                {
                    Id = authGuid,
                    Name = string.IsNullOrWhiteSpace(request.FirstName) && string.IsNullOrWhiteSpace(request.LastName)
                        ? normalizedPhone
                        : ($"{request.FirstName} {request.LastName}").Trim(),
                    Email = $"{normalizedPhone}@phone.investa.local",
                    Role = "Client"
                };
                await _unitOfWork.Repository<User>().AddAsync(domainUser);

                var profile = new UserProfile
                {
                    UserId = authGuid,
                    FirstName = request.FirstName,
                    LastName = request.LastName,
                    FullName = domainUser.Name,
                    Phone1 = normalizedPhone,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };
                await _unitOfWork.Repository<UserProfile>().AddAsync(profile);

                var client = new Client
                {
                    UserId = authGuid,
                    FirstName = request.FirstName,
                    LastName = request.LastName,
                    MobileNumber = normalizedPhone,
                    FirebaseUid = request.FirebaseUid,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow,
                    StatusId = 1
                };
                await _unitOfWork.Repository<Client>().AddAsync(client);

                await _unitOfWork.SaveChangesAsync();
            }

            var authResponse = await _jwtTokenService.GenerateTokenAsync(user);
            _logger.LogInformation("User registered successfully: {Phone} (ID: {UserId})", normalizedPhone, user.Id);

            return SuccessResponse(authResponse, "User registered successfully", 201);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during sign-up for phone: {Phone}", request.PhoneNumber);
            return ErrorResponse("An error occurred during registration", 500);
        }
    }

    /// <summary>
    /// Login with phone number and password
    /// </summary>
    [HttpPost("login")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(ApiResponse<AuthResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> LoginAsync([FromBody] LoginDto request)
    {
        if (string.IsNullOrWhiteSpace(request.PhoneNumber) || string.IsNullOrWhiteSpace(request.Password))
            return ErrorResponse("Phone number and password are required", 400);

        var normalizedPhone = request.PhoneNumber.Trim().Replace(" ", "");
        var identityUser = await _userManager.FindByNameAsync(normalizedPhone);
        if (identityUser == null)
            return ErrorResponse("Invalid credentials", 401);

        var passwordValid = await _userManager.CheckPasswordAsync(identityUser, request.Password);
        if (!passwordValid)
            return ErrorResponse("Invalid credentials", 401);

        // Check account status
        if (Guid.TryParse(identityUser.Id, out var authGuid))
        {
            var authUser = (await _unitOfWork.Repository<AuthUser>().FindAsync(a => a.Id == authGuid)).FirstOrDefault();
            if (authUser != null)
            {
                if (!authUser.Status)
                    return ErrorResponse("Account is disabled", 401);

                if (authUser.SuspendedUntil.HasValue && authUser.SuspendedUntil.Value > DateTime.UtcNow)
                    return ErrorResponse("Account is suspended", 401);
            }
        }

        var authResponse = await _jwtTokenService.GenerateTokenAsync(identityUser);
        return SuccessResponse(authResponse, "Login successful");
    }

    /// <summary>
    /// Login using email and password (for admin users)
    /// </summary>
    [HttpPost("login-email")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(ApiResponse<AuthResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> LoginByEmail([FromBody] LoginEmailDto request)
    {
        if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
            return ErrorResponse("Email and password are required", 400);

        var normalizedEmail = request.Email.Trim().ToLowerInvariant();
        var identityUser = await _userManager.FindByEmailAsync(normalizedEmail);
        if (identityUser == null)
            return ErrorResponse("Invalid credentials", 401);

        var passwordValid = await _userManager.CheckPasswordAsync(identityUser, request.Password);
        if (!passwordValid)
            return ErrorResponse("Invalid credentials", 401);

        // Optional: check AuthUser status if present
        if (Guid.TryParse(identityUser.Id, out var authGuid))
        {
            var authUser = (await _unitOfWork.Repository<AuthUser>().FindAsync(a => a.Id == authGuid)).FirstOrDefault();
            if (authUser != null)
            {
                if (!authUser.Status)
                    return ErrorResponse("Account is disabled", 401);

                if (authUser.SuspendedUntil.HasValue && authUser.SuspendedUntil.Value > DateTime.UtcNow)
                    return ErrorResponse("Account suspended", 401);
            }
        }

        var authResponse = await _jwtTokenService.GenerateTokenAsync(identityUser);
        return SuccessResponse(authResponse, "Login successful");
    }

    /// <summary>
    /// Request password reset via SMS
    /// </summary>
    [HttpPost("request-password-reset")]
    [AllowAnonymous]
    public async Task<IActionResult> RequestPasswordResetAsync([FromBody] PasswordResetRequestDto request)
    {
        if (string.IsNullOrWhiteSpace(request.PhoneNumber))
            return ErrorResponse("Phone number is required", 400);

        var identityUser = await _userManager.FindByNameAsync(request.PhoneNumber);
        if (identityUser == null)
            return ErrorResponse("User not found", 404);

        try
        {
            var token = await _userManager.GeneratePasswordResetTokenAsync(identityUser);
            var smsMessage = $"Your Investa password reset token is: {token}";
            await _smsSender.SendSmsAsync(request.PhoneNumber, smsMessage);

            _logger.LogInformation("Password reset token sent to: {Phone}", request.PhoneNumber);
            return SuccessResponse(message: "Password reset token sent via SMS");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send password reset SMS to: {Phone}", request.PhoneNumber);
            return ErrorResponse("Failed to send password reset token", 500);
        }
    }

    /// <summary>
    /// Reset password with token
    /// </summary>
    [HttpPost("reset-password")]
    [AllowAnonymous]
    public async Task<IActionResult> ResetPasswordAsync([FromBody] PasswordResetConfirmDto request)
    {
        if (string.IsNullOrWhiteSpace(request.PhoneNumber) || 
            string.IsNullOrWhiteSpace(request.Token) || 
            string.IsNullOrWhiteSpace(request.NewPassword))
            return ErrorResponse("Phone, token, and new password are required", 400);

        var identityUser = await _userManager.FindByNameAsync(request.PhoneNumber);
        if (identityUser == null)
            return ErrorResponse("User not found", 404);

        var result = await _userManager.ResetPasswordAsync(identityUser, request.Token, request.NewPassword);
        if (!result.Succeeded)
            return ErrorResponse("Password reset failed", 400, result.Errors.Select(e => e.Description));

        _logger.LogInformation("Password reset successfully for: {Phone}", request.PhoneNumber);
        return SuccessResponse(message: "Password reset successfully");
    }

    /// <summary>
    /// Refresh access token using refresh token
    /// </summary>
    [HttpPost("refresh")]
    [AllowAnonymous]
    public async Task<IActionResult> RefreshAsync([FromBody] RefreshRequestDto request)
    {
        if (string.IsNullOrWhiteSpace(request.RefreshToken))
            return ErrorResponse("Refresh token is required", 400);

        var tokenEntity = (await _unitOfWork.Repository<RefreshToken>()
            .FindAsync(rt => rt.Token == request.RefreshToken && !rt.Revoked && rt.ExpiresAt > DateTime.UtcNow))
            .FirstOrDefault();

        if (tokenEntity == null)
            return ErrorResponse("Invalid or expired refresh token", 401);

        var authUser = (await _unitOfWork.Repository<AuthUser>()
            .FindAsync(a => a.Id == tokenEntity.AuthUserId))
            .FirstOrDefault();

        if (authUser == null)
            return ErrorResponse("Invalid token owner", 401);

        var identityUser = await _userManager.FindByIdAsync(authUser.Id.ToString());
        if (identityUser == null)
            return ErrorResponse("User not found", 401);

        // Revoke old refresh token
        tokenEntity.Revoked = true;
        await _unitOfWork.SaveChangesAsync();

        var newAuth = await _jwtTokenService.GenerateTokenAsync(identityUser);
        return SuccessResponse(newAuth, "Token refreshed successfully");
    }

    /// <summary>
    /// Create an admin user (restricted endpoint)
    /// </summary>
    [HttpPost("create-admin")]
    [Authorize(Roles = nameof(UserRoles.Admin))]
    public async Task<IActionResult> CreateAdminAsync([FromBody] CreateAdminDto request)
    {
        if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
            return ErrorResponse("Email and password are required", 400);

        var normalizedEmail = request.Email.Trim().ToLowerInvariant();
        var existingUser = await _userManager.FindByEmailAsync(normalizedEmail);
        if (existingUser != null)
            return ErrorResponse("A user with this email already exists", 409);

        try
        {
            var guid = Guid.NewGuid();
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
                return ErrorResponse("User creation failed", 400, result.Errors.Select(e => e.Description));

            if (!string.IsNullOrWhiteSpace(request.FirstName))
                await _userManager.AddClaimAsync(user, new Claim(ClaimTypes.GivenName, request.FirstName));

            if (!string.IsNullOrWhiteSpace(request.LastName))
                await _userManager.AddClaimAsync(user, new Claim(ClaimTypes.Surname, request.LastName));

            // Create domain entities
            var passwordHasher = new PasswordHasher<IdentityUser>();
            var authUser = new AuthUser
            {
                Id = guid,
                Email = normalizedEmail,
                PasswordHash = passwordHasher.HashPassword(user, request.Password),
                UserType = UserType.OrgUser,
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
                Role = "Admin"
            };
            await _unitOfWork.Repository<User>().AddAsync(domainUser);
            await _unitOfWork.SaveChangesAsync();

            _logger.LogInformation("Admin user created: {Email} (ID: {UserId})", request.Email, user.Id);
            return SuccessResponse("Admin user created successfully", 201);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to create admin user: {Email}", request.Email);
            return ErrorResponse("Failed to create admin user", 500);
        }
    }

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
}