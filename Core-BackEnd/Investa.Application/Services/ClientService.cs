using AutoMapper;
using Investa.Application.DTOs;
using Investa.Application.Interfaces;
using Investa.Domain.Entities;

namespace Investa.Application.Services;

public class ClientService : IClientService
{
    private readonly IUnitOfWork _uow;
    private readonly IMapper _mapper;

    public ClientService(IUnitOfWork uow, IMapper mapper)
    {
        _uow = uow;
        _mapper = mapper;
    }

    public async Task<(int total, List<ClientAdminDto> items)> GetClientsForAdminAsync(int page, int pageSize, string? search)
    {
        // Get all Client users (external users), excluding OrgUsers (internal staff)
        var all = (await _uow.Repository<Client>()
            .FindAsync(c => c.User.UserType == Investa.Domain.Entities.Enums.UserType.Client))
            .ToList();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.Trim();
            all = all.Where(c => (c.FirstName ?? string.Empty).Contains(s, StringComparison.OrdinalIgnoreCase)
                               || (c.LastName ?? string.Empty).Contains(s, StringComparison.OrdinalIgnoreCase)
                               || (c.MobileNumber ?? string.Empty).Contains(s, StringComparison.OrdinalIgnoreCase)
                               || (c.Phone ?? string.Empty).Contains(s, StringComparison.OrdinalIgnoreCase))
                     .ToList();
        }

        var total = all.Count;
        var items = all.OrderByDescending(c => c.CreatedAt)
                       .Skip((page - 1) * pageSize)
                       .Take(pageSize)
                       .Select(c => _mapper.Map<ClientAdminDto>(c))
                       .ToList();

        return (total, items);
    }

    public async Task<List<ClientAdminDto>> GetTopClientsByScoreAsync(int limit = 100)
    {
        if (limit <= 0) limit = 100;

        // Get all Client users (external users), excluding OrgUsers (internal staff)
        var all = (await _uow.Repository<Client>()
            .FindAsync(c => c.User.UserType == Investa.Domain.Entities.Enums.UserType.Client))
            .ToList();

        var top = all.OrderByDescending(c => c.Score)
                     .ThenByDescending(c => c.CreatedAt)
                     .Take(limit)
                     .Select(c => _mapper.Map<ClientAdminDto>(c))
                     .ToList();

        return top;
    }

    public async Task<ClientAdminDto?> ChangeClientStatusAsync(int clientId, int newStatusId, string reason, System.Guid adminId)
    {
        // Begin a transaction to ensure atomicity
        await _uow.BeginTransactionAsync();
        try
        {
            var client = await _uow.Repository<Client>().GetSingleAsync(c => c.Id == clientId, c => c.Status);
            if (client == null) return null;

            var oldStatusId = client.StatusId;

            // validate new status exists
            var newStatus = await _uow.Repository<ClientStatus>().GetByIdAsync(newStatusId);
            if (newStatus == null)
            {
                await _uow.RollbackTransactionAsync();
                return null;
            }

            client.StatusId = newStatusId;
            client.UpdatedAt = DateTime.UtcNow;
            await _uow.Repository<Client>().UpdateAsync(client);

            var history = new ClientStatusHistory
            {
                ClientId = client.Id,
                OldStatusId = oldStatusId,
                NewStatusId = newStatusId,
                Reason = reason,
                ChangedByAdminId = adminId,
                ChangedAt = DateTime.UtcNow
            };

            await _uow.Repository<ClientStatusHistory>().AddAsync(history);

            await _uow.SaveChangesAsync();
            await _uow.CommitTransactionAsync();

            return _mapper.Map<ClientAdminDto>(client);
        }
        catch
        {
            await _uow.RollbackTransactionAsync();
            throw;
        }
    }
}
