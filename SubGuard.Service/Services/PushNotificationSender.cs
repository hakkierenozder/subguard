using SubGuard.Core.Models;
using SubGuard.Core.Services;

namespace SubGuard.Service.Services
{
    /// <summary>
    /// INotificationSender → Push kanalı adaptörü.
    /// IPushNotificationSender (ExpoPushNotificationSender) üzerini sararak unified interface'e uyum sağlar.
    /// PushToken boşsa gönderimi sessizce atlar.
    /// </summary>
    public class PushNotificationSender : INotificationSender
    {
        private readonly IPushNotificationSender _pushSender;

        public PushNotificationSender(IPushNotificationSender pushSender)
        {
            _pushSender = pushSender;
        }

        public NotificationChannel Channel => NotificationChannel.Push;

        public Task SendAsync(NotificationMessage message, CancellationToken ct = default)
        {
            if (string.IsNullOrEmpty(message.PushToken))
                return Task.CompletedTask;

            return _pushSender.SendAsync(message.PushToken, message.Title, message.Body, message.Data);
        }
    }
}
