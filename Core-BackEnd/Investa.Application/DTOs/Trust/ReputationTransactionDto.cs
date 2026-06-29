namespace Investa.Application.DTOs.Trust;

public class ReputationTransactionDto
{
    public int Id { get; set; }
    public Guid UserId { get; set; }
    public int? ReputationRuleId { get; set; }
    public string? RuleCode { get; set; }
    public int Points { get; set; }
    public string? Reason { get; set; }
    public string? ReferenceId { get; set; }
    public string? ReferenceType { get; set; }
    public DateTime OccurredAt { get; set; }
}