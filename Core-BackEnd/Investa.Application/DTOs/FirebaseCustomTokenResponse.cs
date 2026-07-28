namespace Investa.Application.DTOs;

public class FirebaseCustomTokenResponse
{
    public string CustomToken { get; set; } = string.Empty;
    public int ExpiresInSeconds { get; set; } = 3600;
}