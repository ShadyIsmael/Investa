using Investa.Application.Interfaces;
using Investa.Domain.Entities;
using Investa.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Investa.Infrastructure.Repositories;

/// <summary>
/// Specialized repository for Investment entities with support for complex nested includes.
/// </summary>
public class InvestmentRepository : Repository<Investment>, IInvestmentRepository
{
    public InvestmentRepository(ApplicationDbContext context) : base(context)
    {
    }

    /// <inheritdoc />
    public async Task<Investment?> GetByIdWithFullDetailsAsync(int id)
    {
        return await _dbSet
            .Include(i => i.Images.OrderBy(img => img.SortOrder))
            .Include(i => i.TeamMembers.Where(tm => tm.IsActive).OrderBy(tm => tm.SortOrder))
                .ThenInclude(tm => tm.User)
                    .ThenInclude(u => u.Profile)
            .Include(i => i.Participants)
                .ThenInclude(p => p.Investor)
                    .ThenInclude(inv => inv!.Profile)
            .FirstOrDefaultAsync(i => i.Id == id);
    }

    /// <inheritdoc />
    public async Task<IEnumerable<Investment>> GetAllWithFullDetailsAsync()
    {
        return await _dbSet
            .Include(i => i.Images.OrderBy(img => img.SortOrder))
            .Include(i => i.TeamMembers.Where(tm => tm.IsActive).OrderBy(tm => tm.SortOrder))
                .ThenInclude(tm => tm.User)
                    .ThenInclude(u => u.Profile)
            .Include(i => i.Participants)
                .ThenInclude(p => p.Investor)
                    .ThenInclude(inv => inv!.Profile)
            .ToListAsync();
    }

    /// <inheritdoc />
    public async Task<IEnumerable<Investment>> GetByCategoryWithFullDetailsAsync(int categoryId)
    {
        return await _dbSet
            .Where(i => i.BusinessCategoryId == categoryId)
            .Include(i => i.Images.OrderBy(img => img.SortOrder))
            .Include(i => i.TeamMembers.Where(tm => tm.IsActive).OrderBy(tm => tm.SortOrder))
                .ThenInclude(tm => tm.User)
                    .ThenInclude(u => u.Profile)
            .Include(i => i.Participants)
                .ThenInclude(p => p.Investor)
                    .ThenInclude(inv => inv!.Profile)
            .ToListAsync();
    }
}
