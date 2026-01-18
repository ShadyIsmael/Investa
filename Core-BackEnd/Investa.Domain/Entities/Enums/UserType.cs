namespace Investa.Domain.Entities.Enums;

public enum UserType
{
    // Legacy alias - kept so existing DB records with value "Client" still parse
    Client = 0,

    // Canonical names
    Investor = 0,
    OrgUser = 1,

    // New subtype for client users
    Founder = 2
}