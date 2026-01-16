using System.Threading.Tasks;

namespace Investa.Application.Interfaces
{
    public interface ICryptoService
    {
        Task<(byte[] CipherText, byte[] Nonce, byte[] Tag)> EncryptAsync(byte[] plain, byte[] dek, byte[]? associatedData = null);
        Task<byte[]> DecryptAsync(byte[] cipherText, byte[] nonce, byte[] tag, byte[] dek, byte[]? associatedData = null);
    }
}