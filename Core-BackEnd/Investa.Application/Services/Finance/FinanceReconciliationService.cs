using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Investa.Application.DTOs.Finance;
using Investa.Application.Interfaces;
using Investa.Domain.Entities;
using Investa.Domain.Entities.Enums;
using Investa.Domain.Entities.Security;

namespace Investa.Application.Services.Finance;

public interface IFinanceReconciliationService
{
    Task<FinanceReconciliationDto> CreateAsync(CreateFinanceReconciliationDto dto, Guid userId);
    Task<FinanceReconciliationDto> GetByIdAsync(int id);
    Task<(List<FinanceReconciliationListDto> Items, int TotalCount)> GetListAsync(int? accountId = null, DateTime? fromDate = null, DateTime? toDate = null, string? status = null, int pageNumber = 1, int pageSize = 20, string? search = null, bool? onlyWithDifference = null);
    Task<FinanceReconciliationDto> RecalculateAsync(int id, Guid userId);
    Task<FinanceReconciliationDto> UpdateStatementBalanceAsync(int id, decimal actualStatementBalance, Guid userId);
    Task<FinanceReconciliationDto> ConfirmAsync(int id, Guid userId);
    Task<FinanceReconciliationDto> UpdateNotesAsync(int id, string? notes, Guid userId);
    Task DeleteAsync(int id, Guid userId);
}

public class FinanceReconciliationService : IFinanceReconciliationService
{
    private readonly IFinanceRepository _repository;
    private readonly ICurrentUserContext _currentUser;

    public FinanceReconciliationService(IFinanceRepository repository, ICurrentUserContext currentUser)
    {
        _repository = repository ?? throw new ArgumentNullException(nameof(repository));
        _currentUser = currentUser ?? throw new ArgumentNullException(nameof(currentUser));
    }

    public async Task<FinanceReconciliationDto> CreateAsync(CreateFinanceReconciliationDto dto, Guid userId)
    {
        var account = await _repository.GetAccountByIdAsync(dto.FinanceAccountId);
        if (account == null)
            throw new InvalidOperationException($"Account with ID {dto.FinanceAccountId} not found");

        if (dto.PeriodStartDate >= dto.PeriodEndDate)
            throw new InvalidOperationException("Period start date must be before end date");

        if (dto.ActualStatementBalance < 0)
            throw new InvalidOperationException("Statement balance cannot be negative");

        await CheckOverlappingConfirmedPeriodAsync(dto.FinanceAccountId, dto.PeriodStartDate, dto.PeriodEndDate, null);

        var (openingBalance, periodActivity) = await CalculatePeriodBalancesAsync(dto.FinanceAccountId, dto.PeriodStartDate, dto.PeriodEndDate);
        var systemCalculatedBalance = openingBalance + periodActivity;
        var difference = dto.ActualStatementBalance - systemCalculatedBalance;
        var status = difference == 0 ? FinanceReconciliationStatus.Matched : FinanceReconciliationStatus.DifferenceFound;

        var entity = new FinanceReconciliation
        {
            FinanceAccountId = dto.FinanceAccountId,
            ReconciliationDate = dto.ReconciliationDate ?? DateTime.UtcNow,
            PeriodStartDate = dto.PeriodStartDate,
            PeriodEndDate = dto.PeriodEndDate,
            OpeningBalance = openingBalance,
            PeriodActivity = periodActivity,
            SystemCalculatedBalance = systemCalculatedBalance,
            ActualStatementBalance = dto.ActualStatementBalance,
            Difference = difference,
            Status = status,
            Notes = dto.Notes,
            CreatedBy = userId,
            CreatedAt = DateTime.UtcNow
        };

        await _repository.AddReconciliationAsync(entity);
        await _repository.SaveAsync();

        entity.FinanceAccount = account;

        await _repository.AddAuditEventAsync(new FinanceAuditEvent
        {
            EventType = FinanceAuditEventType.ReconciliationCreated,
            PerformedBy = userId,
            Description = $"Reconciliation created for account '{account.Name}' period {dto.PeriodStartDate:yyyy-MM-dd} - {dto.PeriodEndDate:yyyy-MM-dd}. Status: {status}",
            CreatedAt = DateTime.UtcNow
        });
        await _repository.SaveAsync();

        return await MapToDetailDtoAsync(entity, userId);
    }

    public async Task<FinanceReconciliationDto> GetByIdAsync(int id)
    {
        var entity = await _repository.GetReconciliationByIdAsync(id);
        if (entity == null)
            throw new KeyNotFoundException($"Reconciliation {id} not found");

        return await MapToDetailDtoAsync(entity, _currentUser.UserId);
    }

