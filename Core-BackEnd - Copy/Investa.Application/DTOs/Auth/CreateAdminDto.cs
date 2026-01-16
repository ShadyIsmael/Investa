namespace Investa.Application.DTOs.Auth;

/// <summary>
/// DTO for creating an admin user
/// </summary>
public class CreateAdminDto
{
    /// <summary>
    /// Admin user email address
    /// </summary>
    public string Email { get; set; } = string.Empty;

    /// <summary>
    /// Admin user password
    /// </summary>
    public string Password { get; set; } = string.Empty;

    /// <summary>
    /// Admin first name (optional)
    /// </summary>
    public string FirstName { get; set; } = string.Empty;

    /// <summary>
    /// Admin last name (optional)
    /// </summary>
    public string LastName { get; set; } = string.Empty;
}
