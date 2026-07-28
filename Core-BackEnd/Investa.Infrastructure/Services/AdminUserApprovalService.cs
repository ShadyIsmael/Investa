using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.Identity;
using Investa.Application.Interfaces;
using Investa.Application.DTOs;
using Investa.Application.Common;
using Investa.Infrastructure.Persistence;
using Investa.Infrastructure.Identity;
using Investa.Domain.Entities;
using Investa.Domain.Entities.Enums;
using Investa.Domain.Entities.Security;
using static Investa.Domain.Entities.Security.AuditSeverity;

namespace Investa.Infrastructure.Services;

public class AdminUserApprovalService : IAdminUserApprovalService
{
    private readonly ApplicationDbContext _db;
    private readonly UserManager<ApplicationIdentityUser> _userManager;
    private readonly ILogger<AdminUserApprovalService> _logger;
    private readonly IOrgUserService _orgUserService;

    public AdminUserApprovalService(
        ApplicationDbContext db,
        UserManager<ApplicationIdentityUser> userManager,
        ILogger<AdminUserApprovalService> logger,
        IOrgUserService orgUserService)
    {
        _db = db;
        _userManager = userManager;
        _logger = logger;
        _orgUserService = orgUserService;
    }

    public async Task<PendingAdminChangeDto> SubmitChangeAsync(SubmitAdminChangeDto dto, Guid makerId, string? ipAddress = null)
    {
        var targetUser = await _db.AuthUsers.FirstOrDefaultAsync(x => x.Id == dto.TargetUserId)
            ?? throw new OrgUserValidationException("USER_NOT_FOUND", "Target user not found.");

        var maker = await _db.AuthUsers.FirstOrDefaultAsync(x => x.Id == makerId)
            ?? throw new OrgUserValidationException("MAKER_NOT_FOUND", "Maker user not found.");

        if (!Enum.TryParse<AdminChangeAction>(dto.Action, true, out var action))
            throw new OrgUserValidationException("INVALID_ACTION", $"Invalid action: {dto.Action}");

        var beforeSnapshot = JsonSerializer.Serialize(new
        {
            targetUser.Status,
            targetUser.Name,
            targetUser.Email
        }, new JsonSerializerOptions { WriteIndented = false });

        var change = new PendingAdminChange
        {
            TargetUserId = dto.TargetUserId,
            TargetUserName = targetUser.Name,
            MakerId = makerId,
            MakerName = maker.Name,
            Action = action,
            Status = AdminChangeStatus.Pending,
            BeforeSnapshot = beforeSnapshot,
            AfterSnapshot = dto.AfterSnapshot,
            Description = dto.Description,
            SubmittedAt = DateTime.UtcNow,
            IpAddress = ipAddress
        };

        _db.PendingAdminChanges.Add(change);

        _db.AuditLogs.Add(new AuditLog
        {
            UserId = makerId,
            UserName = maker.Name,
            EntityType = "PendingAdminChange",
            EntityId = "0",
            Action = "Submit",
            Changes = $"Submitted admin change: {action} for user {targetUser.Name} ({targetUser.Id})",
            Timestamp = DateTime.UtcNow,
            IpAddress = ipAddress,
            Severity = Information
        });

        await _db.SaveChangesAsync();

        _logger.LogInformation(
            "Admin change submitted: Maker={MakerId}, Action={Action}, Target={TargetUserId}, ChangeId={ChangeId}",
            makerId, action, dto.TargetUserId, change.Id);

        return MapToDto(change, makerId);
    }

