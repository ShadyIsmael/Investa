using System;
using System.Security.Cryptography;
using System.Threading.Tasks;
using Investa.Application.Interfaces;
using Microsoft.Extensions.Configuration;

namespace Investa.Infrastructure.Services
{
    public class LocalKeyManagementService : IKeyManagementService
    {
        private readonly byte[] _kek;
        private readonly string _keyId;

        public LocalKeyManagementService(IConfiguration configuration)
        {
            // Expect KEK (Key Encrypting Key) as base64 in configuration for dev/testing only
            _keyId = configuration["Chat:KekId"] ?? "local-dev";
            var kekBase64 = configuration["Chat:KekBase64"];
            if (string.IsNullOrWhiteSpace(kekBase64))
            {
                // Generate an ephemeral KEK for development if not provided
                _kek = new byte[32];
                RandomNumberGenerator.Fill(_kek);
            }
            else
            {
                _kek = Convert.FromBase64String(kekBase64);
            }

            if (_kek.Length != 16 && _kek.Length != 24 && _kek.Length != 32)
            {
                throw new InvalidOperationException("KEK must be 16/24/32 bytes for AES key sizes.");
            }
        }

        public string GetCurrentKeyId() => _keyId;

        public Task<(byte[] WrappedDek, byte[] Nonce, byte[] Tag, string KeyId)> WrapDekAsync(byte[] dek)
        {
            // Use AES-GCM to wrap (encrypt) the DEK using KEK
            var nonce = RandomNumberGenerator.GetBytes(12);
            var ciphertext = new byte[dek.Length];
            var tag = new byte[16];
            using (var aes = new AesGcm(_kek))
            {
                aes.Encrypt(nonce, dek, ciphertext, tag, null);
            }

            return Task.FromResult((ciphertext, nonce, tag, _keyId));
        }

        public Task<byte[]> UnwrapDekAsync(byte[] wrappedDek, byte[] nonce, byte[] tag, string keyId)
        {
            // Ignore keyId for local implementation; in production use keyId to locate proper KEK in KMS
            var dek = new byte[wrappedDek.Length];
            using (var aes = new AesGcm(_kek))
            {
                aes.Decrypt(nonce, wrappedDek, tag, dek, null);
            }
            return Task.FromResult(dek);
        }
    }
}
