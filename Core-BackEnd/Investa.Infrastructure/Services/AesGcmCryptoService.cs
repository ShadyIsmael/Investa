using System;
using System.Security.Cryptography;
using System.Threading.Tasks;
using Investa.Application.Interfaces;

namespace Investa.Infrastructure.Services
{
    public class AesGcmCryptoService : ICryptoService
    {
        public Task<(byte[] CipherText, byte[] Nonce, byte[] Tag)> EncryptAsync(byte[] plain, byte[] dek, byte[]? associatedData = null)
        {
            var nonce = RandomNumberGenerator.GetBytes(12);
            var cipher = new byte[plain.Length];
            var tag = new byte[16];
            using (var aes = new AesGcm(dek))
            {
                aes.Encrypt(nonce, plain, cipher, tag, associatedData);
            }
            return Task.FromResult((cipher, nonce, tag));
        }

        public Task<byte[]> DecryptAsync(byte[] cipherText, byte[] nonce, byte[] tag, byte[] dek, byte[]? associatedData = null)
        {
            var plain = new byte[cipherText.Length];
            using (var aes = new AesGcm(dek))
            {
                aes.Decrypt(nonce, cipherText, tag, plain, associatedData);
            }
            return Task.FromResult(plain);
        }
    }
}
