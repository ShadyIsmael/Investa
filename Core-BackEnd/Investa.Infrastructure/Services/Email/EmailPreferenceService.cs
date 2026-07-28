using Investa.Application.Interfaces;
using Investa.Domain.Entities;
using Investa.Domain.Entities.Enums;
using Investa.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Investa.Infrastructure.Services.Email;

public sealed class EmailPreferenceService : IEmailPreferenceService
{
    private readonly ApplicationDbContext _db;
    private readonly ILogger<EmailPreferenceService> _logger;

    public EmailPreferenceService(ApplicationDbContext db, ILogger<EmailPreferenceService> logger)
    {
        _db = db;
        _logger = logger;
    }

    public async Task<bool> IsCategoryEnabledAsync(string userId, EmailCategory category, CancellationToken cancellationToken = default)
    {
        if (EmailCategoryMetadata.IsMandatory(category))
            return true;

        var pref = await _db.EmailPreferences
            .FirstOrDefaultAsync(p => p.UserId == userId && p.Category == category.ToString(), cancellationToken);

        return pref?.Enabled ?? EmailPreferenceDefaults.IsEnabledByDefault(category);
    }

    public async Task SetCategoryEnabledAsync(string userId, EmailCategory category, bool enabled, CancellationToken cancellationToken = default)
    {
        if (EmailCategoryMetadata.IsMandatory(category))
        {
            _logger.LogWarning("Attempted to disable mandatory category {Category} for user {UserId}", category, userId);
            return;
        }

        var pref = await _db.EmailPreferences
            .FirstOrDefaultAsync(p => p.UserId == userId && p.Category == category.ToString(), cancellationToken);

        if (pref != null)
        {
            pref.Enabled = enabled;
            pref.UpdatedAt = DateTime.UtcNow;
        }
        else
        {
            _db.EmailPreferences.Add(new EmailPreference
            {
                UserId = userId,
                Category = category.ToString(),
                Enabled = enabled,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            });
        }

        await _db.SaveChangesAsync(cancellationToken);
        _logger.LogInformation("Email preference set: user={UserId} category={Category} enabled={Enabled}", userId, category, enabled);
    }

    public async Task<IReadOnlyDictionary<EmailCategory, bool>> GetAllPreferencesAsync(string userId, CancellationToken cancellationToken = default)
    {
        var prefs = await _db.EmailPreferences
            .Where(p => p.UserId == userId)
            .ToListAsync(cancellationToken);

        var prefDict = prefs.ToDictionary(p => Enum.Parse<EmailCategory>(p.Category), p => p.Enabled);

        var result = new Dictionary<EmailCategory, bool>();
        foreach (var category in EmailPreferenceDefaults.AllCategories)
        {
            result[category] = prefDict.TryGetValue(category, out var enabled)
                ? enabled
                : EmailPreferenceDefaults.IsEnabledByDefault(category);
        }

        return result;
    }

    public async Task InitializeDefaultsAsync(string userId, CancellationToken cancellationToken = default)
    {
        var existing = await _db.EmailPreferences
            .Where(p => p.UserId == userId)
            .Select(p => p.Category)
            .ToListAsync(cancellationToken);

        var now = DateTime.UtcNow;
        foreach (var category in EmailPreferenceDefaults.AllCategories)
        {
            var catStr = category.ToString();
            if (!existing.Contains(catStr))
            {
                _db.EmailPreferences.Add(new EmailPreference
                {
                    UserId = userId,
                    Category = catStr,
                    Enabled = EmailPreferenceDefaults.IsEnabledByDefault(category),
                    CreatedAt = now,
                    UpdatedAt = now
                });
            }
        }

        await _db.SaveChangesAsync(cancellationToken);
        _logger.LogInformation("Email preferences initialized for user={UserId}", userId);
    }
}