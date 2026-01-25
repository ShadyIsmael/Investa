using Investa.Domain.Entities;

namespace Investa.Application.Interfaces;

/// <summary>
/// Specialized repository for Investment entities with support for complex nested includes.
/// </summary>
public interface IInvestmentRepository : IRepository<Investment>
{
    /// <summary>
    /// Gets an investment by ID with all related data for display:
    /// TeamMembers (with User and UserProfile), Participants (with Investor and Profile)
    /// </summary>
    Task<Investment?> GetByIdWithFullDetailsAsync(int id);

    /// <summary>
    /// Gets all investments with full details including nested team member and participant data.
    /// </summary>
    Task<IEnumerable<Investment>> GetAllWithFullDetailsAsync();

    /// <summary>
    /// Gets investments by category with full details including nested team member and participant data.
    /// </summary>
    Task<IEnumerable<Investment>> GetByCategoryWithFullDetailsAsync(int categoryId);
}