    public async Task<(List<FinanceReconciliationListDto> Items, int TotalCount)> GetListAsync(
        int? accountId = null,
        DateTime? fromDate = null,
        DateTime? toDate = null,
        string? status = null,
        int pageNumber = 1,
        int pageSize = 20,
        string? search = null,
        bool? onlyWithDifference = null)
    {
        pageNumber = Math.Max(1, pageNumber);
        pageSize = Math.Clamp(pageSize, 1, 100);

        FinanceReconciliationStatus? parsedStatus = null;
        if (Enum.TryParse<FinanceReconciliationStatus>(status, true, out var parsed))
            parsedStatus = parsed;

        var totalCount = await _repository.GetReconciliationCountAsync(accountId, fromDate, toDate, parsedStatus, search, onlyWithDifference);
        var entities = await _repository.GetReconciliationsAsync(accountId, fromDate, toDate, parsedStatus, pageNumber, pageSize, search, onlyWithDifference);

        var userId = _currentUser.UserId;
        var userIds = entities.SelectMany(e => new Guid?[] { e.CreatedBy, e.ConfirmedBy }).Where(id => id.HasValue).Select(id => id!.Value).Distinct().ToList();
        var nameMap = userIds.Count > 0 ? await _repository.GetUserDisplayNamesAsync(userIds) : new Dictionary<Guid, string?>();

        var items = entities.Select(e => MapToListDto(e, userId, nameMap)).ToList();
        return (items, totalCount);
    }

    public async Task<FinanceReconciliationDto> RecalculateAsync(int id, Guid userId)
    {
        var entity = await _repository.GetReconciliationByIdAsync(id);
        if (entity == null)
            throw new KeyNotFoundException($"Reconciliation {id} not found");

        if (entity.Status == FinanceReconciliationStatus.Confirmed)
            throw new InvalidOperationException("Cannot recalculate a confirmed reconciliation");

        var (openingBalance, periodActivity) = await CalculatePeriodBalancesAsync(
            entity.FinanceAccountId, entity.PeriodStartDate, entity.PeriodEndDate);

        entity.OpeningBalance = openingBalance;
        entity.PeriodActivity = periodActivity;
        entity.SystemCalculatedBalance = openingBalance + periodActivity;
        entity.Difference = entity.ActualStatementBalance - entity.SystemCalculatedBalance;
        entity.Status = entity.Difference == 0 ? FinanceReconciliationStatus.Matched : FinanceReconciliationStatus.DifferenceFound;
        entity.UpdatedBy = userId;
        entity.UpdatedAt = DateTime.UtcNow;

        await _repository.SaveAsync();

        await _repository.AddAuditEventAsync(new FinanceAuditEvent
        {
            EventType = FinanceAuditEventType.ReconciliationRecalculated,
            PerformedBy = userId,
            Description = $"Reconciliation {id} recalculated. Opening: {openingBalance}, Activity: {periodActivity}, System: {entity.SystemCalculatedBalance}, Diff: {entity.Difference}",
            CreatedAt = DateTime.UtcNow
        });
        await _repository.SaveAsync();

        return await MapToDetailDtoAsync(entity, userId);
    }

    public async Task<FinanceReconciliationDto> UpdateStatementBalanceAsync(int id, decimal actualStatementBalance, Guid userId)
    {
        var entity = await _repository.GetReconciliationByIdAsync(id);
        if (entity == null)
            throw new KeyNotFoundException($"Reconciliation {id} not found");

        if (entity.Status == FinanceReconciliationStatus.Confirmed)
            throw new InvalidOperationException("Cannot update a confirmed reconciliation");

        if (actualStatementBalance < 0)
            throw new InvalidOperationException("Statement balance cannot be negative");

        var previousBalance = entity.ActualStatementBalance;
        entity.ActualStatementBalance = actualStatementBalance;
        entity.Difference = actualStatementBalance - entity.SystemCalculatedBalance;
        entity.Status = entity.Difference == 0 ? FinanceReconciliationStatus.Matched : FinanceReconciliationStatus.DifferenceFound;
        entity.UpdatedBy = userId;
        entity.UpdatedAt = DateTime.UtcNow;

        await _repository.SaveAsync();

        if (entity.Difference != 0)
        {
            await _repository.AddAuditEventAsync(new FinanceAuditEvent
            {
                EventType = FinanceAuditEventType.ReconciliationDifferenceDetected,
                PerformedBy = userId,
                Description = $"Statement balance changed from {previousBalance} to {actualStatementBalance}. Difference: {entity.Difference}",
                CreatedAt = DateTime.UtcNow
            });
            await _repository.SaveAsync();
        }

        return await MapToDetailDtoAsync(entity, userId);
    }

