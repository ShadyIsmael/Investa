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
        message.From.Add(new MailboxAddress(_options.SenderName, _options.SenderEmail));
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
            var secureOptions = _options.EnableSsl
                ? SecureSocketOptions.StartTlsWhenAvailable
                : SecureSocketOptions.None;

            // SMTP connection errors are surfaced separately in logging below.
            await smtp.ConnectAsync(_options.Host, _options.Port, secureOptions, cancellationToken);

            // If server supports STARTTLS and we requested it, authentication still happens after.
            if (!string.IsNullOrWhiteSpace(_options.Username) && !string.IsNullOrWhiteSpace(_options.Password))
            {
                await smtp.AuthenticateAsync(_options.Username, _options.Password, cancellationToken);
            }

            await smtp.SendAsync(message, cancellationToken);

            _logger.LogInformation(
                "Email sent. To={To} Subject={Subject} Host={Host} Sender={Sender}",
                request.To,
                request.Subject,
                _options.Host,
                _options.SenderEmail);

            await smtp.DisconnectAsync(true, cancellationToken);
        }
        catch (SmtpCommandException ex)
        {
            _logger.LogError(
                ex,
                "SMTP command failed while sending email. To={To} Subject={Subject} Host={Host}",
                request.To,
                request.Subject,
                _options.Host);
            throw;
        }
        catch (SmtpProtocolException ex)
        {
            _logger.LogError(
                ex,
                "SMTP protocol error while sending email. To={To} Subject={Subject} Host={Host}",
                request.To,
                request.Subject,
                _options.Host);
            throw;
        }
        catch (System.Net.Sockets.SocketException ex)
        {
            _logger.LogError(
                ex,
                "SMTP connection error while sending email. To={To} Subject={Subject} Host={Host}",
                request.To,
                request.Subject,
                _options.Host);
            throw;
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "Email failed. To={To} Subject={Subject} Host={Host} Sender={Sender}",
                request.To,
                request.Subject,
                _options.Host,
                _options.SenderEmail);
            throw;
        }
    }

    public async Task<bool> VerifyConnectionAsync(CancellationToken cancellationToken = default)
    {
        using var smtp = new SmtpClient();

        try
        {
            var secureOptions = _options.EnableSsl
                ? SecureSocketOptions.StartTlsWhenAvailable
                : SecureSocketOptions.None;

            await smtp.ConnectAsync(_options.Host, _options.Port, secureOptions, cancellationToken);
            _logger.LogInformation("SMTP connected. Host={Host} Port={Port}", _options.Host, _options.Port);

            if (!string.IsNullOrWhiteSpace(_options.Username) && !string.IsNullOrWhiteSpace(_options.Password))
            {
                await smtp.AuthenticateAsync(_options.Username, _options.Password, cancellationToken);
                _logger.LogInformation("SMTP authenticated. Username={Username}", _options.Username);
            }

            await smtp.DisconnectAsync(true, cancellationToken);
            return true;
        }
        catch (SmtpCommandException ex)
        {
            _logger.LogError(ex, "SMTP connection verification failed. Command error. Host={Host} Port={Port}", _options.Host, _options.Port);
            return false;
        }
        catch (SmtpProtocolException ex)
        {
            _logger.LogError(ex, "SMTP connection verification failed. Protocol error. Host={Host} Port={Port}", _options.Host, _options.Port);
            return false;
        }
        catch (System.Net.Sockets.SocketException ex)
        {
            _logger.LogError(ex, "SMTP connection verification failed. Socket error. Host={Host} Port={Port}", _options.Host, _options.Port);
            return false;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "SMTP connection verification failed. Host={Host} Port={Port}", _options.Host, _options.Port);
            return false;
        }
    }
}

