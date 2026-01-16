namespace Investa.Application.Interfaces;

public interface ISmsSender
{
    Task SendSmsAsync(string phoneNumber, string message);
}