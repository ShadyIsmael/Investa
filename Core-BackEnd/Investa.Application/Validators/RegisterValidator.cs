using FluentValidation;
using Investa.Application.DTOs.Auth;
using System.Text.RegularExpressions;

namespace Investa.Application.Validators;

/// <summary>
/// Validator for user registration using FluentValidation
/// Validates Egyptian phone number formats and password requirements
/// </summary>
public class RegisterValidator : AbstractValidator<RegisterDto>
{
    public RegisterValidator()
    {
        // Phone number validation - Egyptian phone numbers
        RuleFor(x => x.PhoneNumber)
            .NotEmpty().WithMessage("Phone number is required.")
            .Must(IsValidEgyptianPhoneNumber).WithMessage("Invalid Egyptian phone number format. " +
                "Expected formats: +20XXXXXXXXXX, 020XXXXXXXXX, or 01XXXXXXXXX");

        // Password validation
        RuleFor(x => x.Password)
            .NotEmpty().WithMessage("Password is required.")
            .MinimumLength(8).WithMessage("Password must be at least 8 characters long.")
            .Matches(@"[A-Z]").WithMessage("Password must contain at least one uppercase letter.")
            .Matches(@"[a-z]").WithMessage("Password must contain at least one lowercase letter.")
            .Matches(@"[0-9]").WithMessage("Password must contain at least one digit.")
            .Matches(@"[!@#$%^&*()_+\-=\[\]{};:'"",.<>?/\\|`~]")
            .WithMessage("Password must contain at least one special character.");
    }

    /// <summary>
    /// Validates Egyptian phone number formats
    /// Accepted formats:
    /// - +20XXXXXXXXXX (international format, 12 digits total)
    /// - 020XXXXXXXXX (Vodafone, 11 digits)
    /// - 01XXXXXXXXX (Etisalat, Mobinil, etc., 11 digits starting with 01)
    /// </summary>
    private bool IsValidEgyptianPhoneNumber(string phoneNumber)
    {
        if (string.IsNullOrWhiteSpace(phoneNumber))
            return false;

        // Remove spaces and dashes
        var cleaned = phoneNumber.Replace(" ", "").Replace("-", "");

        // Pattern 1: International format +20XXXXXXXXXX (12 digits)
        var pattern1 = @"^\+20\d{10}$";

        // Pattern 2: Vodafone Egypt 020XXXXXXXXX (11 digits)
        var pattern2 = @"^020\d{8}$";

        // Pattern 3: Other Egyptian operators 01XXXXXXXXX (11 digits starting with 01)
        var pattern3 = @"^01[0-2]\d{8}$"; // 010, 011, 012 are valid first 3 digits

        return Regex.IsMatch(cleaned, pattern1) ||
               Regex.IsMatch(cleaned, pattern2) ||
               Regex.IsMatch(cleaned, pattern3);
    }
}
