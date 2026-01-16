namespace Investa.Application.DTOs;

public class UserDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public int CredibilityScore { get; set; }
    public decimal WalletBalance { get; set; }
}
