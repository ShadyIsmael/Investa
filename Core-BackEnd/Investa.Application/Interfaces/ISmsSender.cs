namespace Investa.Application.Interfaces;

public interface ISmsSender
{
    Task SendSmsAsync(string phoneNumber, string message);
}

public sealed class SmsProviderUnavailableException : Exception
{
    public SmsProviderUnavailableException()
        : base("SMS delivery is not configured.")
    {
    }
}
