using System;
using System.Threading.Tasks;
using Investa.Application.DTOs;

namespace Investa.Application.Interfaces
{
    /// <summary>
    /// Interface for Support Hub contract (Clean Architecture - Application Layer)
    /// Defines the strict contract for SignalR support chat functionality
    /// Hub Route: /hubs/chat
    /// </summary>
    public interface ISupportHub
    {
        /// <summary>
        /// Inbound method: Client requests support
        /// Frontend/Mobile calls: RequestSupport(string category, string metadataJson)
        /// `metadataJson` should deserialize to SupportRequestDto
        /// </summary>
        Task RequestSupport(string category, string metadataJson);

        /// <summary>
        /// Inbound method: Send a message in a conversation
        /// All IDs are strings to maintain SignalR compatibility with mobile clients.
        /// </summary>
        Task SendMessage(string conversationId, string messageText);

        /// <summary>
        /// Inbound method: Close a conversation (mark inactive) and notify admins
        /// Accepts string id for SignalR clients.
        /// </summary>
        Task CloseConversation(string conversationId);

        /// <summary>
        /// Inbound method: Client leaves a conversation (mark closed) and optionally notify admins
        /// Accepts string because some clients send the Guid as a string.
        /// </summary>
        Task LeaveConversation(string conversationId);

        /// <summary>
        /// Inbound method: Join a conversation (add caller to group). Conversation id is a string.
        /// </summary>
        Task JoinConversation(string conversationId);
    }
} 
