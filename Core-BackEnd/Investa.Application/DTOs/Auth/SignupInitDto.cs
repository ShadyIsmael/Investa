namespace Investa.Application.DTOs.Auth;

using Investa.Domain.Entities.Enums;

public class SignupInitDto
{
    public string PhoneNumber { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    /// <summary>Capability requested for the new client account. Both is reserved for controlled account administration.</summary>
    public ClientType ClientType { get; set; } = ClientType.Investor;
}
