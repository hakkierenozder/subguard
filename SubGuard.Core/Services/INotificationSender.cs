using SubGuard.Core.Models;

namespace SubGuard.Core.Services
{
    public enum NotificationChannel { Email, Push, Sms }

    /// <summary>
    /// Bildirim gönderme abstraction'ı.
    /// Her kanal (email, push, SMS) bu interface'i implemente eder.
    /// NotificationService, IEnumerable&lt;INotificationSender&gt; alarak tüm aktif kanalları tetikler.
    /// </summary>
    public interface INotificationSender
    {
        NotificationChannel Channel { get; }
        Task SendAsync(NotificationMessage message, CancellationToken ct = default);
    }
}
