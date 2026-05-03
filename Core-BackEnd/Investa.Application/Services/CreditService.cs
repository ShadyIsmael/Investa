using AutoMapper;
using Investa.Application.DTOs;
using Investa.Application.Interfaces;
using System.Globalization;
using Investa.Domain.Entities;

namespace Investa.Application.Services;

public class CreditService : ICreditService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public CreditService(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<CreditTransactionDto> CreateTransactionAsync(Guid userId, decimal amount, string type, string? description = null, int? referenceId = null)
    {
        // Prefer client credit ledger, but support wallet-only users as fallback.
        var client = (await _unitOfWork.Repository<Client>().FindAsync(c => c.UserId == userId)).FirstOrDefault();
        var user = await _unitOfWork.Repository<User>().GetByIdAsync(userId);
        if (client == null && user == null)
        {
            throw new InvalidOperationException($"User for id {userId} not found");
        }

        // Validate balance before creating transaction.
        if (amount < 0)
        {
            if (client != null && client.Credit + amount < 0)
            {
                throw new InvalidOperationException("Insufficient credits");
            }

            if (client == null && user != null && user.WalletBalance + amount < 0)
            {
                throw new InvalidOperationException("Insufficient credits");
            }
        }

        // Create transaction with bilingual justification (backward compatibility)
        var tx = new CreditTransaction
        {
            UserId = userId,
            Amount = amount,
            JustificationAr = description ?? "تعديل الرصيد",
            JustificationEn = description ?? "Credit adjustment",
            CreatedAt = DateTime.UtcNow
        };

        await _unitOfWork.Repository<CreditTransaction>().AddAsync(tx);

        // Update balances (keep both in sync when available)
        if (client != null)
        {
            client.Credit += amount;
            await _unitOfWork.Repository<Client>().UpdateAsync(client);
        }

        if (user != null)
        {
            user.WalletBalance += amount;
            await _unitOfWork.Repository<User>().UpdateAsync(user);
        }

        await _unitOfWork.SaveChangesAsync();

        return _mapper.Map<CreditTransactionDto>(tx);
    }

    public async Task<IEnumerable<CreditTransactionDto>> GetClientTransactionsAsync(Guid userId)
    {
        var transactions = await _unitOfWork.Repository<CreditTransaction>().FindAsync(ct => ct.UserId == userId);
        return transactions.Select(tx => _mapper.Map<CreditTransactionDto>(tx));
    }

    public async Task<IEnumerable<TimeSeriesPointDto>> GetClientCreditTimeseriesAsync(Guid userId, DateTime from, DateTime to, string metric = "balance", string interval = "month")
    {
        if (interval == null || interval.ToLower() != "month") throw new ArgumentException("Only 'month' interval is supported", nameof(interval));
        if (from > to) throw new ArgumentException("'from' must be <= 'to'");

        // Normalize to month boundaries
        var start = new DateTime(from.Year, from.Month, 1);
        var end = new DateTime(to.Year, to.Month, 1);
        var endInclusive = end.AddMonths(1).AddTicks(-1);

        // Fetch transactions up to endInclusive (we need transactions before start to compute initial balance)
        var transactions = (await _unitOfWork.Repository<CreditTransaction>().FindAsync(ct => ct.UserId == userId && ct.CreatedAt <= endInclusive)).ToList();

        // Group by month-year
        var groups = transactions
            .GroupBy(t => new DateTime(t.CreatedAt.Year, t.CreatedAt.Month, 1))
            .ToDictionary(g => g.Key, g => new { Net = g.Sum(x => x.Amount), Count = g.Count() });

        // Initial balance before start
        var initial = transactions.Where(t => t.CreatedAt < start).Sum(t => t.Amount);

        var months = new List<DateTime>();
        for (var d = start; d <= end; d = d.AddMonths(1)) months.Add(d);

        decimal running = initial;
        var result = new List<TimeSeriesPointDto>();

        foreach (var m in months)
        {
            groups.TryGetValue(m, out var g);
            var net = g?.Net ?? 0m;
            var count = g?.Count ?? 0;
            running += net;

            decimal value = metric?.ToLower() switch
            {
                "net" => net,
                "count" => count,
                _ => running,
            };

            result.Add(new TimeSeriesPointDto { Date = m, Value = value });
        }

        return result;
    }

    public async Task<IEnumerable<TimeSeriesPointDto>> GetAllClientsCreditMonthlySumAsync(DateTime from, DateTime to)
    {
        if (from > to) throw new ArgumentException("'from' must be <= 'to'", nameof(from));

        // Normalize to month boundaries
        var start = new DateTime(from.Year, from.Month, 1);
        var end = new DateTime(to.Year, to.Month, 1);
        var endInclusive = end.AddMonths(1).AddTicks(-1);

        // Fetch positive credit transactions in range
        var transactions = (await _unitOfWork.Repository<CreditTransaction>().FindAsync(ct => ct.Amount > 0m && ct.CreatedAt >= start && ct.CreatedAt <= endInclusive)).ToList();

        // Group by month-year and sum
        var groups = transactions
            .GroupBy(t => new DateTime(t.CreatedAt.Year, t.CreatedAt.Month, 1))
            .ToDictionary(g => g.Key, g => g.Sum(x => x.Amount));

        var months = new List<DateTime>();
        for (var d = start; d <= end; d = d.AddMonths(1)) months.Add(d);

        var result = new List<TimeSeriesPointDto>();
        foreach (var m in months)
        {
            groups.TryGetValue(m, out var sum);
            result.Add(new TimeSeriesPointDto { Date = m, Value = sum });
        }

        return result;
    }

    public async Task<IEnumerable<MonthlyCreditSumDto>> GetAllClientsCreditMonthlySumByNameAsync(DateTime from, DateTime to)
    {
        if (from > to) throw new ArgumentException("'from' must be <= 'to'", nameof(from));

        var start = new DateTime(from.Year, from.Month, 1);
        var end = new DateTime(to.Year, to.Month, 1);
        var endInclusive = end.AddMonths(1).AddTicks(-1);

        var transactions = (await _unitOfWork.Repository<CreditTransaction>().FindAsync(ct => ct.Amount > 0m && ct.CreatedAt >= start && ct.CreatedAt <= endInclusive)).ToList();

        var groups = transactions
            .GroupBy(t => new DateTime(t.CreatedAt.Year, t.CreatedAt.Month, 1))
            .ToDictionary(g => g.Key, g => g.Sum(x => x.Amount));

        var months = new List<DateTime>();
        for (var d = start; d <= end; d = d.AddMonths(1)) months.Add(d);

        var result = new List<MonthlyCreditSumDto>();
        foreach (var m in months)
        {
            groups.TryGetValue(m, out var sum);
            result.Add(new MonthlyCreditSumDto
            {
                Id = m.Month,
                Amount = sum,
                Month = m.ToString("MMMM", CultureInfo.InvariantCulture)
            });
        }

        return result;
    }
}
