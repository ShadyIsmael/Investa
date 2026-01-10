using System;

namespace Investa.Application.DTOs;

public class ScoreTransactionDto
{
    public int Id { get; set; }
    public Guid UserId { get; set; }
    public decimal Score { get; set; }
    public int TransactionTypeId { get; set; }
    public string? TransactionTypeKey { get; set; }
    public Guid? ReviewerId { get; set; }
    public DateTime CreatedAt { get; set; }
}