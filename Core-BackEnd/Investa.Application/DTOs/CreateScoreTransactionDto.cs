using System;

namespace Investa.Application.DTOs;

public class CreateScoreTransactionDto
{
    public Guid UserId { get; set; }
    public decimal Score { get; set; }
    public int TransactionTypeId { get; set; }
    public Guid? ReviewerId { get; set; }
}