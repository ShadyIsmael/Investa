using Microsoft.Extensions.Localization;
using System.Net;
using System.Text.Json;
using Investa.Application.Common;

namespace Investa.API.Middlewares;

/// <summary>
/// Global exception handler middleware - ensures all errors return consistent JSON responses
/// Part of Clean Architecture - Presentation Layer
/// </summary>
public class GlobalExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<GlobalExceptionMiddleware> _logger;
    private readonly IStringLocalizer<Resources.SharedResource> _localizer;

    public GlobalExceptionMiddleware(
        RequestDelegate next, 
        ILogger<GlobalExceptionMiddleware> logger, 
        IStringLocalizer<Resources.SharedResource> localizer)
    {
        _next = next;
        _logger = logger;
        _localizer = localizer;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            var serverName = Environment.MachineName;
            _logger.LogError(ex, "[{Server}] Unhandled exception occurred: {Message}", serverName, ex.Message);
            await HandleExceptionAsync(context, ex);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        var serverName = Environment.MachineName;
        
        context.Response.ContentType = "application/json";
        context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;

        var errorMessage = _localizer["InternalServerError"] ?? "An internal server error occurred.";

        // Map specific exception types to appropriate status codes
        if (exception is ArgumentException or ArgumentNullException)
        {
            context.Response.StatusCode = (int)HttpStatusCode.BadRequest;
            errorMessage = exception.Message;
        }
        else if (exception is UnauthorizedAccessException)
        {
            context.Response.StatusCode = (int)HttpStatusCode.Unauthorized;
            errorMessage = exception.Message;
        }
        else if (exception.Message.Contains("not found", StringComparison.OrdinalIgnoreCase))
        {
            context.Response.StatusCode = (int)HttpStatusCode.NotFound;
            errorMessage = exception.Message;
        }
        else if (exception.Message.Contains("Insufficient", StringComparison.OrdinalIgnoreCase))
        {
            context.Response.StatusCode = (int)HttpStatusCode.BadRequest;
            errorMessage = exception.Message;
        }

        var apiError = new ErrorDto("Exception", errorMessage);
        var apiResponse = ApiResponse<object>.Fail(new[] { apiError }, errorMessage);

        // Add server identity to response for debugging
        context.Response.Headers["X-Server-Name"] = serverName;

        var jsonOptions = new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            WriteIndented = false
        };

        await context.Response.WriteAsync(JsonSerializer.Serialize(apiResponse, jsonOptions));
    }
}