using System.ComponentModel.DataAnnotations;
using Investa.Domain.Entities.Enums;

namespace Investa.Domain.Entities;

public class User
{
    [Key]
    public int Id { get; set; }

    [Required]
    [StringLength(100)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    [StringLength(150)]
    public string Email { get; set; } = string.Empty;

    [Required]
    [StringLength(50)]
    public string Role { get; set; } = string.Empty;

    /// <summary>
    /// Client type for user classification (Investor, Founder, Both).
    /// Default: Investor. (Note: Access permissions are unified regardless of type)
    /// </summary>
    public ClientType ClientType { get; set; } = ClientType.Investor;

    public int CredibilityScore { get; set; } = 3500;

    [Range(0, double.MaxValue)]
    public decimal WalletBalance { get; set; }

    // Navigation properties
    public ICollection<Investment> Investments { get; set; } = new List<Investment>();
    public ICollection<Transaction> Transactions { get; set; } = new List<Transaction>();
    
    /// <summary>
    /// One-to-one relationship with UserProfile for extended user information.
    /// </summary>
    public UserProfile? Profile { get; set; }
}