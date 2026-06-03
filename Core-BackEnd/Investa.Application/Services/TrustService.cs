using Investa.Application.DTOs.Trust;
using Investa.Application.Interfaces;
using Investa.Domain.Entities;
using Investa.Domain.Entities.Enums;
using Microsoft.Extensions.Logging;

namespace Investa.Application.Services;

/// <summary>
/// Implements the Progressive Trust lifecycle.
/// Rules are centralised here — all platforms delegate to this service via the API.
/// </summary>
public class TrustService : ITrustService
{
    private readonly IUnitOfWork _uow;
    private readonly ILogger<TrustService> _logger;

    public TrustService(IUnitOfWork uow, ILogger<TrustService> logger)
    {
        _uow = uow;
        _logger = logger;
    }

    // ─── Read ────────────────────────────────────────────────────────────────

    public async Task<TrustProfileDto> GetTrustProfileAsync(Guid userId)
    {
        var user = await _uow.Repository<AuthUser>()
            .GetByIdAsync(userId)
            ?? throw new KeyNotFoundException($"User {userId} not found");

        var verifications = (await _uow.Repository<UserVerification>()
            .FindAsync(v => v.UserId == userId))
            .ToList();

        var dto = BuildTrustProfile(user, verifications);
        return dto;
    }

    // ─── Recalculation ───────────────────────────────────────────────────────

    public async Task RecalculateTrustAsync(Guid userId)
    {
        var user = await _uow.Repository<AuthUser>()
            .GetByIdAsync(userId)
            ?? throw new KeyNotFoundException($"User {userId} not found");

        var verifications = (await _uow.Repository<UserVerification>()
            .FindAsync(v => v.UserId == userId))
            .ToList();

        // 1. Update verification flags from actual verification records
        user.IsPhoneVerified = user.IsPhoneVerified ||
            verifications.Any(v => v.VerificationType == VerificationType.Phone && v.Status == VerificationStatus.Verified);

        user.IsEmailVerified = user.IsEmailVerified ||
            verifications.Any(v => v.VerificationType == VerificationType.Email && v.Status == VerificationStatus.Verified);

        // 2. Compute profile completion
        user.ProfileCompletionPercentage = CalculateProfileCompletion(user);

        // 3. Derive trust level based on engagement and activity
        user.TrustLevel = DeriveTrustLevel(user);

        await _uow.Repository<AuthUser>().UpdateAsync(user);
        await _uow.SaveChangesAsync();

        _logger.LogInformation(
            "Trust recalculated for user {UserId}: Level={Level} Completion={Pct}%",
            userId, user.TrustLevel, user.ProfileCompletionPercentage);
    }

    // ─── Reputation ──────────────────────────────────────────────────────────

    public async Task AdjustReputationScoreAsync(Guid userId, int delta, string reason)
    {
        var user = await _uow.Repository<AuthUser>().GetByIdAsync(userId)
            ?? throw new KeyNotFoundException($"User {userId} not found");

        user.ReputationScore = Math.Max(0, Math.Min(10000, user.ReputationScore + delta));
        await _uow.Repository<AuthUser>().UpdateAsync(user);
        await _uow.SaveChangesAsync();

        _logger.LogInformation("Reputation adjusted for {UserId}: delta={Delta} reason={Reason} newScore={Score}",
            userId, delta, reason, user.ReputationScore);
    }

    // ─── Verification ────────────────────────────────────────────────────────

    public async Task<UserVerificationDto> SubmitVerificationAsync(Guid userId, SubmitVerificationRequest request)
    {
        var verification = new UserVerification
        {
            UserId = userId,
            VerificationType = request.VerificationType,
            Status = VerificationStatus.Pending,
            Provider = request.Provider,
            ProviderReferenceId = request.ProviderReferenceId,
            DocumentUrl = request.DocumentUrl,
            SubmittedAt = DateTime.UtcNow
        };

        await _uow.Repository<UserVerification>().AddAsync(verification);
        await _uow.SaveChangesAsync();

        _logger.LogInformation("Verification submitted: UserId={UserId} Type={Type}", userId, request.VerificationType);

        return MapVerification(verification);
    }

    public async Task<UserVerificationDto> ReviewVerificationAsync(Guid adminUserId, ReviewVerificationRequest request)
    {
        var verification = await _uow.Repository<UserVerification>().GetByIdAsync(request.VerificationId)
            ?? throw new KeyNotFoundException($"Verification {request.VerificationId} not found");

        verification.Status = request.Approved ? VerificationStatus.Verified : VerificationStatus.None;
        verification.VerifiedAt = request.Approved ? DateTime.UtcNow : null;
        verification.Notes = request.Notes;

        await _uow.Repository<UserVerification>().UpdateAsync(verification);
        await _uow.SaveChangesAsync();

        // Trigger trust recalculation for the user
        await RecalculateTrustAsync(verification.UserId);

        _logger.LogInformation(
            "Verification {Id} reviewed by admin {Admin}: Approved={Approved}",
            request.VerificationId, adminUserId, request.Approved);

        return MapVerification(verification);
    }

