namespace SubGuard.Core.Models
{
    /// <summary>
    /// Tüm bildirim kanallarına (email, push, SMS) iletilecek mesaj verisi.
    /// INotificationSender implementasyonları bu modeli kullanarak kanallarına uygun gönderim yapar.
    /// </summary>
    public class NotificationMessage
    {
        public string ToEmail { get; set; } = string.Empty;
        public string ToName { get; set; } = string.Empty;
        public string? PushToken { get; set; }
        public string Title { get; set; } = string.Empty;

        /// <summary>Plain-text body (push, SMS için)</summary>
        public string Body { get; set; } = string.Empty;

        /// <summary>HTML body (email için)</summary>
        public string HtmlBody { get; set; } = string.Empty;

        /// <summary>Push bildirimlerine eklenecek opsiyonel veri paketi</summary>
        public object? Data { get; set; }
    }
}
