using System;

namespace Investa.Application.DTOs.Auth;

/// <summary>
/// DTO for refresh token requests
/// </summary>
public class RefreshRequestDto
{
    /// <summary>
    /// Refresh token string provided by the client
    /// </summary>
    public string RefreshToken { get; set; } = string.Empty;
}
