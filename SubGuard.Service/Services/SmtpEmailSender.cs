using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using MimeKit;
using SubGuard.Core.Models;
using SubGuard.Core.Services;

namespace SubGuard.Service.Services
{
    public class SmtpEmailSender : IEmailSender
    {
        private readonly EmailSettings _settings;
        private readonly ILogger<SmtpEmailSender> _logger;

        public SmtpEmailSender(IOptions<EmailSettings> settings, ILogger<SmtpEmailSender> logger)
        {
            _settings = settings.Value;
            _logger = logger;
        }

        public async Task SendAsync(string toEmail, string toName, string subject, string htmlBody)
        {
            if (string.IsNullOrEmpty(_settings.Host) || string.IsNullOrEmpty(_settings.From))
            {
                _logger.LogWarning("Email ayarları eksik (Host veya From boş). Gönderim yapılamadı. Alıcı: {Email}", toEmail);
                throw new InvalidOperationException("SMTP ayarları eksik. Email gönderilemedi.");
            }

            var message = new MimeMessage();
            message.From.Add(new MailboxAddress(_settings.FromName, _settings.From));
            message.To.Add(new MailboxAddress(toName, toEmail));
            message.Subject = subject;

            var bodyBuilder = new BodyBuilder { HtmlBody = htmlBody };
            message.Body = bodyBuilder.ToMessageBody();

            using var client = new SmtpClient();

            try
            {
                var secureOption = _settings.EnableSsl
                    ? SecureSocketOptions.StartTls
                    : SecureSocketOptions.None;

                await client.ConnectAsync(_settings.Host, _settings.Port, secureOption);
                await client.AuthenticateAsync(_settings.Username, _settings.Password);
                await client.SendAsync(message);

                _logger.LogInformation("Email gönderildi. Alıcı: {Email}, Konu: {Subject}", toEmail, subject);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Email gönderilemedi. Alıcı: {Email}", toEmail);
                throw;
            }
            finally
            {
                await client.DisconnectAsync(true);
            }
        }
    }
}