    public async Task<List<UserVerificationDto>> GetPendingVerificationsAsync()
    {
        var pending = await _uow.Repository<UserVerification>()
            .FindAsync(v => v.Status == VerificationStatus.Pending);
        return pending.Select(MapVerification).ToList();
    }

    // ─── Risk Flags ──────────────────────────────────────────────────────────

    public async Task AddRiskFlagAsync(Guid userId, string flag)
    {
        var user = await _uow.Repository<AuthUser>().GetByIdAsync(userId)
            ?? throw new KeyNotFoundException($"User {userId} not found");

        var flags = ParseFlags(user.RiskFlags);
        if (!flags.Contains(flag))
        {
            flags.Add(flag);
            user.RiskFlags = string.Join(",", flags);
            await _uow.Repository<AuthUser>().UpdateAsync(user);
            await _uow.SaveChangesAsync();
        }
    }

    public async Task RemoveRiskFlagAsync(Guid userId, string flag)
    {
        var user = await _uow.Repository<AuthUser>().GetByIdAsync(userId)
            ?? throw new KeyNotFoundException($"User {userId} not found");

        var flags = ParseFlags(user.RiskFlags);
        if (flags.Remove(flag))
        {
            user.RiskFlags = flags.Count > 0 ? string.Join(",", flags) : null;
            await _uow.Repository<AuthUser>().UpdateAsync(user);
            await _uow.SaveChangesAsync();
        }
    }

    // ─── Private helpers ─────────────────────────────────────────────────────

    private static TrustProfileDto BuildTrustProfile(AuthUser user, List<UserVerification> verifications)
    {
        var permissions = BuildPermissions(user);
        var requirements = BuildNextLevelRequirements(user, verifications);

        return new TrustProfileDto
        {
            UserId = user.Id,
            TrustLevel = user.TrustLevel,
            ReputationScore = user.ReputationScore,
            ProfileCompletionPercentage = user.ProfileCompletionPercentage,
            IsPhoneVerified = user.IsPhoneVerified,
            IsEmailVerified = user.IsEmailVerified,
            Permissions = permissions,
            NextLevelRequirements = requirements,
            Verifications = verifications.Select(MapVerification).ToList()
        };
    }

    private static TrustPermissionsDto BuildPermissions(AuthUser user)
    {
        var level = (int)user.TrustLevel;
        var isFounder = user.ClientType == ClientType.Founder || user.ClientType == ClientType.Both;
        var isInvestor = user.ClientType == ClientType.Investor || user.ClientType == ClientType.Both;

        return new TrustPermissionsDto
        {
            CanBrowseOpportunities = true,                      // Everyone
            CanViewOpportunityDetails = level >= 1,
            CanSaveOpportunities = level >= 1,
            CanFollowUsers = level >= 1,
            CanComment = level >= 2,
            CanRequestJoinOpportunity = level >= 2,
            CanParticipateInDiscussions = level >= 2,
            CanPublishOpportunity = level >= 3 && isFounder,
            CanJoinVerifiedDeals = level >= 3 && isInvestor,
            CanDirectMessage = level >= 3,
            CanAccessAnalytics = level >= 3 && isFounder
        };
    }

