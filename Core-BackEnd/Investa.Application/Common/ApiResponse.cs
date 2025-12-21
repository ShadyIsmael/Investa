using System.Collections.Generic;

namespace Investa.Application.Common;

public class ApiResponse<T>
{
    public bool Status { get; init; }
    public string Message { get; init; } = string.Empty;
    public T? Data { get; init; }
    public IEnumerable<ErrorDto>? Errors { get; init; }

    public static ApiResponse<T> Success(T data, string message = "") =>
        new() { Status = true, Data = data, Message = message, Errors = null };

    public static ApiResponse<T> Fail(IEnumerable<ErrorDto> errors, string message = "") =>
        new() { Status = false, Data = default, Message = message, Errors = errors };
}
