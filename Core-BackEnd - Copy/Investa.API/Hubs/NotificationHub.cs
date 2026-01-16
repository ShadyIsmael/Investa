using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;

namespace Investa.API.Hubs
{
    /// <summary>
    /// SignalR Hub for handling general notifications to users and admins.
    /// Follows naming convention: Hub suffix, async methods, Dto suffixes for data transfer objects.
    /// </summary>
    [Authorize]
    public class NotificationHub : Hub
    {
        private readonly ILogger<NotificationHub> _logger;

        public NotificationHub(ILogger<NotificationHub> logger)
        {
            _logger = logger;
        }

        /// <summary>
        /// Send notification to all connected users.
        /// </summary>
        public async Task SendNotificationToAllAsync(string message)
        {
            _logger.LogInformation("Broadcasting notification to all users: {Message}", message);
            await Clients.All.SendAsync("ReceiveNotification", message);
        }

        /// <summary>
        /// Send notification to a specific user by user ID.
        /// </summary>
        public async Task SendNotificationToUserAsync(string userId, string message)
        {
            if (string.IsNullOrWhiteSpace(userId))
            {
                _logger.LogWarning("SendNotificationToUserAsync called with empty userId");
                await Clients.Caller.SendAsync("Error", "User ID cannot be empty");
                return;
            }

            _logger.LogInformation("Sending notification to user {UserId}: {Message}", userId, message);
            await Clients.User(userId).SendAsync("ReceiveNotification", message);
        }

        /// <summary>
        /// Send notification to a group of users.
        /// </summary>
        public async Task SendNotificationToGroupAsync(string groupName, string message)
        {
            if (string.IsNullOrWhiteSpace(groupName))
            {
                _logger.LogWarning("SendNotificationToGroupAsync called with empty groupName");
                await Clients.Caller.SendAsync("Error", "Group name cannot be empty");
                return;
            }

            _logger.LogInformation("Sending notification to group {GroupName}: {Message}", groupName, message);
            await Clients.Group(groupName).SendAsync("ReceiveNotification", message);
        }

        /// <summary>
        /// Add current connection to a notification group.
        /// </summary>
        public async Task JoinNotificationGroupAsync(string groupName)
        {
            if (string.IsNullOrWhiteSpace(groupName))
            {
                _logger.LogWarning("JoinNotificationGroupAsync called with empty groupName");
                await Clients.Caller.SendAsync("Error", "Group name cannot be empty");
                return;
            }

            await Groups.AddToGroupAsync(Context.ConnectionId, groupName);
            _logger.LogInformation("Connection {ConnectionId} joined group {GroupName}", Context.ConnectionId, groupName);
        }

        /// <summary>
        /// Remove current connection from a notification group.
        /// </summary>
        public async Task LeaveNotificationGroupAsync(string groupName)
        {
            if (string.IsNullOrWhiteSpace(groupName))
            {
                _logger.LogWarning("LeaveNotificationGroupAsync called with empty groupName");
                await Clients.Caller.SendAsync("Error", "Group name cannot be empty");
                return;
            }

            await Groups.RemoveFromGroupAsync(Context.ConnectionId, groupName);
            _logger.LogInformation("Connection {ConnectionId} left group {GroupName}", Context.ConnectionId, groupName);
        }

        /// <summary>
        /// Override disconnect event to log when users disconnect.
        /// </summary>
        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            _logger.LogInformation("Connection {ConnectionId} disconnected", Context.ConnectionId);
            if (exception != null)
            {
                _logger.LogError(exception, "Disconnection error for connection {ConnectionId}", Context.ConnectionId);
            }
            await base.OnDisconnectedAsync(exception);
        }
    }
}
