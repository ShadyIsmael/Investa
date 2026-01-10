using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Investa.Application.DTOs;
using Investa.Application.Interfaces;
using Investa.Domain.Entities.Chat;

namespace Investa.Application.Services
{
    public class ChatService : IChatService
    {
        private readonly IUnitOfWork _uow;
        private readonly IKeyManagementService _kms;
        private readonly ICryptoService _crypto;

        public ChatService(IUnitOfWork uow, IKeyManagementService kms, ICryptoService crypto)
        {
            _uow = uow;
            _kms = kms;
            _crypto = crypto;
        }

        public async Task<Guid> CreateConversationAsync(Guid createdBy, IEnumerable<Guid> participantIds, byte type, string? title = null)
        {
            var conv = new Conversation
            {
                Id = Guid.NewGuid(),
                Type = (ConversationType)type,
                CreatedBy = createdBy,
                Title = title,
                CreatedAt = DateTimeOffset.UtcNow
            };

            // Generate DEK
            var dek = new byte[32];
            System.Security.Cryptography.RandomNumberGenerator.Fill(dek);

            var wrap = await _kms.WrapDekAsync(dek);

            conv.WrappedDek = wrap.WrappedDek;
            conv.DekNonce = wrap.Nonce;
            conv.DekTag = wrap.Tag;
            conv.DekKeyId = wrap.KeyId;
            conv.DekVersion = 1;

            conv.Participants = participantIds.Select(pid => new ConversationParticipant { ConversationId = conv.Id, UserId = pid, JoinedAt = DateTimeOffset.UtcNow }).ToList();

            await _uow.Repository<Conversation>().AddAsync(conv);
            await _uow.SaveChangesAsync();

            return conv.Id;
        }

        public async Task<Guid> SendMessageAsync(Guid conversationId, Guid senderId, string plaintext)
        {
            var conv = await _uow.Repository<Conversation>().GetByIdAsync(conversationId);
            if (conv == null) throw new InvalidOperationException("Conversation not found");

            // Verify sender is a participant
            var isParticipant = await _uow.Repository<ConversationParticipant>().ExistsAsync(p => p.ConversationId == conversationId && p.UserId == senderId);
            if (!isParticipant) throw new UnauthorizedAccessException("Sender not a participant of conversation");

            // Unwrap DEK
            if (conv.WrappedDek == null || conv.DekNonce == null || conv.DekTag == null || conv.DekKeyId == null)
                throw new InvalidOperationException("Conversation encryption metadata missing");

            var dek = await _kms.UnwrapDekAsync(conv.WrappedDek, conv.DekNonce, conv.DekTag, conv.DekKeyId);

            var plainBytes = Encoding.UTF8.GetBytes(plaintext);
            var enc = await _crypto.EncryptAsync(plainBytes, dek, BitConverter.GetBytes(conversationId.GetHashCode()));

            var message = new Message
            {
                Id = Guid.NewGuid(),
                ConversationId = conversationId,
                SenderId = senderId,
                CipherText = enc.CipherText,
                Nonce = enc.Nonce,
                Tag = enc.Tag,
                KeyId = conv.DekKeyId,
                Algorithm = "AES-GCM",
                CreatedAt = DateTimeOffset.UtcNow
            };

            await _uow.Repository<Message>().AddAsync(message);
            await _uow.SaveChangesAsync();

            return message.Id;
        }

        public async Task<IEnumerable<ChatMessageDto>> GetMessagesAsync(Guid conversationId, int page = 1, int pageSize = 50)
        {
            var conv = await _uow.Repository<Conversation>().GetByIdAsync(conversationId);
            if (conv == null) throw new InvalidOperationException("Conversation not found");

            if (conv.WrappedDek == null || conv.DekNonce == null || conv.DekTag == null || conv.DekKeyId == null)
                throw new InvalidOperationException("Conversation encryption metadata missing");

            var dek = await _kms.UnwrapDekAsync(conv.WrappedDek, conv.DekNonce, conv.DekTag, conv.DekKeyId);

            var messages = (await _uow.Repository<Message>().FindAsync(m => m.ConversationId == conversationId)).OrderByDescending(m => m.CreatedAt).Skip((page - 1) * pageSize).Take(pageSize).ToList();

            var result = new List<ChatMessageDto>(messages.Count);

            foreach (var m in messages)
            {
                var plainBytes = await _crypto.DecryptAsync(m.CipherText, m.Nonce, m.Tag, dek, BitConverter.GetBytes(conversationId.GetHashCode()));
                var content = Encoding.UTF8.GetString(plainBytes);
                result.Add(new ChatMessageDto
                {
                    Id = m.Id,
                    ConversationId = m.ConversationId,
                    SenderId = m.SenderId,
                    Content = content,
                    CreatedAt = m.CreatedAt
                });
            }

            return result;
        }
    }
}