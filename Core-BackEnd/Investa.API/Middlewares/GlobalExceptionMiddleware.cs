using Microsoft.Extensions.Localization;
using System.Net;
using System.Text.Json;
using Investa.Application.Common;

namespace Investa.API.Middlewares;

public class GlobalExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<GlobalExceptionMiddleware> _logger;
    private readonly IStringLocalizer<Resources.SharedResource> _localizer;

    public GlobalExceptionMiddleware(RequestDelegate next, ILogger<GlobalExceptionMiddleware> logger, IStringLocalizer<Resources.SharedResource> localizer)
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
            _logger.LogError(ex, "An unhandled exception occurred.");
            await HandleExceptionAsync(context, ex);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.ContentType = "application/json";
        context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;

        var errorMessage = _localizer["InternalServerError"] ?? "An internal server error occurred.";

        if (exception is ArgumentException)
        {
            context.Response.StatusCode = (int)HttpStatusCode.BadRequest;
            errorMessage = exception.Message;
        }
        else if (exception.Message.Contains("not found"))
        {
            context.Response.StatusCode = (int)HttpStatusCode.NotFound;
            errorMessage = exception.Message;
        }
        else if (exception.Message.Contains("Insufficient"))
        {
            context.Response.StatusCode = (int)HttpStatusCode.BadRequest;
            errorMessage = exception.Message;
        }

        var apiError = new ErrorDto("Exception", errorMessage);
        var apiResponse = ApiResponse<object>.Fail(new[] { apiError }, errorMessage);

        context.Response.ContentType = "application/json";
        await context.Response.WriteAsync(JsonSerializer.Serialize(apiResponse));
    }
}