    public async Task<PendingAdminChangeDto> ApproveChangeAsync(long changeId, ApproveAdminChangeDto dto, Guid checkerId, string? ipAddress = null)
    {
        var change = await _db.PendingAdminChanges.FindAsync(changeId)
            ?? throw new InvalidOperationException("Change request not found.");

        if (change.Status != AdminChangeStatus.Pending)
            throw new InvalidOperationException($"Change request is already {change.Status}. Only pending changes can be approved.");

        if (change.MakerId == checkerId)
            throw new InvalidOperationException("Maker cannot approve their own change request.");

        var checker = await _db.AuthUsers.FirstOrDefaultAsync(x => x.Id == checkerId)
            ?? throw new InvalidOperationException("Checker user not found.");

        change.Status = AdminChangeStatus.Approved;
        change.CheckerId = checkerId;
        change.CheckerName = checker.Name;
        change.ReviewDecision = "Approved";
        change.ReviewReason = dto.ApprovalNotes;
        change.ReviewedAt = DateTime.UtcNow;

        await using var transaction = await _db.Database.BeginTransactionAsync();
        try
        {
            await ApplyChangeAsync(change);

            change.IsApplied = true;
            change.AppliedAt = DateTime.UtcNow;

            await _db.SaveChangesAsync();
            await transaction.CommitAsync();
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }

        _db.AuditLogs.Add(new AuditLog
        {
            UserId = checkerId,
            UserName = checker.Name,
            EntityType = "PendingAdminChange",
            EntityId = change.Id.ToString(),
            Action = "Approve",
            Changes = $"Approved and applied: {change.Action} for user {change.TargetUserName} ({change.TargetUserId})",
            Timestamp = DateTime.UtcNow,
            IpAddress = ipAddress,
            Severity = Information
        });

        await _db.SaveChangesAsync();

        _logger.LogInformation(
            "Admin change approved and applied: Checker={CheckerId}, ChangeId={ChangeId}, Action={Action}, Target={TargetUserId}",
            checkerId, changeId, change.Action, change.TargetUserId);

        return MapToDto(change, checkerId);
    }

    public async Task<PendingAdminChangeDto> RejectChangeAsync(long changeId, RejectAdminChangeDto dto, Guid checkerId, string? ipAddress = null)
    {
        var change = await _db.PendingAdminChanges.FindAsync(changeId)
            ?? throw new InvalidOperationException("Change request not found.");

        if (change.Status != AdminChangeStatus.Pending)
            throw new InvalidOperationException($"Change request is already {change.Status}. Only pending changes can be rejected.");

        if (change.MakerId == checkerId)
            throw new InvalidOperationException("Maker cannot reject their own change request.");

        var checker = await _db.AuthUsers.FirstOrDefaultAsync(x => x.Id == checkerId)
            ?? throw new InvalidOperationException("Checker user not found.");

        change.Status = AdminChangeStatus.Rejected;
        change.CheckerId = checkerId;
        change.CheckerName = checker.Name;
        change.ReviewDecision = "Rejected";
        change.ReviewReason = dto.RejectionReason;
        change.ReviewedAt = DateTime.UtcNow;

        _db.AuditLogs.Add(new AuditLog
        {
            UserId = checkerId,
            UserName = checker.Name,
            EntityType = "PendingAdminChange",
            EntityId = change.Id.ToString(),
            Action = "Reject",
            Changes = $"Rejected: {change.Action} for user {change.TargetUserName} ({change.TargetUserId}). Reason: {dto.RejectionReason}",
            Timestamp = DateTime.UtcNow,
            IpAddress = ipAddress,
            Severity = Warning
        });

        await _db.SaveChangesAsync();

        _logger.LogInformation(
            "Admin change rejected: Checker={CheckerId}, ChangeId={ChangeId}, Reason={Reason}",
            checkerId, changeId, dto.RejectionReason);

        return MapToDto(change, checkerId);
    }

    public async Task<PendingAdminChangeDto> CancelChangeAsync(long changeId, Guid userId)
    {
        var change = await _db.PendingAdminChanges.FindAsync(changeId)
            ?? throw new InvalidOperationException("Change request not found.");

        if (change.MakerId != userId)
            throw new InvalidOperationException("Only the original maker can cancel their own change request.");

        if (change.Status != AdminChangeStatus.Pending)
            throw new InvalidOperationException($"Cannot cancel a change that is already {change.Status}.");

        change.Status = AdminChangeStatus.Cancelled;

        await _db.SaveChangesAsync();

        _logger.LogInformation(
            "Admin change cancelled: UserId={UserId}, ChangeId={ChangeId}",
            userId, changeId);

        return MapToDto(change, userId);
    }

    public async Task<List<PendingAdminChangeDto>> GetPendingChangesAsync(int page = 1, int pageSize = 20)
    {
        var query = _db.PendingAdminChanges
            .Where(x => x.Status == AdminChangeStatus.Pending)
            .OrderByDescending(x => x.SubmittedAt);

        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return items.Select(x => MapToDto(x, null)).ToList();
    }

