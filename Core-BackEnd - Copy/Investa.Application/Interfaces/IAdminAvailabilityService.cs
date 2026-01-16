using System.Collections.Generic;
using System.Threading.Tasks;

namespace Investa.Application.Interfaces
{
    public interface IAdminAvailabilityService
    {
        Task<bool> IsAdminOnlineAsync(string adminId);
        Task SetAdminOnlineAsync(string adminId, int maxConcurrentChats = 3);
        Task SetAdminOfflineAsync(string adminId);
        Task<string?> GetNextAvailableAdminAsync();
        Task<int> GetAdminActiveChatCountAsync(string adminId);
        Task<bool> CanAdminAcceptChatAsync(string adminId);
        Task IncrementAdminChatCountAsync(string adminId);
        Task DecrementAdminChatCountAsync(string adminId);
        Task<IEnumerable<string>> GetOnlineAdminsAsync();
    }
}