using System.Threading.Tasks;

namespace Investa.Application.Interfaces
{
    /// <summary>
    /// Service interface for handling Firebase Cloud Messaging push notifications
    /// </summary>
    public interface INotificationService
    {
        /// <summary>
        /// Registers or updates a user's FCM device token
        /// </summary>
        /// <param name="userId">User identifier</param>
        /// <param name="fcmToken">Firebase Cloud Messaging token</param>
        /// <param name="deviceType">Type of device (Web/Android/iOS)</param>
        /// <returns>True if successful, false otherwise</returns>
        Task<bool> RegisterTokenAsync(string userId, string fcmToken, string deviceType);

        /// <summary>
        /// Sends a push notification to all devices registered for a specific user
        /// </summary>
        /// <param name="userId">User identifier to send notification to</param>
        /// <param name="title">Notification title</param>
        /// <param name="body">Notification body/message</param>
        /// <returns>Result containing success status and statistics</returns>
        Task<(bool Success, int TokensFound, int SuccessCount, int FailureCount, string Message)> SendNotificationAsync(
            string userId, 
            string title, 
            string body,
            System.Collections.Generic.IDictionary<string, string>? data = null);

        /// <summary>
        /// Cleans up expired or invalid tokens for a specific user
        /// </summary>
        /// <param name="userId">User identifier</param>
        /// <returns>Number of tokens removed</returns>
        Task<int> CleanupExpiredTokensAsync(string userId);
    }
}
