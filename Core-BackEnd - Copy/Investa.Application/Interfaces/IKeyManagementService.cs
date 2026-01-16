using System.Threading.Tasks;

namespace Investa.Application.Interfaces
{
    public interface IKeyManagementService
    {
        /// <summary>
        /// Wrap the provided DEK using the KEK and return wrapped bytes along with nonce, tag and key identifier.
        /// </summary>
        Task<(byte[] WrappedDek, byte[] Nonce, byte[] Tag, string KeyId)> WrapDekAsync(byte[] dek);

        /// <summary>
        /// Unwrap the provided wrapped DEK using context (nonce/tag/keyId) and return plaintext DEK.
        /// </summary>
        Task<byte[]> UnwrapDekAsync(byte[] wrappedDek, byte[] nonce, byte[] tag, string keyId);

        /// <summary>
        /// Returns the current KEK identifier.
        /// </summary>
        string GetCurrentKeyId();
    }
}