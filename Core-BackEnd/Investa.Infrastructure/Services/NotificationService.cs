using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using FirebaseAdmin;
using FirebaseAdmin.Messaging;
using Google.Apis.Auth.OAuth2;
using Investa.Application.Interfaces;
using Investa.Domain.Entities;
using Investa.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace Investa.Infrastructure.Services
{
    /// <summary>
    /// Implementation of INotificationService using Firebase Cloud Messaging
    /// Handles device token registration and push notification delivery with automatic token cleanup
    /// </summary>
    public class NotificationService : INotificationService
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<NotificationService> _logger;
        private readonly IConfiguration _configuration;

        public NotificationService(
            ApplicationDbContext context,
            ILogger<NotificationService> logger,
            IConfiguration configuration)
        {
            _context = context;
            _logger = logger;
            _configuration = configuration;
        }

        /// <summary>
        /// Registers or updates a user's FCM device token
        /// </summary>
        public async Task<bool> RegisterTokenAsync(string userId, string fcmToken, string deviceType)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(userId) || string.IsNullOrWhiteSpace(fcmToken))
                {
                    _logger.LogWarning("RegisterTokenAsync called with invalid parameters");
                    return false;
                }

                // Check if token already exists for this user
                var existingToken = await _context.UserTokens
                    .FirstOrDefaultAsync(t => t.UserId == userId);

                if (existingToken != null)
                {
                    // Update existing token
                    existingToken.FcmToken = fcmToken;
                    existingToken.DeviceType = deviceType;
                    existingToken.UpdatedAt = DateTime.UtcNow;
                    existingToken.IsActive = true;

                    _logger.LogInformation("Updated FCM token for user {UserId}, device {DeviceType}", userId, deviceType);
                }
                else
                {
                    // Create new token record
                    var newToken = new UserToken
                    {
                        UserId = userId,
                        FcmToken = fcmToken,
                        DeviceType = deviceType,
                        UpdatedAt = DateTime.UtcNow,
                        CreatedAt = DateTime.UtcNow,
                        IsActive = true
                    };

                    _context.UserTokens.Add(newToken);
                    _logger.LogInformation("Registered new FCM token for user {UserId}, device {DeviceType}", userId, deviceType);
                }

                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error registering FCM token for user {UserId}", userId);
                return false;
            }
        }

        /// <summary>
        /// Sends a push notification to all devices registered for a specific user
        /// Automatically cleans up invalid tokens reported by Firebase
        /// </summary>
        public async Task<(bool Success, int TokensFound, int SuccessCount, int FailureCount, string Message)> SendNotificationAsync(
            string userId,
            string title,
            string body,
            IDictionary<string, string>? data = null)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(userId))
                {
                    return (false, 0, 0, 0, "Invalid user ID");
                }

                // Fetch all active tokens for the user
                var userTokens = await _context.UserTokens
                    .Where(t => t.UserId == userId && t.IsActive)
                    .ToListAsync();

                if (!userTokens.Any())
                {
                    _logger.LogWarning("No active FCM tokens found for user {UserId}", userId);
                    return (false, 0, 0, 0, "No active device tokens found for user");
                }

                _logger.LogInformation("Found {TokenCount} active tokens for user {UserId}", userTokens.Count, userId);

                // Prepare Data payload
                var dataPayload = new Dictionary<string, string>
                {
                    { "timestamp", DateTime.UtcNow.ToString("o") },
                    { "userId", userId }
                };

                // Merge custom data if provided
                if (data != null)
                {
                    foreach (var kvp in data)
                    {
                        if (dataPayload.ContainsKey(kvp.Key))
                            dataPayload[kvp.Key] = kvp.Value;
                        else
                            dataPayload.Add(kvp.Key, kvp.Value);
                    }
                }

                // Build the message
                var message = new FirebaseAdmin.Messaging.Message
                {
                    Notification = new Notification
                    {
                        Title = title,
                        Body = body
                    },
                    // Add data payload for custom handling
                    Data = dataPayload
                };

                var tokensToSend = userTokens.Select(t => t.FcmToken).ToList();
                int successCount = 0;
                int failureCount = 0;
                var invalidTokens = new List<string>();

                // Send to multiple tokens using MulticastMessage
                if (tokensToSend.Count == 1)
                {
                    // Single token - use SendAsync
                    message.Token = tokensToSend[0];
                    try
                    {
                        var response = await FirebaseMessaging.DefaultInstance.SendAsync(message);
                        _logger.LogInformation("Successfully sent notification to user {UserId}. Response: {Response}", userId, response);
                        successCount = 1;
                    }
                    catch (FirebaseMessagingException ex)
                    {
                        _logger.LogWarning(ex, "Failed to send notification to user {UserId}. Error: {Error}", userId, ex.MessagingErrorCode);
                        failureCount = 1;

                        // Check if token is invalid
                        if (IsTokenInvalidError(ex))
                        {
                            invalidTokens.Add(tokensToSend[0]);
                        }
                    }
                }
                else
                {
                    // Multiple tokens - use SendMulticastAsync
                    var multicastMessage = new MulticastMessage
                    {
                        Tokens = tokensToSend,
                        Notification = new Notification
                        {
                            Title = title,
                            Body = body
                        },
                        Data = new Dictionary<string, string>
                        {
                            { "timestamp", DateTime.UtcNow.ToString("o") },
                            { "userId", userId }
                        }
                    };

                    var response = await FirebaseMessaging.DefaultInstance.SendEachForMulticastAsync(multicastMessage);
                    successCount = response.SuccessCount;
                    failureCount = response.FailureCount;

                    _logger.LogInformation(
                        "Multicast notification sent to user {UserId}. Success: {SuccessCount}, Failures: {FailureCount}",
                        userId, response.SuccessCount, response.FailureCount);

                    // Check for failed tokens and mark them as invalid
                    if (response.FailureCount > 0)
                    {
                        for (int i = 0; i < response.Responses.Count; i++)
                        {
                            if (!response.Responses[i].IsSuccess)
                            {
                                var exception = response.Responses[i].Exception;
                                if (exception is FirebaseMessagingException msgEx && IsTokenInvalidError(msgEx))
                                {
                                    invalidTokens.Add(tokensToSend[i]);
                                    _logger.LogWarning("Invalid token detected for user {UserId}: {Token}", userId, tokensToSend[i].Substring(0, Math.Min(20, tokensToSend[i].Length)));
                                }
                            }
                        }
                    }
                }

                // Clean up invalid tokens
                if (invalidTokens.Any())
                {
                    await MarkTokensAsInactiveAsync(invalidTokens);
                    _logger.LogInformation("Marked {Count} invalid tokens as inactive for user {UserId}", invalidTokens.Count, userId);
                }

                var successMessage = $"Notification sent. Success: {successCount}, Failures: {failureCount}";
                return (successCount > 0, userTokens.Count, successCount, failureCount, successMessage);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending notification to user {UserId}", userId);
                return (false, 0, 0, 0, $"Error: {ex.Message}");
            }
        }

        /// <summary>
        /// Cleans up expired or invalid tokens for a specific user
        /// </summary>
        public async Task<int> CleanupExpiredTokensAsync(string userId)
        {
            try
            {
                var inactiveTokens = await _context.UserTokens
                    .Where(t => t.UserId == userId && !t.IsActive)
                    .ToListAsync();

                if (inactiveTokens.Any())
                {
                    _context.UserTokens.RemoveRange(inactiveTokens);
                    await _context.SaveChangesAsync();
                    _logger.LogInformation("Cleaned up {Count} inactive tokens for user {UserId}", inactiveTokens.Count, userId);
                    return inactiveTokens.Count;
                }

                return 0;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error cleaning up tokens for user {UserId}", userId);
                return 0;
            }
        }

        /// <summary>
        /// Marks tokens as inactive in the database
        /// </summary>
        private async Task MarkTokensAsInactiveAsync(List<string> tokens)
        {
            var tokensToUpdate = await _context.UserTokens
                .Where(t => tokens.Contains(t.FcmToken))
                .ToListAsync();

            foreach (var token in tokensToUpdate)
            {
                token.IsActive = false;
                token.UpdatedAt = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();
        }

        /// <summary>
        /// Checks if a FirebaseMessagingException indicates an invalid token
        /// </summary>
        private bool IsTokenInvalidError(FirebaseMessagingException ex)
        {
            return ex.MessagingErrorCode == MessagingErrorCode.InvalidArgument ||
                   ex.MessagingErrorCode == MessagingErrorCode.Unregistered ||
                   ex.MessagingErrorCode == MessagingErrorCode.SenderIdMismatch;
        }
    }
}
