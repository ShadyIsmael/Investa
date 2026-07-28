using System.Globalization;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using Investa.Application.DTOs;
using Investa.Application.Interfaces;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Investa.Infrastructure.Services.Email;

public sealed class MailerSendEmailProvider : IEmailProvider
{
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly EmailOptions _options;
    private readonly ILogger<MailerSendEmailProvider> _logger;

    public string Name => "MailerSend";

    public MailerSendEmailProvider(
        IHttpClientFactory httpClientFactory,
        IOptions<EmailOptions> options,
        ILogger<MailerSendEmailProvider> logger)
    {
        _httpClientFactory = httpClientFactory;
        _options = options.Value;
        _logger = logger;
    }

    public async Task<EmailProviderResult> SendAsync(EmailMessage message, CancellationToken cancellationToken = default)
    {
        var apiKey = _options.MailerSend.ApiKey;
        if (string.IsNullOrWhiteSpace(apiKey))
        {
            _logger.LogError("MailerSend API key is not configured");
            return new EmailProviderResult
            {
                Success = false,
                FailureReason = "MailerSend API key is not configured",
                IsRetryable = false
            };
        }

        var payload = new
        {
            from = new
            {
                email = message.SenderEmail ?? _options.Sender.Email,
                name = message.SenderName ?? _options.Sender.Name
            },
            to = new[]
            {
                new { email = message.Recipient }
            },
            subject = message.Subject,
            html = message.HtmlBody,
            text = message.PlainTextBody ?? string.Empty,
            attachments = message.Attachments?.Select(attachment => new
            {
                filename = attachment.FileName,
                content = Convert.ToBase64String(attachment.Content),
                disposition = "attachment",
                id = attachment.ContentId
            }).ToArray()
        };

        var client = _httpClientFactory.CreateClient("MailerSend");
        client.BaseAddress = new Uri(_options.MailerSend.BaseUrl.TrimEnd('/') + "/");
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);
        client.Timeout = TimeSpan.FromSeconds(_options.TimeoutSeconds);

        try
        {
            _logger.LogInformation(
                "Sending email via MailerSend to {Recipient} subject={Subject}",
                message.Recipient, message.Subject);

            using var cts = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
            cts.CancelAfter(TimeSpan.FromSeconds(_options.TimeoutSeconds));

            var response = await client.PostAsJsonAsync("email", payload, cts.Token);
            var body = await response.Content.ReadAsStringAsync(cancellationToken);

            if (response.IsSuccessStatusCode)
            {
                var providerMessageId = ExtractMessageId(body, response);
                _logger.LogInformation(
                    "Email sent via MailerSend to {Recipient} messageId={MessageId}",
                    message.Recipient, providerMessageId);

                return new EmailProviderResult
                {
                    Success = true,
                    ProviderMessageId = providerMessageId
                };
            }

            var failureReason = $"MailerSend API returned {(int)response.StatusCode}: {Truncate(body, 500)}";
            _logger.LogWarning(
                "MailerSend API error to {Recipient} status={Status} body={Body}",
                message.Recipient, (int)response.StatusCode, Truncate(body, 500));

            return new EmailProviderResult
            {
                Success = false,
                FailureReason = failureReason,
                IsRetryable = IsTransientHttpError((int)response.StatusCode)
            };
        }
        catch (TaskCanceledException ex) when (!cancellationToken.IsCancellationRequested)
        {
            _logger.LogWarning(ex, "MailerSend request timed out for {Recipient}", message.Recipient);
            return new EmailProviderResult
            {
                Success = false,
                FailureReason = "Request timed out",
                IsRetryable = true
            };
        }
        catch (HttpRequestException ex)
        {
            _logger.LogWarning(ex, "MailerSend HTTP request failed for {Recipient}", message.Recipient);
            return new EmailProviderResult
            {
                Success = false,
                FailureReason = $"HTTP request failed: {ex.Message}",
                IsRetryable = true
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected MailerSend error for {Recipient}", message.Recipient);
            return new EmailProviderResult
            {
                Success = false,
                FailureReason = $"Unexpected error: {ex.Message}",
                IsRetryable = false
            };
        }
    }

    private static string? ExtractMessageId(string body, HttpResponseMessage response)
    {
        if (response.Headers.TryGetValues("X-Message-Id", out var values))
            return values.FirstOrDefault();
        if (response.Headers.TryGetValues("x-message-id", out values))
            return values.FirstOrDefault();
        return null;
    }

    private static bool IsTransientHttpError(int statusCode) => statusCode switch
    {
        429 => true,
        >= 500 and < 600 => true,
        _ => false
    };

    private static string Truncate(string value, int maxLength) =>
        value.Length <= maxLength ? value : value[..maxLength];
}
