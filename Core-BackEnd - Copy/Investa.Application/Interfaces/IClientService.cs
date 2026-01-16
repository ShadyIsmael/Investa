using Investa.Application.DTOs;
using System.Collections.Generic;

namespace Investa.Application.Interfaces;

public interface IClientService
{
    Task<(int total, List<ClientAdminDto> items)> GetClientsForAdminAsync(int page, int pageSize, string? search);

    /// <summary>
    /// Returns the top clients ordered by score (descending).
    /// </summary>
    Task<List<ClientAdminDto>> GetTopClientsByScoreAsync(int limit = 100);

    /// <summary>
    /// Change a client's status and record the change with a reason and admin id.
    /// </summary>
    Task<ClientAdminDto?> ChangeClientStatusAsync(int clientId, int newStatusId, string reason, System.Guid adminId);
}
