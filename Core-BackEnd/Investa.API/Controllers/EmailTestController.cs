using System.ComponentModel.DataAnnotations;
using System.Net;
using System.Text.Encodings.Web;
using Investa.API.Controllers;
using Investa.Application.DTOs;
using Investa.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;



namespace Investa.API.Controllers;

[AllowAnonymous]
public class EmailTestController : BaseApiController
{
    private readonly IEmailService _emailService;
    private readonly ILogger<EmailTestController> _logger;
    private readonly IWebHostEnvironment _env;
    private readonly EmailOptions _emailOptions;

    public EmailTestController(
        IEmailService emailService,
        ILogger<EmailTestController> logger,
        IWebHostEnvironment env,
        IOptions<EmailOptions> emailOptions)
    {
        _emailService = emailService;
        _logger = logger;
        _env = env;
        _emailOptions = emailOptions.Value;
    }

    public class EmailTestRequest
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;
    }

    [HttpPost("/api/v1/email/test")]
    public async Task<IActionResult> Test([FromBody] EmailTestRequest request, CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var recipient = request.Email;
        var subject = "Welcome to Investa 🚀";

        try
        {
            _logger.LogInformation("Recipient={Recipient} Subject={Subject}", recipient, subject);

            var connectionVerified = await _emailService.VerifyConnectionAsync(cancellationToken);
            if (!connectionVerified)
                throw new InvalidOperationException("SMTP connection verification failed.");

            _logger.LogInformation("SMTP connected. Host={Host} Port={Port}", _emailOptions.Host, _emailOptions.Port);

            var templatesPath = Path.Combine(_env.ContentRootPath, "Templates");
            var welcomeTemplatePath = Path.Combine(templatesPath, "Welcome.html");

            if (!System.IO.File.Exists(welcomeTemplatePath))
                throw new FileNotFoundException("Welcome email template not found.", welcomeTemplatePath);

            var htmlTemplate = await System.IO.File.ReadAllTextAsync(welcomeTemplatePath, cancellationToken);
            var currentYear = DateTime.UtcNow.Year.ToString();

            var htmlBody = ReplacePlaceholders(
                htmlTemplate,
                new Dictionary<string, string?>
                {
                    ["UserName"] = "Shady",
                    ["PlatformName"] = "Investa",
                    ["CurrentYear"] = currentYear,
                    ["CompanyName"] = "Investa"
                });

            var emailRequest = new SendEmailRequest
            {
                To = recipient,
                Subject = subject,
                HtmlBody = htmlBody
            };

            await _emailService.SendEmailAsync(emailRequest, cancellationToken);

            _logger.LogInformation("SMTP authenticated. Username={Username}", _emailOptions.Username);
            _logger.LogInformation("Email sent successfully. To={Email} Subject={Subject}", recipient, subject);

            return Ok(new ApiResponse<object>
            {
                Success = true,
                Message = "Email sent successfully.",
                Data = new
                {
                    Recipient = recipient,
                    Subject = subject,
                    SmtpConnected = true,
                    SmtpAuthenticated = true,
                    EmailSent = true
                }
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Email test endpoint failed. Email={Email} Subject={Subject}", recipient, subject);
            return StatusCode(500, new ApiResponse<object>
            {
                Success = false,
                Message = "Failed to send email.",
                Data = new
                {
                    ExceptionMessage = ex.Message,
                    StackTrace = ex.StackTrace,
                    Recipient = recipient,
                    Subject = subject
                }
            });
        }
    }

    private static string ReplacePlaceholders(string template, Dictionary<string, string?> values)
    {
        if (values.Count == 0) return template;

        var result = template;
        foreach (var kv in values)
        {
            var safeValue = kv.Value ?? string.Empty;
            result = result.Replace($"{{{{{kv.Key}}}}}", WebUtility.HtmlEncode(safeValue), StringComparison.OrdinalIgnoreCase);
        }

        return result;
    }
}

