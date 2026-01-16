using Investa.Domain.Entities;

namespace Investa.Application.DTOs;

public class TransactionDto
{
    public int Id { get; set; }
    public int WalletId { get; set; }
    public decimal Amount { get; set; }
    public TransactionType Type { get; set; }
    public DateTime Timestamp { get; set; }
}
