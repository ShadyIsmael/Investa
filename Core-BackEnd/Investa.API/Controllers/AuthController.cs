using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;
using Microsoft.AspNetCore.Authorization;
using Investa.Application.Interfaces;
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

    public AuthController(
        UserManager<IdentityUser> userManager,
        IJwtTokenService jwtTokenService,
        ILogger<AuthController> logger,
        IUnitOfWork unitOfWork,
        IConfiguration configuration)
    {
        _userManager = userManager;
        _jwtTokenService = jwtTokenService;
        _logger = logger;
        _unitOfWork = unitOfWork;
        _configuration = configuration;
    }

    /// <summary>
    /// Registers a new user with phone number and password.
    /// Phone number is used as the unique username identifier.
    /// Validates phone number format (Egyptian phone numbers) and password strength.
    /// Returns JWT token on successful registration.
    /// </summary>
    /// <param name="request">RegisterDto containing phone number and password</param>
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

            // Create new IdentityUser with phone number as username
            var user = new IdentityUser
            {
                UserName = request.PhoneNumber,
                PhoneNumber = request.PhoneNumber,
                PhoneNumberConfirmed = false, // Phone not verified yet
                Email = null, // Email not required
                EmailConfirmed = false
            };

            // Create user with password hashing
            var result = await _userManager.CreateAsync(user, request.Password);

            if (!result.Succeeded)
            {
                _logger.LogWarning($"User creation failed for phone: {request.PhoneNumber}. Errors: {string.Join(", ", result.Errors.Select(e => e.Description))}");
                return BadRequest(new
                {
                    success = false,
                    message = "Registration failed.",
                    errors = result.Errors.Select(e => e.Description).ToList()
                });
            }

            // Generate JWT token for the newly created user
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
}
