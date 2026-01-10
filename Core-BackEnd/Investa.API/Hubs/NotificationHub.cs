using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;

namespace Investa.API.Hubs
{
    public class NotificationHub : Hub
    {
        public async Task SendToAll(string message)
        {
            await Clients.All.SendAsync("ReceiveNotification", message);
        }

        public async Task SendToUser(string userId, string message)
        {
            await Clients.User(userId).SendAsync("ReceiveNotification", message);
        }
    }
}
