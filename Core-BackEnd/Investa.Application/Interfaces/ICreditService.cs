using System;
using Investa.Application.DTOs;

namespace Investa.Application.Interfaces;

public interface ICreditService
{
    Task<CreditTransactionDto> CreateTransactionAsync(Guid userId, decimal amount, string type, string? description = null, int? referenceId = null);
    Task<IEnumerable<CreditTransactionDto>> GetClientTransactionsAsync(Guid userId);
    Task<IEnumerable<TimeSeriesPointDto>> GetClientCreditTimeseriesAsync(Guid userId, DateTime from, DateTime to, string metric = "balance", string interval = "month");
    Task<IEnumerable<TimeSeriesPointDto>> GetAllClientsCreditMonthlySumAsync(DateTime from, DateTime to);
    Task<IEnumerable<MonthlyCreditSumDto>> GetAllClientsCreditMonthlySumByNameAsync(DateTime from, DateTime to);
} 