    public async Task<List<PendingAdminChangeDto>> GetMySubmittedChangesAsync(Guid userId, int page = 1, int pageSize = 20)
    {
        var query = _db.PendingAdminChanges
            .Where(x => x.MakerId == userId)
            .OrderByDescending(x => x.SubmittedAt);

        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return items.Select(x => MapToDto(x, userId)).ToList();
    }

    public async Task<PendingAdminChangeDto?> GetChangeByIdAsync(long changeId, Guid currentUserId)
    {
        var change = await _db.PendingAdminChanges.FindAsync(changeId);
        if (change == null) return null;

        return MapToDto(change, currentUserId);
    }

    private async Task ApplyChangeAsync(PendingAdminChange change)
    {
        var identityUser = await _userManager.FindByIdAsync(change.TargetUserId.ToString());
        if (identityUser == null)
            throw new InvalidOperationException("Target identity user not found for applying change.");

        switch (change.Action)
        {
            case AdminChangeAction.Lock:
                await _userManager.SetLockoutEndDateAsync(identityUser, DateTimeOffset.MaxValue);
                if (!identityUser.LockoutEnabled)
                {
                    identityUser.LockoutEnabled = true;
                    await _userManager.UpdateAsync(identityUser);
                }
                break;

            case AdminChangeAction.Unlock:
                await _userManager.SetLockoutEndDateAsync(identityUser, null);
                await _userManager.ResetAccessFailedCountAsync(identityUser);
                break;

            case AdminChangeAction.Activate:
                var authActivate = await _db.AuthUsers.FindAsync(change.TargetUserId);
                if (authActivate != null)
                    authActivate.Status = true;
                break;

            case AdminChangeAction.Deactivate:
                var authDeactivate = await _db.AuthUsers.FindAsync(change.TargetUserId);
                if (authDeactivate != null)
                    authDeactivate.Status = false;
                break;

            case AdminChangeAction.ResetPassword:
                if (!string.IsNullOrWhiteSpace(change.AfterSnapshot))
                {
                    var snapshot = JsonSerializer.Deserialize<ResetPasswordSnapshot>(change.AfterSnapshot);
                    if (snapshot != null && !string.IsNullOrWhiteSpace(snapshot.NewPassword))
                    {
                        var removeResult = await _userManager.RemovePasswordAsync(identityUser);
                        if (!removeResult.Succeeded)
                            throw new InvalidOperationException("Failed to remove existing password.");

                        var addResult = await _userManager.AddPasswordAsync(identityUser, snapshot.NewPassword);
                        if (!addResult.Succeeded)
                            throw new InvalidOperationException("Failed to set new password.");
                    }
                }
                break;

            case AdminChangeAction.AssignRole:
            case AdminChangeAction.RemoveRole:
                break;

            default:
                throw new InvalidOperationException($"Unknown action: {change.Action}");
        }
    }

    private static PendingAdminChangeDto MapToDto(PendingAdminChange change, Guid? currentUserId)
    {
        var isMaker = currentUserId.HasValue && change.MakerId == currentUserId;
        var isChecker = currentUserId.HasValue && change.CheckerId != currentUserId && currentUserId != change.MakerId;

        return new PendingAdminChangeDto
        {
            Id = change.Id,
            TargetUserId = change.TargetUserId,
            TargetUserName = change.TargetUserName,
            MakerId = change.MakerId,
            MakerName = change.MakerName,
            CheckerId = change.CheckerId,
            CheckerName = change.CheckerName,
            Action = change.Action.ToString(),
            Status = change.Status.ToString(),
            BeforeSnapshot = change.BeforeSnapshot,
            AfterSnapshot = change.AfterSnapshot,
            Description = change.Description,
            SubmittedAt = change.SubmittedAt,
            ReviewedAt = change.ReviewedAt,
            ReviewDecision = change.ReviewDecision,
            ReviewReason = change.ReviewReason,
            IsApplied = change.IsApplied,
            AppliedAt = change.AppliedAt,
            CanApprove = change.Status == AdminChangeStatus.Pending && !isMaker,
            CanReject = change.Status == AdminChangeStatus.Pending && !isMaker,
            CanCancel = change.Status == AdminChangeStatus.Pending && isMaker
        };
    }

    private class ResetPasswordSnapshot
    {
        public string? NewPassword { get; set; }
    }
}
