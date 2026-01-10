using System;

namespace Investa.Application.DTOs;

public class CreditTransactionDto
{
    public int Id { get; set; }
    public Guid UserId { get; set; }
    public decimal Amount { get; set; }
    public string? Type { get; set; }
    public int? ReferenceId { get; set; }
    public string? Description { get; set; }
    public DateTime CreatedAt { get; set; }
} 
