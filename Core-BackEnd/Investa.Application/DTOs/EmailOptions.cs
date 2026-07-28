namespace Investa.Application.DTOs;

public class EmailOptions
{
    public string Provider { get; set; } = "MailerSend";
    public MailerSendOptions MailerSend { get; set; } = new();
    public SmtpOptions Smtp { get; set; } = new();
    public EmailSenderOptions Sender { get; set; } = new();
    public EmailRetryOptions Retry { get; set; } = new();
    public int TimeoutSeconds { get; set; } = 30;
    public EmailQueueOptions Queue { get; set; } = new();
}

public class MailerSendOptions
{
    public string ApiKey { get; set; } = string.Empty;
    public string BaseUrl { get; set; } = "https://api.mailersend.com/v1";
}

public class SmtpOptions
{
    public string Host { get; set; } = string.Empty;
    public int Port { get; set; } = 587;
    public string Username { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public bool EnableSsl { get; set; } = true;
}

public class EmailSenderOptions
{
    public string Name { get; set; } = "FOPX One";
    public string Email { get; set; } = "no-reply@fopx.one";
}

public class EmailRetryOptions
{
    public int MaxRetries { get; set; } = 3;
    public int BaseDelaySeconds { get; set; } = 5;
    public bool ExponentialBackoff { get; set; } = true;
}

public class EmailQueueOptions
{
    public int BatchSize { get; set; } = 10;
    public int PollingIntervalSeconds { get; set; } = 10;
    public int MaxDequeueAttempts { get; set; } = 3;
}