    public async Task<FinanceReconciliationDto> ConfirmAsync(int id, Guid userId)
    {
        var entity = await _repository.GetReconciliationByIdAsync(id);
        if (entity == null)
            throw new KeyNotFoundException($"Reconciliation {id} not found");

        if (entity.Status == FinanceReconciliationStatus.Confirmed)
            throw new InvalidOperationException("Reconciliation is already confirmed");

        if (entity.CreatedBy == userId)
            throw new InvalidOperationException("You cannot confirm your own reconciliation");

        await CheckOverlappingConfirmedPeriodAsync(entity.FinanceAccountId, entity.PeriodStartDate, entity.PeriodEndDate, id);

        entity.Status = FinanceReconciliationStatus.Confirmed;
        entity.ConfirmedBy = userId;
        entity.ConfirmedAt = DateTime.UtcNow;
        entity.UpdatedBy = userId;
        entity.UpdatedAt = DateTime.UtcNow;

        await _repository.SaveAsync();

        await _repository.AddAuditEventAsync(new FinanceAuditEvent
        {
            EventType = FinanceAuditEventType.ReconciliationConfirmed,
            PerformedBy = userId,
            Description = $"Reconciliation {id} confirmed for account '{entity.FinanceAccount?.Name}'. Period: {entity.PeriodStartDate:yyyy-MM-dd} - {entity.PeriodEndDate:yyyy-MM-dd}",
            CreatedAt = DateTime.UtcNow
        });
        await _repository.SaveAsync();

        return await MapToDetailDtoAsync(entity, userId);
    }

    public async Task<FinanceReconciliationDto> UpdateNotesAsync(int id, string? notes, Guid userId)
    {
        var entity = await _repository.GetReconciliationByIdAsync(id);
        if (entity == null)
            throw new KeyNotFoundException($"Reconciliation {id} not found");

        if (entity.Status == FinanceReconciliationStatus.Confirmed)
            throw new InvalidOperationException("Cannot update a confirmed reconciliation");

        entity.Notes = notes;
        entity.UpdatedBy = userId;
        entity.UpdatedAt = DateTime.UtcNow;

        await _repository.SaveAsync();

        return await MapToDetailDtoAsync(entity, userId);
    }

    public async Task DeleteAsync(int id, Guid userId)
    {
        var entity = await _repository.GetReconciliationByIdAsync(id);
        if (entity == null)
            throw new KeyNotFoundException($"Reconciliation {id} not found");

        if (entity.Status == FinanceReconciliationStatus.Confirmed)
            throw new InvalidOperationException("Cannot delete a confirmed reconciliation");

        _repository.DeleteReconciliation(entity);
        await _repository.SaveAsync();
    }

    private async Task CheckOverlappingConfirmedPeriodAsync(int accountId, DateTime periodStart, DateTime periodEnd, int? excludeId)
    {
        var existingConfirmed = await _repository.GetReconciliationsAsync(
            accountId: accountId,
            status: FinanceReconciliationStatus.Confirmed);

        foreach (var existing in existingConfirmed)
        {
            if (excludeId.HasValue && existing.Id == excludeId.Value)
                continue;

            if (existing.PeriodStartDate < periodEnd && existing.PeriodEndDate > periodStart)
                throw new InvalidOperationException(
                    $"Period overlaps with confirmed reconciliation #{existing.Id} " +
                    $"({existing.PeriodStartDate:yyyy-MM-dd} to {existing.PeriodEndDate:yyyy-MM-dd}) " +
                    $"for this account.");
        }
    }

    private async Task<(decimal OpeningBalance, decimal PeriodActivity)> CalculatePeriodBalancesAsync(
        int accountId, DateTime periodStart, DateTime periodEnd)
    {
        var transactions = await _repository.GetConfirmedTransactionsForPeriodAsync(accountId, periodEnd);

        decimal openingBalance = 0;
        decimal periodActivity = 0;

        foreach (var t in transactions)
        {
            var balanceEffect = GetBalanceEffect(t, accountId);

            if (t.TransactionDate < periodStart)
                openingBalance += balanceEffect;
            else
                periodActivity += balanceEffect;
        }

        return (openingBalance, periodActivity);
    }

    private static decimal GetBalanceEffect(FinanceTransaction t, int accountId)
    {
        decimal effect = 0;

        if (t.DestinationAccountId == accountId)
            effect += t.AmountInBaseCurrency;

        if (t.SourceAccountId == accountId)
            effect -= t.AmountInBaseCurrency;

        return effect;
    }

