using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Investa.Domain.Entities;

public class Investment
{
    [Key]
    public int Id { get; set; }

    [Required]
    public int InvestorId { get; set; }

    [Required]
    public int ProjectId { get; set; }

    [Range(0, double.MaxValue)]
    public decimal Amount { get; set; }

    [Required]
    public DateTime Date { get; set; }

    // Navigation properties
    [ForeignKey(nameof(InvestorId))]
    public User Investor { get; set; } = null!;

    [ForeignKey(nameof(ProjectId))]
    public Project Project { get; set; } = null!;
}