using System.Text.Encodings.Web;
using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using MimeKit;
using Investa.Application.DTOs;
using Investa.Application.Interfaces;

namespace Investa.Infrastructure.Services;

public class GmailSmtpEmailService : IEmailService
{
    private readonly EmailOptions _options;
    private readonly ILogger<GmailSmtpEmailService> _logger;

    public GmailSmtpEmailService(IOptions<EmailOptions> options, ILogger<GmailSmtpEmailService> logger)
    {
        _options = options.Value;
        _logger = logger;
    }

    public async Task SendEmailAsync(SendEmailRequest request, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(request.To))
            throw new ArgumentException("Email 'To' is required.", nameof(request));

        if (string.IsNullOrWhiteSpace(request.Subject))
            throw new ArgumentException("Email 'Subject' is required.", nameof(request));

        if (string.IsNullOrWhiteSpace(request.HtmlBody))
            throw new ArgumentException("Email 'HtmlBody' is required.", nameof(request));

        var message = new MimeMessage();
        message.From.Add(new MailboxAddress(_options.Sender.Name, _options.Sender.Email));
        message.To.Add(MailboxAddress.Parse(request.To));
        message.Subject = request.Subject;

        var bodyBuilder = new BodyBuilder
        {
            HtmlBody = request.HtmlBody
        };
        message.Body = bodyBuilder.ToMessageBody();

        using var smtp = new SmtpClient();

        try
        {
            var secureOptions = _options.Smtp.EnableSsl
                ? SecureSocketOptions.StartTlsWhenAvailable
                : SecureSocketOptions.None;

            await smtp.ConnectAsync(_options.Smtp.Host, _options.Smtp.Port, secureOptions, cancellationToken);

            if (!string.IsNullOrWhiteSpace(_options.Smtp.Username) && !string.IsNullOrWhiteSpace(_options.Smtp.Password))
            {
                await smtp.AuthenticateAsync(_options.Smtp.Username, _options.Smtp.Password, cancellationToken);
            }

            await smtp.SendAsync(message, cancellationToken);

            _logger.LogInformation(
                "Email sent. To={To} Subject={Subject} Host={Host} Sender={Sender}",
                request.To,
                request.Subject,
                _options.Smtp.Host,
                _options.Sender.Email);

            await smtp.DisconnectAsync(true, cancellationToken);
        }
        catch (SmtpCommandException ex)
        {
            _logger.LogError(ex, "SMTP command failed while sending email. To={To} Subject={Subject} Host={Host}", request.To, request.Subject, _options.Smtp.Host);
            throw;
        }
        catch (SmtpProtocolException ex)
        {
            _logger.LogError(ex, "SMTP protocol error while sending email. To={To} Subject={Subject} Host={Host}", request.To, request.Subject, _options.Smtp.Host);
            throw;
        }
        catch (System.Net.Sockets.SocketException ex)
        {
            _logger.LogError(ex, "SMTP connection error while sending email. To={To} Subject={Subject} Host={Host}", request.To, request.Subject, _options.Smtp.Host);
            throw;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Email failed. To={To} Subject={Subject} Host={Host} Sender={Sender}", request.To, request.Subject, _options.Smtp.Host, _options.Sender.Email);
            throw;
        }
    }

    public Task<long> SendTemplatedEmailAsync(SendTemplatedEmailRequest request, CancellationToken cancellationToken = default)
    {
        throw new NotSupportedException("GmailSmtpEmailService does not support templated emails. Use the outbox-based EmailService instead.");
    }

    public async Task<bool> VerifyConnectionAsync(CancellationToken cancellationToken = default)
    {
        using var smtp = new SmtpClient();

        try
        {
            var secureOptions = _options.Smtp.EnableSsl
                ? SecureSocketOptions.StartTlsWhenAvailable
                : SecureSocketOptions.None;

            await smtp.ConnectAsync(_options.Smtp.Host, _options.Smtp.Port, secureOptions, cancellationToken);
            _logger.LogInformation("SMTP connected. Host={Host} Port={Port}", _options.Smtp.Host, _options.Smtp.Port);

            if (!string.IsNullOrWhiteSpace(_options.Smtp.Username) && !string.IsNullOrWhiteSpace(_options.Smtp.Password))
            {
                await smtp.AuthenticateAsync(_options.Smtp.Username, _options.Smtp.Password, cancellationToken);
                _logger.LogInformation("SMTP authenticated. Username={Username}", _options.Smtp.Username);
            }

            await smtp.DisconnectAsync(true, cancellationToken);
            return true;
        }
        catch (SmtpCommandException ex)
        {
            _logger.LogError(ex, "SMTP connection verification failed. Command error. Host={Host} Port={Port}", _options.Smtp.Host, _options.Smtp.Port);
            return false;
        }
        catch (SmtpProtocolException ex)
        {
            _logger.LogError(ex, "SMTP connection verification failed. Protocol error. Host={Host} Port={Port}", _options.Smtp.Host, _options.Smtp.Port);
            return false;
        }
        catch (System.Net.Sockets.SocketException ex)
        {
            _logger.LogError(ex, "SMTP connection verification failed. Socket error. Host={Host} Port={Port}", _options.Smtp.Host, _options.Smtp.Port);
            return false;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "SMTP connection verification failed. Host={Host} Port={Port}", _options.Smtp.Host, _options.Smtp.Port);
            return false;
        }
    }
}
