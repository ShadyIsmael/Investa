using System;
namespace Investa.Application.Common;
/// <summary>
/// Domain-level business validation error.
/// Mapped to HTTP 400 by the global exception filter / controller base.
/// </summary>
public class BusinessValidationException : Exception
{
    public string Code { get; }
    public BusinessValidationException(string code, string message) : base(message)
    {
        Code = code;
    }
    public BusinessValidationException(string message) : base(message)
    {
        Code = "BUSINESS_VALIDATION";
    }
}
