using Investa.Domain.Entities.Enums;

namespace Investa.Application.Interfaces;

public interface IEmailPreferenceService
{
    Task<bool> IsCategoryEnabledAsync(string userId, EmailCategory category, CancellationToken cancellationToken = default);

    Task SetCategoryEnabledAsync(string userId, EmailCategory category, bool enabled, CancellationToken cancellationToken = default);

    Task<IReadOnlyDictionary<EmailCategory, bool>> GetAllPreferencesAsync(string userId, CancellationToken cancellationToken = default);

    Task InitializeDefaultsAsync(string userId, CancellationToken cancellationToken = default);
}