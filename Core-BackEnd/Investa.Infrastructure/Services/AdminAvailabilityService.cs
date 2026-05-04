using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Investa.Domain.Entities;
using Investa.Infrastructure.Identity;
using Investa.Infrastructure.Persistence;
using Investa.Application.Interfaces;

namespace Investa.Infrastructure.Services
{
    public class AdminAvailabilityService : IAdminAvailabilityService
    {
        private readonly IServiceScopeFactory _serviceScopeFactory;

        // In-memory tracking of admin status
        private readonly ConcurrentDictionary<string, AdminStatus> _adminStatuses = new();

        public AdminAvailabilityService(IServiceScopeFactory serviceScopeFactory)
        {
            _serviceScopeFactory = serviceScopeFactory;
        }

        public async Task<bool> IsAdminOnlineAsync(string adminId)
        {
            return _adminStatuses.ContainsKey(adminId) &&
                   _adminStatuses[adminId].IsOnline &&
                   _adminStatuses[adminId].LastSeen > DateTimeOffset.UtcNow.AddMinutes(-5); // 5 minute timeout
        }

        public async Task SetAdminOnlineAsync(string adminId, int maxConcurrentChats = 3)
        {
            using var scope = _serviceScopeFactory.CreateScope();
            var userManager = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationIdentityUser>>();
            
            // Verify user is actually an admin
            var user = await userManager.FindByIdAsync(adminId);
            if (user == null)
                throw new ArgumentException("User not found");

            var isAdmin = await userManager.IsInRoleAsync(user, "Admin") ||
                         await userManager.IsInRoleAsync(user, "OrgUser");
            if (!isAdmin)
                throw new UnauthorizedAccessException("User is not an admin");

            _adminStatuses[adminId] = new AdminStatus
            {
                AdminId = adminId,
                IsOnline = true,
                MaxConcurrentChats = maxConcurrentChats,
                ActiveChatCount = 0,
                LastSeen = DateTimeOffset.UtcNow
            };
        }

        public async Task SetAdminOfflineAsync(string adminId)
        {
            if (_adminStatuses.ContainsKey(adminId))
            {
                _adminStatuses[adminId].IsOnline = false;
            }
        }

        public async Task<string?> GetNextAvailableAdminAsync()
        {
            var onlineAdmins = _adminStatuses
                .Where(kvp => kvp.Value.IsOnline &&
                             kvp.Value.LastSeen > DateTimeOffset.UtcNow.AddMinutes(-5) &&
                             kvp.Value.ActiveChatCount < kvp.Value.MaxConcurrentChats)
                .OrderBy(kvp => kvp.Value.ActiveChatCount) // Least busy first
                .ThenBy(kvp => kvp.Value.LastSeen) // Then by who was active most recently
                .Select(kvp => kvp.Key)
                .ToList();

            return onlineAdmins.FirstOrDefault();
        }

        public async Task<int> GetAdminActiveChatCountAsync(string adminId)
        {
            return _adminStatuses.ContainsKey(adminId) ? _adminStatuses[adminId].ActiveChatCount : 0;
        }

        public async Task<bool> CanAdminAcceptChatAsync(string adminId)
        {
            if (!_adminStatuses.ContainsKey(adminId))
                return false;

            var status = _adminStatuses[adminId];
            return status.IsOnline &&
                   status.LastSeen > DateTimeOffset.UtcNow.AddMinutes(-5) &&
                   status.ActiveChatCount < status.MaxConcurrentChats;
        }

        public async Task IncrementAdminChatCountAsync(string adminId)
        {
            if (_adminStatuses.ContainsKey(adminId))
            {
                _adminStatuses[adminId].ActiveChatCount++;
                _adminStatuses[adminId].LastSeen = DateTimeOffset.UtcNow;
            }
        }

        public async Task DecrementAdminChatCountAsync(string adminId)
        {
            if (_adminStatuses.ContainsKey(adminId) && _adminStatuses[adminId].ActiveChatCount > 0)
            {
                _adminStatuses[adminId].ActiveChatCount--;
                _adminStatuses[adminId].LastSeen = DateTimeOffset.UtcNow;
            }
        }

        public async Task<IEnumerable<string>> GetOnlineAdminsAsync()
        {
            return _adminStatuses
                .Where(kvp => kvp.Value.IsOnline &&
                             kvp.Value.LastSeen > DateTimeOffset.UtcNow.AddMinutes(-5))
                .Select(kvp => kvp.Key)
                .ToList();
        }

        private class AdminStatus
        {
            public string AdminId { get; set; } = string.Empty;
            public bool IsOnline { get; set; }
            public int MaxConcurrentChats { get; set; }
            public int ActiveChatCount { get; set; }
            public DateTimeOffset LastSeen { get; set; }
        }
    }
}