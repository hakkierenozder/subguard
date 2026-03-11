using SubGuard.Core.Models;
using SubGuard.Core.Services;

namespace SubGuard.Service.Services
{
    /// <summary>
    /// INotificationSender → Email kanalı adaptörü.
    /// IEmailSender (SmtpEmailSender) üzerini sararak unified interface'e uyum sağlar.
    /// </summary>
    public class EmailNotificationSender : INotificationSender
    {
        private readonly IEmailSender _emailSender;

        public EmailNotificationSender(IEmailSender emailSender)
        {
            _emailSender = emailSender;
        }

        public NotificationChannel Channel => NotificationChannel.Email;

        public Task SendAsync(NotificationMessage message, CancellationToken ct = default)
            => _emailSender.SendAsync(message.ToEmail, message.ToName, message.Title, message.HtmlBody);
    }
}