    private async Task<FinanceReconciliationDto> MapToDetailDtoAsync(FinanceReconciliation entity, Guid? userId)
    {
        var nameMap = new Dictionary<Guid, string?>();
        var detailUserIds = new[] { entity.CreatedBy, entity.UpdatedBy, entity.ConfirmedBy }.Where(id => id.HasValue).Select(id => id!.Value).Distinct().ToList();
        if (detailUserIds.Count > 0)
            nameMap = await _repository.GetUserDisplayNamesAsync(detailUserIds);

        return new FinanceReconciliationDto
        {
            Id = entity.Id,
            FinanceAccountId = entity.FinanceAccountId,
            FinanceAccountName = entity.FinanceAccount?.Name,
            FinanceAccountCode = entity.FinanceAccount?.Code,
            FinanceAccountCurrency = entity.FinanceAccount?.Currency,
            ReconciliationDate = entity.ReconciliationDate,
            PeriodStartDate = entity.PeriodStartDate,
            PeriodEndDate = entity.PeriodEndDate,
            OpeningBalance = entity.OpeningBalance,
            PeriodActivity = entity.PeriodActivity,
            SystemCalculatedBalance = entity.SystemCalculatedBalance,
            ActualStatementBalance = entity.ActualStatementBalance,
            Difference = entity.Difference,
            Status = entity.Status.ToString(),
            Notes = entity.Notes,
            CreatedBy = entity.CreatedBy,
            CreatedByDisplayName = entity.CreatedBy is Guid cb && nameMap.TryGetValue(cb, out var cbn) ? cbn : null,
            CreatedAt = entity.CreatedAt,
            UpdatedBy = entity.UpdatedBy,
            UpdatedByDisplayName = entity.UpdatedBy is Guid ub && nameMap.TryGetValue(ub, out var ubn) ? ubn : null,
            UpdatedAt = entity.UpdatedAt,
            ConfirmedBy = entity.ConfirmedBy,
            ConfirmedByDisplayName = entity.ConfirmedBy is Guid cob && nameMap.TryGetValue(cob, out var cobn) ? cobn : null,
            ConfirmedAt = entity.ConfirmedAt,

            CanEdit = CanEdit(entity, userId),
            CanRecalculate = CanRecalculate(entity),
            CanConfirm = CanConfirm(entity, userId),
            CanDelete = CanDelete(entity, userId)
        };
    }

    private FinanceReconciliationListDto MapToListDto(FinanceReconciliation entity, Guid? userId, Dictionary<Guid, string?> nameMap)
    {
        return new FinanceReconciliationListDto
        {
            Id = entity.Id,
            FinanceAccountId = entity.FinanceAccountId,
            FinanceAccountName = entity.FinanceAccount?.Name,
            FinanceAccountCode = entity.FinanceAccount?.Code,
            FinanceAccountCurrency = entity.FinanceAccount?.Currency,
            ReconciliationDate = entity.ReconciliationDate,
            PeriodStartDate = entity.PeriodStartDate,
            PeriodEndDate = entity.PeriodEndDate,
            OpeningBalance = entity.OpeningBalance,
            PeriodActivity = entity.PeriodActivity,
            SystemCalculatedBalance = entity.SystemCalculatedBalance,
            ActualStatementBalance = entity.ActualStatementBalance,
            Difference = entity.Difference,
            Status = entity.Status.ToString(),
            Notes = entity.Notes,
            CreatedBy = entity.CreatedBy,
            CreatedByDisplayName = entity.CreatedBy is Guid cb && nameMap.TryGetValue(cb, out var cbn) ? cbn : null,
            CreatedAt = entity.CreatedAt,
            ConfirmedBy = entity.ConfirmedBy,
            ConfirmedByDisplayName = entity.ConfirmedBy is Guid cob && nameMap.TryGetValue(cob, out var cobn) ? cobn : null,
            ConfirmedAt = entity.ConfirmedAt,

            CanEdit = CanEdit(entity, userId),
            CanRecalculate = CanRecalculate(entity),
            CanConfirm = CanConfirm(entity, userId),
            CanDelete = CanDelete(entity, userId)
        };
    }

    private bool IsCreator(FinanceReconciliation entity, Guid? userId) =>
        userId.HasValue && entity.CreatedBy == userId;

    private static bool IsEditable(FinanceReconciliation entity) =>
        entity.Status is FinanceReconciliationStatus.Draft;

    private bool CanEdit(FinanceReconciliation entity, Guid? userId) =>
        IsCreator(entity, userId) && IsEditable(entity) && HasPermission(SystemPermissions.FinanceCreate);

    private bool CanRecalculate(FinanceReconciliation entity) =>
        entity.Status != FinanceReconciliationStatus.Confirmed && HasPermission(SystemPermissions.FinanceCreate);

    private bool CanConfirm(FinanceReconciliation entity, Guid? userId) =>
        entity.Status != FinanceReconciliationStatus.Confirmed
        && !IsCreator(entity, userId)
        && HasPermission(SystemPermissions.FinanceConfirm);

    private bool CanDelete(FinanceReconciliation entity, Guid? userId) =>
        entity.Status != FinanceReconciliationStatus.Confirmed
        && IsCreator(entity, userId)
        && HasPermission(SystemPermissions.FinanceManage);

    private bool HasPermission(string permission) => _currentUser.HasPermission(permission);
}