    private static List<TrustRequirementDto> BuildNextLevelRequirements(AuthUser user, List<UserVerification> verifications)
    {
        var requirements = new List<TrustRequirementDto>();
        var level = user.TrustLevel;

        if (level == TrustLevel.Registered)
        {
            // Requirements for Level 2
            requirements.Add(new TrustRequirementDto
            {
                Key = "profile_image",
                LabelEn = "Upload a profile photo",
                LabelAr = "رفع صورة شخصية",
                IsMet = user.Profile?.AvatarUrl != null
            });
            requirements.Add(new TrustRequirementDto
            {
                Key = "bio",
                LabelEn = "Add a bio",
                LabelAr = "إضافة نبذة شخصية",
                IsMet = !string.IsNullOrWhiteSpace(user.Profile?.Bio)
            });
            requirements.Add(new TrustRequirementDto
            {
                Key = "linkedin",
                LabelEn = "Add LinkedIn profile",
                LabelAr = "إضافة ملف LinkedIn",
                IsMet = !string.IsNullOrWhiteSpace(user.Profile?.LinkedInUrl)
            });
            requirements.Add(new TrustRequirementDto
            {
                Key = "professional_info",
                LabelEn = "Complete professional information",
                LabelAr = "إكمال المعلومات المهنية",
                IsMet = !string.IsNullOrWhiteSpace(user.Profile?.BusinessRole)
            });
            requirements.Add(new TrustRequirementDto
            {
                Key = "completion_60",
                LabelEn = "Reach 60% profile completion",
                LabelAr = "إكمال 60% من الملف الشخصي",
                IsMet = user.ProfileCompletionPercentage >= 60
            });
        }
        else if (level == TrustLevel.Interactive)
        {
            // Requirements for Level 3 - Based on engagement and reputation
            requirements.Add(new TrustRequirementDto
            {
                Key = "account_age",
                LabelEn = "Account age 30+ days",
                LabelAr = "عمر الحساب 30+ يوم",
                IsMet = (DateTime.UtcNow - user.CreatedAt).Days >= 30
            });
            requirements.Add(new TrustRequirementDto
            {
                Key = "reputation_score",
                LabelEn = "Reputation score 500+",
                LabelAr = "سمعة 500+",
                IsMet = user.ReputationScore >= 500
            });
            requirements.Add(new TrustRequirementDto
            {
                Key = "profile_complete",
                LabelEn = "80% profile completion",
                LabelAr = "إكمال 80% من الملف الشخصي",
                IsMet = user.ProfileCompletionPercentage >= 80
            });
            requirements.Add(new TrustRequirementDto
            {
                Key = "legal_agreement",
                LabelEn = "Accept legal agreement",
                LabelAr = "قبول الاتفاقية القانونية",
                IsMet = verifications.Any(v => v.VerificationType == VerificationType.LegalAgreement && v.Status == VerificationStatus.Verified)
            });
        }

        return requirements;
    }

    private static int CalculateProfileCompletion(AuthUser user)
    {
        var profile = user.Profile;
        var points = 0;
        var total = 0;

        void Check(bool cond, int weight) { total += weight; if (cond) points += weight; }

        // Registration basics (30 points)
        Check(!string.IsNullOrWhiteSpace(user.Name), 10);
        Check(!string.IsNullOrWhiteSpace(user.Email), 5);
        Check(user.IsPhoneVerified, 10);
        Check(user.IsEmailVerified, 5);

        // Profile data (70 points)
        if (profile != null)
        {
            Check(!string.IsNullOrWhiteSpace(profile.FirstName) && !string.IsNullOrWhiteSpace(profile.LastName), 10);
            Check(!string.IsNullOrWhiteSpace(profile.Bio), 10);
            Check(!string.IsNullOrWhiteSpace(profile.AvatarUrl), 10);
            Check(!string.IsNullOrWhiteSpace(profile.LinkedInUrl), 10);
            Check(!string.IsNullOrWhiteSpace(profile.BusinessRole), 10);
            Check(!string.IsNullOrWhiteSpace(profile.Nationality), 5);
            Check(profile.DateOfBirth.HasValue, 5);
            Check(!string.IsNullOrWhiteSpace(profile.CompanyName), 5);
            Check(!string.IsNullOrWhiteSpace(profile.InvestmentInterests), 5);
        }
        else
        {
            total += 70; // all profile fields count even if no profile yet
        }

        return total == 0 ? 0 : (int)Math.Round((double)points / total * 100);
    }

    private static TrustLevel DeriveTrustLevel(AuthUser user)
    {
        // Level 3: Trusted Active - Based on engagement metrics
        var accountAgeDays = (DateTime.UtcNow - user.CreatedAt).Days;
        if (accountAgeDays >= 30 &&
            user.ReputationScore >= 500 &&
            user.ProfileCompletionPercentage >= 80)
        {
            return TrustLevel.TrustedActive;
        }

        // Level 2: Interactive - Profile sufficiently complete
        if (user.ProfileCompletionPercentage >= 60 &&
            user.Profile != null &&
            !string.IsNullOrWhiteSpace(user.Profile.Bio) &&
            !string.IsNullOrWhiteSpace(user.Profile.AvatarUrl))
            return TrustLevel.Interactive;

        // Level 1: At least registered (default for any logged-in user)
        return TrustLevel.Registered;
    }

    private static UserVerificationDto MapVerification(UserVerification v) => new()
    {
        Id = v.Id,
        VerificationType = v.VerificationType,
        Status = v.Status,
        Provider = v.Provider,
        SubmittedAt = v.SubmittedAt,
        VerifiedAt = v.VerifiedAt,
        Notes = v.Notes
    };

    private static List<string> ParseFlags(string? flags) =>
        string.IsNullOrWhiteSpace(flags)
            ? new List<string>()
            : flags.Split(',', StringSplitOptions.RemoveEmptyEntries).ToList();
}
