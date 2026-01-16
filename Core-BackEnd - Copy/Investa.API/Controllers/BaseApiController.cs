using Microsoft.AspNetCore.Mvc;

namespace Investa.API.Controllers;

/// <summary>
/// Base controller class providing common functionality for all API controllers
/// Includes standard response formatting, logging, and error handling
/// </summary>
[ApiController]
[Route("api/v1/[controller]")]
[Produces("application/json")]
public abstract class BaseApiController : ControllerBase
{
    /// <summary>
    /// Standard success response
    /// </summary>
    protected IActionResult SuccessResponse<T>(T data, string? message = "Operation completed successfully", int statusCode = 200)
    {
        return StatusCode(statusCode, new ApiResponse<T>
        {
            Success = true,
            Message = message,
            Data = data
        });
    }

    /// <summary>
    /// Standard success response without data
    /// </summary>
    protected IActionResult SuccessResponse(string? message = "Operation completed successfully", int statusCode = 200)
    {
        return StatusCode(statusCode, new ApiResponse<object>
        {
            Success = true,
            Message = message,
            Data = null
        });
    }

    /// <summary>
    /// Standard error response
    /// </summary>
    protected IActionResult ErrorResponse(string message, int statusCode = 400, object? errors = null)
    {
        return StatusCode(statusCode, new ApiResponse<object>
        {
            Success = false,
            Message = message,
            Data = errors
        });
    }

    /// <summary>
    /// Standard paginated response
    /// </summary>
    protected IActionResult PaginatedResponse<T>(IEnumerable<T> data, int pageNumber, int pageSize, int totalCount, string? message = null)
    {
        var totalPages = (int)Math.Ceiling((double)totalCount / pageSize);
        return Ok(new PaginatedApiResponse<T>
        {
            Success = true,
            Message = message ?? "Operation completed successfully",
            Data = data,
            PageNumber = pageNumber,
            PageSize = pageSize,
            TotalCount = totalCount,
            TotalPages = totalPages,
            HasNextPage = pageNumber < totalPages,
            HasPreviousPage = pageNumber > 1
        });
    }
}

/// <summary>
/// Generic API response wrapper
/// </summary>
public class ApiResponse<T>
{
    /// <summary>
    /// Indicates if the operation was successful
    /// </summary>
    public bool Success { get; set; }

    /// <summary>
    /// Descriptive message for the response
    /// </summary>
    public string Message { get; set; } = string.Empty;

    /// <summary>
    /// Response data payload
    /// </summary>
    public T? Data { get; set; }

    /// <summary>
    /// Timestamp when the response was generated
    /// </summary>
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
}

/// <summary>
/// Paginated API response wrapper
/// </summary>
public class PaginatedApiResponse<T>
{
    /// <summary>
    /// Indicates if the operation was successful
    /// </summary>
    public bool Success { get; set; }

    /// <summary>
    /// Descriptive message for the response
    /// </summary>
    public string Message { get; set; } = string.Empty;

    /// <summary>
    /// Response data payload
    /// </summary>
    public IEnumerable<T>? Data { get; set; }

    /// <summary>
    /// Current page number (1-indexed)
    /// </summary>
    public int PageNumber { get; set; }

    /// <summary>
    /// Number of items per page
    /// </summary>
    public int PageSize { get; set; }

    /// <summary>
    /// Total count of items
    /// </summary>
    public int TotalCount { get; set; }

    /// <summary>
    /// Total number of pages
    /// </summary>
    public int TotalPages { get; set; }

    /// <summary>
    /// Whether there is a next page
    /// </summary>
    public bool HasNextPage { get; set; }

    /// <summary>
    /// Whether there is a previous page
    /// </summary>
    public bool HasPreviousPage { get; set; }

    /// <summary>
    /// Timestamp when the response was generated
    /// </summary>
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
}
